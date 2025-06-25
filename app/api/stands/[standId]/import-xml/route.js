import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req, { params }) {
  try {
    const { products } = await req.json();
    const standId = params.standId;
    if (!Array.isArray(products) || !standId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    for (const product of products) {
      if (!product.barcode || typeof product.quantity !== 'number') continue;
      // Find the product by barcode
      const dbProduct = await prisma.product.findUnique({
        where: { barcode: String(product.barcode) },
        select: { id: true },
      });
      if (!dbProduct) continue; // skip if product not found
      // Find existing standProduct
      const existing = await prisma.standProduct.findUnique({
        where: {
          standId_productId: {
            standId,
            productId: dbProduct.id,
          },
        },
      });
      if (existing) {
        await prisma.standProduct.update({
          where: { standId_productId: { standId, productId: dbProduct.id } },
          data: { quantity: existing.quantity + product.quantity },
        });
      } else {
        await prisma.standProduct.create({
          data: {
            standId,
            productId: dbProduct.id,
            quantity: product.quantity,
          },
        });
      }
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Import Stand XML error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 