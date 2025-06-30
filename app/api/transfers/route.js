import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

            const [sourceStorage, destinationStorage] = await Promise.all([
                prisma.storage.findUnique({ where: { id: transfer.sourceStorageId }, select: { name: true } }),
                prisma.storage.findUnique({ where: { id: transfer.destinationStorageId }, select: { name: true } })
            ]);

            const enrichedTransfer = {
                ...transfer,
                sourceStorageName: sourceStorage?.name || 'Unknown',
                destinationStorageName: destinationStorage?.name || 'Unknown',
            };
            return NextResponse.json(enrichedTransfer);
        }

        // Fetch all transfers
        const [transfers, storages] = await Promise.all([
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
            })
        ]);

        const storageMap = new Map(storages.map(s => [s.id, s.name]));

        const enrichedTransfers = transfers.map(transfer => ({
            ...transfer,
            sourceStorageName: storageMap.get(transfer.sourceStorageId) || 'Unknown',
            destinationStorageName: storageMap.get(transfer.destinationStorageId) || 'Unknown',
        }));

        return NextResponse.json(enrichedTransfers);

    } catch (error) {
        console.error('[TRANSFERS_GET_ERROR]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 