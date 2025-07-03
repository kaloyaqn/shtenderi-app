import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { sourceStorageId, destinationId, destinationType, products } = await req.json();

    if (!sourceStorageId || !destinationId || !destinationType || !Array.isArray(products) || products.length === 0) {
        return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }
    if (destinationType === 'STORAGE' && sourceStorageId === destinationId) {
        return NextResponse.json({ error: 'Source and destination cannot be the same for a storage-to-storage transfer.' }, { status: 400 });
    }

    try {
        if (destinationType === 'STORAGE') {
            // --- Storage-to-Storage Transfer ---
            const result = await handleStorageToStorageTransfer(sourceStorageId, destinationId, products, session.user.id);
            return NextResponse.json(result, { status: 200 });
        } else if (destinationType === 'STAND') {
            // --- Storage-to-Stand Transfer ---
            const result = await handleStorageToStandTransfer(sourceStorageId, destinationId, products, session.user.id);
            return NextResponse.json(result, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Invalid destination type' }, { status: 400 });
        }
    } catch (error) {
        console.error('[TRANSFER_POST_ERROR]', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

async function handleStorageToStorageTransfer(sourceStorageId, destinationStorageId, products, userId) {
    return prisma.$transaction(async (tx) => {
        // 1. Validate that products exist, but do not move stock yet.
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

        // 2. Create Transfer record in PENDING state
        const transfer = await tx.transfer.create({
            data: {
                sourceStorageId,
                destinationStorageId,
                userId,
                status: 'PENDING', // Explicitly set as PENDING
                products: {
                    create: products.map(p => ({
                        productId: p.productId,
                        quantity: p.quantity,
                    })),
                },
            },
        });

        // No revision is created for storage-to-storage transfers
        return { message: "Transfer initiated successfully and is pending confirmation.", transferId: transfer.id };
    });
}

async function handleStorageToStandTransfer(sourceStorageId, standId, products, userId) {
    return prisma.$transaction(async (tx) => {
        // 1. Get Stand and Partner info
        const stand = await tx.stand.findUnique({
            where: { id: standId },
            include: { store: { include: { partner: true } } }
        });
        if (!stand || !stand.store?.partner) {
            throw new Error('Stand or associated partner not found.');
        }

        // 2. Validate stock and perform movements from source storage
        await validateAndMoveStock(tx, sourceStorageId, products);

        // 3. Upsert products on the destination stand
        for (const product of products) {
            await tx.standProduct.upsert({
                where: { standId_productId: { standId, productId: product.productId } },
                update: { quantity: { increment: product.quantity } },
                create: { standId, productId: product.productId, quantity: product.quantity },
            });
        }

        // 4. Get next revision number
        const lastRevision = await tx.revision.findFirst({ orderBy: { number: 'desc' }, select: { number: true } });
        const nextNumber = (lastRevision?.number || 0) + 1;

        // 5. Create a Revision (as a sale document)
        const revision = await tx.revision.create({
            data: {
                number: nextNumber,
                standId: standId,
                partnerId: stand.store.partner.id,
                userId: userId,
                missingProducts: {
                    create: products.map(p => ({
                        productId: p.productId,
                        missingQuantity: p.quantity,
                    })),
                },
            },
        });

        return { message: 'Storage-to-stand transfer successful', revisionId: revision.id };
    });
}

// Helper function to validate stock and decrement from source
async function validateAndMoveStock(tx, sourceStorageId, products) {
    for (const product of products) {
        const storageProduct = await tx.storageProduct.findFirst({
            where: { storageId: sourceStorageId, productId: product.productId },
        });
        if (!storageProduct || storageProduct.quantity < product.quantity) {
            throw new Error(`Insufficient stock for product ID: ${product.productId}`);
        }
        await tx.storageProduct.update({
            where: { id: storageProduct.id },
            data: { quantity: { decrement: product.quantity } },
        });
    }
} 