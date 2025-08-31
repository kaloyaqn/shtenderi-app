import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { standId } = params;
  const { storageId, products } = await req.json();
  if (!storageId || !standId || !products || products.length === 0) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }
  try {
    const insufficient = [];
    await prisma.$transaction(async (tx) => {
      for (const product of products) {
        // 1. Decrement from storage
        const storageProduct = await tx.storageProduct.findFirst({
          where: { storageId, productId: product.productId },
        });
        if (!storageProduct || storageProduct.quantity < product.quantity) {
          insufficient.push({
            productId: product.productId,
            productName: product.name,
            needed: product.quantity,
            available: storageProduct ? storageProduct.quantity : 0,
          });
        }
      }
      if (insufficient.length > 0) {
        const err = new Error('Insufficient stock');
        err.insufficient = insufficient;
        throw err;
      }
      for (const product of products) {
        await tx.storageProduct.update({
          where: { storageId_productId: { storageId, productId: product.productId } },
          data: { quantity: { decrement: product.quantity } },
        });
        await tx.standProduct.upsert({
          where: { standId_productId: { standId, productId: product.productId } },
          update: { quantity: { increment: product.quantity } },
          create: { standId, productId: product.productId, quantity: product.quantity },
        });
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.message === 'Insufficient stock') {
      return NextResponse.json({ error: 'Insufficient stock', insufficient: error.insufficient || [] }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 