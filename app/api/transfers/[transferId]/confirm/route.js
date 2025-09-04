import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcrypt';
import { getEffectivePrice } from '@/lib/pricing/get-effective-price';

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

        // 3. Phase 1: ONLY inventory and status inside a short transaction
        const transfer = await prisma.$transaction(async (tx) => {
            const t = await tx.transfer.findUnique({
                where: { id: transferId },
                include: { products: true }
            });

            if (!t) {
                throw new Error('Transfer not found.');
            }
            if (t.status === 'COMPLETED') {
                throw new Error('This transfer has already been completed.');
            }

            // Decrement from source
            for (const product of t.products) {
                await tx.storageProduct.updateMany({
                    where: {
                        storageId: t.sourceStorageId,
                        productId: product.productId,
                    },
                    data: {
                        quantity: { decrement: product.quantity },
                    },
                });
            }

            // Increment in destination
            for (const product of t.products) {
                await tx.storageProduct.upsert({
                    where: {
                        storageId_productId: {
                            storageId: t.destinationStorageId,
                            productId: product.productId,
                        },
                    },
                    update: { quantity: { increment: product.quantity } },
                    create: {
                        storageId: t.destinationStorageId,
                        productId: product.productId,
                        quantity: product.quantity,
                    },
                });
            }

            // Update transfer status
            await tx.transfer.update({
                where: { id: transferId },
                data: {
                    status: 'COMPLETED',
                    confirmedById: session.user.id,
                    confirmedAt: new Date(),
                },
            });

            return t;
        });

        // 4. Phase 2: outside tx — create revision with effective prices
        // --- DEBUG: Check if transfer.destinationStorageId is correct and if partner is being fetched ---
        let stand, partner;
        try {
            stand = await prisma.stand.findUnique({
                where: { id: transfer.destinationStorageId },
                include: { store: { include: { partner: true } } }
            });
            if (!stand) {
                return NextResponse.json({ error: 'Destination stand not found.' }, { status: 404 });
            }
            if (!stand.store) {
                return NextResponse.json({ error: 'Store not found for destination stand.' }, { status: 404 });
            }
            if (!stand.store.partner) {
                return NextResponse.json({ error: 'Partner not found for store.' }, { status: 404 });
            }
            partner = stand.store.partner;
        } catch (err) {
            console.error('[TRANSFER_CONFIRM_PARTNER_FETCH_ERROR]', err);
            return NextResponse.json({ error: 'Failed to fetch partner for destination stand.' }, { status: 500 });
        }

        // --- END DEBUG ---

        if (stand && partner) {
            const revision = await prisma.revision.create({
                data: {
                    standId: stand.id,
                    partnerId: partner.id,
                    userId: session.user.id,
                    type: 'manual',
                },
            });

            // Compute prices concurrently, then persist
            const lines = await Promise.all(
                transfer.products.map(async (tp) => {
                    const priceAtSale = await getEffectivePrice({
                        productId: tp.productId,
                        partnerId: partner.id,
                    });
                    return {
                        revisionId: revision.id,
                        productId: tp.productId,
                        missingQuantity: tp.quantity,
                        priceAtSale,
                    };
                })
            );
            for (const line of lines) {
                await prisma.missingProduct.create({ data: line });
            }
        }

        return NextResponse.json({ message: 'Transfer confirmed successfully!', transfer });

    } catch (error) {
        console.error('[TRANSFER_CONFIRM_POST_ERROR]', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
} 