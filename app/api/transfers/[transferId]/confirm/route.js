import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcrypt';

export async function POST(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { transferId } = params;
    const { password } = await req.json();

    if (!password) {
        return NextResponse.json({ error: 'Password is required for confirmation.' }, { status: 400 });
    }

    try {
        // 1. Fetch the user from DB to get their hashed password
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user || !user.password) {
            return NextResponse.json({ error: 'User not found or password not set.' }, { status: 404 });
        }

        // 2. Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
        }

        // 3. Proceed with the transfer logic inside a transaction
        const result = await prisma.$transaction(async (tx) => {
            const transfer = await tx.transfer.findUnique({
                where: { id: transferId },
                include: { products: true }
            });

            if (!transfer) {
                throw new Error('Transfer not found.');
            }
            if (transfer.status === 'COMPLETED') {
                throw new Error('This transfer has already been completed.');
            }

            // Decrement from source
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

            // Increment in destination
            for (const product of transfer.products) {
                await tx.storageProduct.upsert({
                    where: {
                        storageId_productId: {
                            storageId: transfer.destinationStorageId,
                            productId: product.productId,
                        },
                    },
                    update: { quantity: { increment: product.quantity } },
                    create: {
                        storageId: transfer.destinationStorageId,
                        productId: product.productId,
                        quantity: product.quantity,
                    },
                });
            }

            // Update transfer status
            const updatedTransfer = await tx.transfer.update({
                where: { id: transferId },
                data: {
                    status: 'COMPLETED',
                    confirmedById: session.user.id,
                    confirmedAt: new Date(),
                },
            });

            return updatedTransfer;
        });

        return NextResponse.json({ message: 'Transfer confirmed successfully!', transfer: result });

    } catch (error) {
        console.error('[TRANSFER_CONFIRM_POST_ERROR]', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
} 