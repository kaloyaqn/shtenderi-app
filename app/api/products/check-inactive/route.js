import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { barcodes } = await req.json();
    if (!barcodes || !Array.isArray(barcodes)) {
      return NextResponse.json({ error: 'Barcodes are required' }, { status: 400 });
    }

    const barcodesAsString = barcodes.map((bc) => String(bc));

    const inactiveProducts = await prisma.product.findMany({
      where: {
        barcode: { in: barcodesAsString },
        clientPrice: 0,
      },
      select: {
        barcode: true,
        name: true,
        clientPrice: true,
      },
    });
    
    console.log('[CHECK-INACTIVE] Checking barcodes:', barcodesAsString);
    console.log('[CHECK-INACTIVE] Found inactive products:', inactiveProducts);

    return NextResponse.json({ inactiveProducts });
  } catch (error) {
    console.error('[PRODUCTS_CHECK_INACTIVE_ERROR]', error);
    return NextResponse.json({ error: 'Failed to check products' }, { status: 500 });
  }
} 