import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { sourceStorageId, destinationStandId, products } = await req.json();

    if (!sourceStorageId || !destinationStandId || !Array.isArray(products) || products.length === 0) {
        return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Validate stock levels in the source storage
            for (const product of products) {
                const storageProduct = await tx.storageProduct.findFirst({
                    where: {
                        storageId: sourceStorageId,
                        productId: product.productId,
                    },
                });
                if (!storageProduct || storageProduct.quantity < product.quantity) {
                    throw new Error(`Insufficient stock for product ID: ${product.productId}`);
                }
            }

            // 2. Decrement stock from source storage
            for (const product of products) {
                await tx.storageProduct.updateMany({
                    where: {
                        storageId: sourceStorageId,
                        productId: product.productId,
                    },
                    data: {
                        quantity: {
                            decrement: product.quantity,
                        },
                    },
                });
            }

            // 3. Increment stock on destination stand (upsert)
            for (const product of products) {
                await tx.standProduct.upsert({
                    where: {
                        standId_productId: {
                            standId: destinationStandId,
                            productId: product.productId,
                        },
                    },
                    update: {
                        quantity: {
                            increment: product.quantity,
                        },
                    },
                    create: {
                        standId: destinationStandId,
                        productId: product.productId,
                        quantity: product.quantity,
                    },
                });
            }

            // 4. Create a Revision to log this as a "Sale"
            const stand = await tx.stand.findUnique({
                where: { id: destinationStandId },
                include: { store: true },
            });
            if (!stand) throw new Error('Destination stand not found.');

            const lastRevision = await tx.revision.findFirst({
                orderBy: { number: 'desc' },
                select: { number: true },
            });
            const nextNumber = (lastRevision?.number || 0) + 1;

            const revision = await tx.revision.create({
                data: {
                    number: nextNumber,
                    standId: destinationStandId,
                    partnerId: stand.store.partnerId,
                    userId: session.user.id,
                    products: {
                        create: products.map(p => ({
                            productId: p.productId,
                            quantity: p.quantity,
                            // Since this is a resupply, we assume expected equals actual
                            expectedQuantity: p.quantity, 
                            actualQuantity: p.quantity,
                        }))
                    }
                    // Note: 'missingProducts' will be empty for a resupply.
                    // A new field could be added to the Revision model to differentiate,
                    // but for now, the absence of missing products indicates a resupply.
                },
            });

            return revision;
        });

        return NextResponse.json(result, { status: 201 });

    } catch (error) {
        console.error('[RESUPPLY_POST_ERROR]', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
} 