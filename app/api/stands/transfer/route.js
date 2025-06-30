import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { sourceStandId, destinationStandId, products } = await req.json();

    if (!sourceStandId || !destinationStandId || !products || products.length === 0) {
        return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Fetch stands and verify they belong to the same partner
            const sourceStand = await tx.stand.findUnique({ where: { id: sourceStandId } });
            const destinationStand = await tx.stand.findUnique({ where: { id: destinationStandId } });

            if (!sourceStand || !destinationStand) {
                throw new Error('Source or destination stand not found.');
            }
            if (sourceStand.partnerId !== destinationStand.partnerId) {
                throw new Error('Stands do not belong to the same partner.');
            }
            if (sourceStand.id === destinationStand.id) {
                throw new Error('Source and destination stands cannot be the same.');
            }

            for (const product of products) {
                // 2. Decrement from source stand
                const sourceProduct = await tx.standProduct.findFirst({
                    where: {
                        standId: sourceStandId,
                        productId: product.productId
                    }
                });

                if (!sourceProduct || sourceProduct.quantity < product.quantity) {
                    throw new Error(`Insufficient stock for product ID ${product.productId} in the source stand.`);
                }

                await tx.standProduct.update({
                    where: { id: sourceProduct.id },
                    data: { quantity: { decrement: product.quantity } },
                });
                
                // 3. Increment/upsert in destination stand
                await tx.standProduct.upsert({
                    where: {
                        standId_productId: {
                            standId: destinationStandId,
                            productId: product.productId,
                        },
                    },
                    update: { quantity: { increment: product.quantity } },
                    create: {
                        standId: destinationStandId,
                        productId: product.productId,
                        quantity: product.quantity,
                    },
                });
            }

            return { success: true, message: 'Transfer completed successfully.' };
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('[STAND_TRANSFER_POST_ERROR]', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
} 