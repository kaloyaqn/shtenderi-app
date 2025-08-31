import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  try {
    const { refundId } = params;
    const { storageId } = await req.json();
    if (!storageId) {
      return NextResponse.json({ error: 'storageId is required' }, { status: 400 });
    }
    // Fetch refund and products
    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: { refundProducts: true }
    });
    if (!refund) {
      return NextResponse.json({ error: 'Refund not found' }, { status: 404 });
    }
    // For each product, increment or create StorageProduct
    for (const rp of refund.refundProducts) {
      const existing = await prisma.storageProduct.findFirst({
        where: { storageId, productId: rp.productId }
      });
      if (existing) {
        await prisma.storageProduct.update({
          where: { id: existing.id },
          data: { quantity: { increment: rp.quantity } }
        });
      } else {
        await prisma.storageProduct.create({
          data: { storageId, productId: rp.productId, quantity: rp.quantity }
        });
      }
    }
    // Optionally, mark refund as returned
    await prisma.refund.update({
      where: { id: refundId },
      data: { returnedToStorageId: storageId, returnedAt: new Date() }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 