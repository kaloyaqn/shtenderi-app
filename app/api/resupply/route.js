import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/get-session-better-auth';


export async function POST(req) {
    const session = await getServerSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { sourceStorageId, destinationStandId, products } = await req.json();

    if (!sourceStorageId || !destinationStandId || !Array.isArray(products) || products.length === 0) {
        return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get Stand and Partner info
            const stand = await tx.stand.findUnique({
                where: { id: destinationStandId },
                select: { 
                    id: true,
                    store: { 
                        select: { 
                            id: true,
                            partnerId: true,
                            partner: { select: { id: true } }
                        } 
                    }
                }
            });
            // To get the partner id:
            const partnerId = stand?.store?.partner_id || stand?.store?.partner?.id;
            if (!stand || !stand.store?.partner) {
                throw new Error('Stand or associated partner not found.');
            }

            // 2. Validate that products exist and have sufficient stock, but do not move stock yet
            for (const product of products) {
                const p = await tx.product.findUnique({ where: { id: product.productId } });
                if (!p) throw new Error(`Product with ID ${product.productId} not found.`);

                const sp = await tx.storageProduct.findFirst({
                    where: { storageId: sourceStorageId, productId: product.productId }
                });
                if (!sp || sp.quantity < product.quantity) {
                    throw new Error(`Insufficient stock for ${p.name}.`);
                }
            }

            // 3. Create Transfer record in PENDING state (instead of immediately moving stock)
            const transfer = await tx.transfer.create({
                data: {
                    sourceStorageId,
                    destinationStorageId: destinationStandId, // Using destinationStorageId for stand transfers
                    userId: session.user.id,
                    status: 'PENDING',
                    products: {
                        create: products.map(p => ({
                            productId: p.productId,
                            quantity: p.quantity,
                        })),
                    },
                },
            });

            return { message: "Transfer initiated successfully and is pending confirmation.", transferId: transfer.id };
        });

        return NextResponse.json(result, { status: 201 });

    } catch (error) {
        console.error('[RESUPPLY_POST_ERROR]', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
} 