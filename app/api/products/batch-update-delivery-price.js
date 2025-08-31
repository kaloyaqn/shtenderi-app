import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { updates } = await req.json();
    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'Missing or invalid updates array' }, { status: 400 });
    }
    const results = [];
    for (const { barcode, deliveryPrice } of updates) {
      if (!barcode || typeof deliveryPrice !== 'number') continue;
      const updated = await prisma.product.updateMany({
        where: { barcode },
        data: { deliveryPrice },
      });
      results.push({ barcode, deliveryPrice, updatedCount: updated.count });
    }
    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error('Batch update delivery price error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 