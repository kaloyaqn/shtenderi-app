import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getEffectivePrice } from '@/lib/pricing/get-effective-price';

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const transferId = searchParams.get('id');

    try {
        // Fetch a single transfer by ID
        if (transferId) {
            const transfer = await prisma.transfer.findUnique({
                where: { id: transferId },
                include: {
                    user: { select: { name: true, email: true } },
                    products: {
                        include: {
                            product: { select: { name: true, barcode: true, clientPrice: true } }
                        }
                    }
                }
            });
            
            

            if (!transfer) {
                return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
            }

            const [sourceStorage, sourceStand, destinationStorage, destinationStand] = await Promise.all([
                prisma.storage.findUnique({ where: { id: transfer.sourceStorageId }, select: { name: true } }),
                prisma.stand.findUnique({ where: { id: transfer.sourceStorageId }, select: { name: true } }),
                prisma.storage.findUnique({ where: { id: transfer.destinationStorageId }, select: { name: true } }),
                prisma.stand.findUnique({ 
                    where: { id: transfer.destinationStorageId }, 
                    select: { name: true, store: { select: { name: true, partnerId: true } } }
                })
            ]);

            // Compute effective prices if destination is a stand with a partner
            const partnerId = destinationStand?.store?.partnerId || null;
            let productsWithEffective = transfer.products;
            if (partnerId) {
                productsWithEffective = await Promise.all(
                  transfer.products.map(async (tp) => {
                    const effectivePrice = await getEffectivePrice({ productId: tp.productId, partnerId });
                    return { ...tp, effectivePrice };
                  })
                );
            }

            const enrichedTransfer = {
                ...transfer,
                products: productsWithEffective,
                sourceStorageName: sourceStorage?.name || sourceStand?.name || 'Unknown',
                destinationStorageName: destinationStorage?.name || destinationStand?.name || 'Unknown',
                destinationType: destinationStand ? 'STAND' : 'STORAGE',
                destinationStoreName: destinationStand?.store?.name || null,
            };
            return NextResponse.json(enrichedTransfer);
        }

        // Fetch all transfers
        const [transfers, storages, stands] = await Promise.all([
            prisma.transfer.findMany({
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        }
                    },
                    products: {
                        include: {
                            product: {
                                select: {
                                    name: true,
                                    barcode: true,
                                    clientPrice: true,
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc',
                }
            }),
            prisma.storage.findMany({
                select: {
                    id: true,
                    name: true,
                }
            }),
            prisma.stand.findMany({
                select: {
                    id: true,
                    name: true,
                    store: {
                        select: {
                            name: true,
                            partnerId: true,
                        }
                    }
                }
            })
        ]);

        const storageMap = new Map(storages.map(s => [s.id, s.name]));
        const standMap = new Map(stands.map(s => [s.id, { name: s.name, storeName: s.store?.name, partnerId: s.store?.partnerId }]));

        const enrichedTransfers = await Promise.all(
          transfers.map(async (transfer) => {
            const destinationStand = standMap.get(transfer.destinationStorageId);
            const sourceStand = standMap.get(transfer.sourceStorageId);
            const partnerId = destinationStand?.partnerId || null;
            let productsWithEffective = transfer.products;
            if (partnerId) {
              productsWithEffective = await Promise.all(
                transfer.products.map(async (tp) => {
                  const effectivePrice = await getEffectivePrice({ productId: tp.productId, partnerId });
                  return { ...tp, effectivePrice };
                })
              );
            }
            return {
              ...transfer,
              products: productsWithEffective,
              sourceStorageName: storageMap.get(transfer.sourceStorageId) || sourceStand?.name || 'Unknown',
              destinationStorageName: storageMap.get(transfer.destinationStorageId) || destinationStand?.name || 'Unknown',
              destinationType: destinationStand ? 'STAND' : 'STORAGE',
              destinationStoreName: destinationStand?.storeName || null,
            };
          })
        );

        return NextResponse.json(enrichedTransfers);

    } catch (error) {
        console.error('[TRANSFERS_GET_ERROR]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 