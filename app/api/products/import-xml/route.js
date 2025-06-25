import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { products, updateQuantities } = await req.json();
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'Invalid products array' }, { status: 400 });
    }
    for (const product of products) {
      if (!product.barcode || !product.name || typeof product.clientPrice !== 'number') {
        continue; // skip invalid
      }
      // Find existing product (if any)
      const existing = await prisma.product.findUnique({
        where: { barcode: String(product.barcode) },
      });
      let updateData = {
        name: product.name,
        clientPrice: product.clientPrice,
      };
      if (updateQuantities && typeof product.quantity === 'number') {
        if (existing) {
          updateData.quantity = (existing.quantity || 0) + product.quantity;
        } else {
          updateData.quantity = product.quantity;
        }
      }
      const createData = {
        barcode: String(product.barcode),
        name: product.name,
        clientPrice: product.clientPrice,
        quantity: typeof product.quantity === 'number' ? product.quantity : 0,
      };
      await prisma.product.upsert({
        where: { barcode: String(product.barcode) },
        update: updateData,
        create: createData,
      });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Import XML error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 