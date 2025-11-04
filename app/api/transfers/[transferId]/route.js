import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { transferId } = await params;
        const { products } = await req.json();
        if (!Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ error: 'Products are required' }, { status: 400 });
        }

        // Validate transfer exists and is pending
        const transfer = await prisma.transfer.findUnique({ where: { id: transferId } });
        if (!transfer) return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
        if (transfer.status !== 'PENDING') return NextResponse.json({ error: 'Only pending transfers can be edited' }, { status: 400 });

        // Validate products
        for (const p of products) {
            if (!p?.productId || typeof p.quantity !== 'number' || p.quantity <= 0) {
                return NextResponse.json({ error: 'Each product must have productId and quantity>0' }, { status: 400 });
            }
            const exists = await prisma.product.findUnique({ where: { id: p.productId }, select: { id: true } });
            if (!exists) return NextResponse.json({ error: `Product not found: ${p.productId}` }, { status: 404 });
        }

        // Validate stock in source storage (not moving stock yet)
        for (const p of products) {
            const sp = await prisma.storageProduct.findFirst({
                where: { storageId: transfer.sourceStorageId, productId: p.productId },
                select: { quantity: true }
            });
            if (!sp || Number(sp.quantity) < Number(p.quantity)) {
                return NextResponse.json({ error: `Insufficient stock for product ${p.productId}` }, { status: 400 });
            }
        }

        // Update transfer products: replace all with new set
        await prisma.$transaction(async (tx) => {
            await tx.transferProduct.deleteMany({ where: { transferId } });
            await tx.transferProduct.createMany({
                data: products.map((p) => ({ transferId, productId: p.productId, quantity: p.quantity })),
            });
        });

        const updated = await prisma.transfer.findUnique({
            where: { id: transferId },
            include: { products: { include: { product: true } } }
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('[TRANSFER_UPDATE_ERROR]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { transferId } = await params;
        const transfer = await prisma.transfer.findUnique({ where: { id: transferId } });
        if (!transfer) return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
        if (transfer.status !== 'PENDING') return NextResponse.json({ error: 'Only pending transfers can be deleted' }, { status: 400 });

        await prisma.$transaction(async (tx) => {
            await tx.transferProduct.deleteMany({ where: { transferId } });
            await tx.transfer.delete({ where: { id: transferId } });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[TRANSFER_DELETE_ERROR]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


