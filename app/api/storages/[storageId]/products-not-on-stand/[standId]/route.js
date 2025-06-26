import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  const { storageId, standId } = await params;
  try {
    // Get all productIds already on the stand
    const standProducts = await prisma.standProduct.findMany({
      where: { standId },
      select: { productId: true },
    });
    const productIdsOnStand = standProducts.map(sp => sp.productId);

    // Get all products in the storage that are not on the stand
    const storageProducts = await prisma.storageProduct.findMany({
      where: {
        storageId,
        NOT: { productId: { in: productIdsOnStand } },
      },
      include: {
        product: true,
      },
      orderBy: {
        product: { name: 'asc' },
      },
    });

    return NextResponse.json(storageProducts.map(sp => sp.product));
  } catch (error) {
    console.error('[STORAGE_PRODUCTS_NOT_ON_STAND_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 