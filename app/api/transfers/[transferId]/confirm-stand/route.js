import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getEffectivePrice } from '@/lib/pricing/get-effective-price';

export async function POST(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { transferId } = await params;

    try {
        // Proceed with the transfer logic inside a transaction
        const result = await prisma.$transaction(async (tx) => {
            const transfer = await tx.transfer.findUnique({
                where: { id: transferId },
                include: { 
                    products: {
                        include: { product: true }
                    }
                }
            });

            if (!transfer) {
                throw new Error('Transfer not found.');
            }
            if (transfer.status === 'COMPLETED') {
                throw new Error('This transfer has already been completed.');
            }

            // 3. Get the destination stand info
            const stand = await tx.stand.findUnique({
                where: { id: transfer.destinationStorageId }, // Using destinationStorageId for stand ID
                include: { 
                    store: { 
                        select: { 
                            partnerId: true, 
                            partner: { select: { id: true } } 
                        } 
                    } 
                }
            });
            // To get the partnerId:
            // Try stand.store.partner_id first (if using snake_case), otherwise fallback to stand.store.partner.id
            const partnerId = stand?.store?.partner_id || stand?.store?.partner?.id;
            
            if (!stand || !stand.store?.partner) {
                throw new Error('Stand or associated partner not found.');
            }

            // 4. Decrement from source storage
            for (const product of transfer.products) {
                await tx.storageProduct.updateMany({
                    where: {
                        storageId: transfer.sourceStorageId,
                        productId: product.productId,
                    },
                    data: {
                        quantity: { decrement: product.quantity },
                    },
                });
            }

            // 5. Increment in destination stand
            for (const product of transfer.products) {
                await tx.standProduct.upsert({
                    where: {
                        standId_productId: {
                            standId: transfer.destinationStorageId, // This is the stand ID
                            productId: product.productId,
                        },
                    },
                    update: { quantity: { increment: product.quantity } },
                    create: {
                        standId: transfer.destinationStorageId, // This is the stand ID
                        productId: product.productId,
                        quantity: product.quantity,
                    },
                });
            }

            // 6. Get next revision number
            const lastRevision = await tx.revision.findFirst({ 
                orderBy: { number: 'desc' }, 
                select: { number: true } 
            });
            const nextNumber = (lastRevision?.number || 0) + 1;

            // Build missingProducts array for revision, using transfer.products
            const missingProducts = transfer.products.map(p => ({
                productId: p.productId,
                missingQuantity: p.quantity,
                givenQuantity: p.quantity,
                clientPrice: null // fallback, will be replaced below
            }));

            // Defensive: If partnerId is undefined, do not call getEffectivePrice with undefined partnerId
            let safePartnerId = partnerId;
            if (!safePartnerId) {
                safePartnerId = stand?.store?.partner_id || stand?.store?.partner?.id || null;
            }

            const missingProductsWithPrice = await Promise.all(
                missingProducts.map(async mp => ({
                    productId: mp.productId,
                    missingQuantity: mp.missingQuantity,
                    givenQuantity: mp.givenQuantity,
                    priceAtSale: safePartnerId
                        ? await getEffectivePrice({ productId: mp.productId, partnerId: safePartnerId })
                        : mp.clientPrice ?? 0
                }))
            );

            // 7. Create a Revision (as a sale document)
            const revision = await tx.revision.create({
                data: {
                    number: nextNumber,
                    standId: transfer.destinationStorageId, // This is the stand ID
                    partnerId: safePartnerId,
                    userId: session.user.id,
                    missingProducts: {
                        create: missingProductsWithPrice
                    }
                },
                include: { missingProducts: true }
            });

            // 8. Update transfer status
            const updatedTransfer = await tx.transfer.update({
                where: { id: transferId },
                data: {
                    status: 'COMPLETED',
                    confirmedById: session.user.id,
                    confirmedAt: new Date(),
                },
            });

            return { 
                success: true, 
                message: 'Transfer confirmed and revision created successfully.',
                transferId: updatedTransfer.id,
                revisionId: revision.id
            };
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('[TRANSFER_CONFIRM_STAND_ERROR]', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
} 