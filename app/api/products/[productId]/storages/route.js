import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  const { productId } = await params;
  try {
    const storageProducts = await prisma.storageProduct.findMany({
      where: { productId },
      include: {
        storage: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        storage: { name: 'asc' },
      },
    });
    return NextResponse.json(
      storageProducts.map(sp => ({
        storage: sp.storage,
        quantity: sp.quantity,
      }))
    );
  } catch (error) {
    console.error('[PRODUCT_STORAGES_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 