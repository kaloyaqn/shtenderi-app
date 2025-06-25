import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { products } = await req.json();
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'Invalid products array' }, { status: 400 });
    }
    for (const product of products) {
      if (!product.barcode || !product.name || typeof product.clientPrice !== 'number') {
        continue; // skip invalid
      }
      await prisma.product.upsert({
        where: { barcode: String(product.barcode) },
        update: {
          name: product.name,
          clientPrice: product.clientPrice,
        },
        create: {
          barcode: String(product.barcode),
          name: product.name,
          clientPrice: product.clientPrice,
        },
      });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Import XML error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 