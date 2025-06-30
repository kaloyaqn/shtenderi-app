import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { sourceStorageId, destinationStorageId, products } = await req.json();

    if (!sourceStorageId || !destinationStorageId || !Array.isArray(products) || products.length === 0) {
        return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }
    if (sourceStorageId === destinationStorageId) {
        return NextResponse.json({ error: 'Source and destination cannot be the same.' }, { status: 400 });
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

            // 3. Increment stock in destination storage (upsert)
            for (const product of products) {
                await tx.storageProduct.upsert({
                    where: {
                        storageId_productId: {
                            storageId: destinationStorageId,
                            productId: product.productId,
                        },
                    },
                    update: {
                        quantity: {
                            increment: product.quantity,
                        },
                    },
                    create: {
                        storageId: destinationStorageId,
                        productId: product.productId,
                        quantity: product.quantity,
                    },
                });
            }
            
            return { message: "Transfer successful" };
        });

        return NextResponse.json(result, { status: 200 });

    } catch (error) {
        console.error('[STORAGE_TRANSFER_POST_ERROR]', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
} 