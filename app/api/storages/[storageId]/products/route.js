import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    const { storageId } = await params;

    const products = await prisma.storageProduct.findMany({
      where: {
        storageId: storageId,
        // product: {
        //   isActive: true,
        // },
      },
      include: {
        product: true, // Include the full product details
      },
      orderBy: {
        product: {
          name: 'asc',
        },
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('[STORAGE_PRODUCTS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(req, { params }) {
    try {
      const { storageId } = await params;
      const body = await req.json();
      const { productId, quantity } = body;

      if (!productId || quantity === undefined) {
        return new NextResponse('Product ID and quantity are required', { status: 400 });
      }

      const numericQuantity = Number(quantity);
      if (isNaN(numericQuantity) || numericQuantity < 0) {
        return new NextResponse('Invalid quantity', { status: 400 });
      }

      const newStorageProduct = await prisma.storageProduct.upsert({
        where: {
            storageId_productId: {
                storageId: storageId,
                productId: productId
            }
        },
        update: {
            quantity: {
                increment: numericQuantity
            }
        },
        create: {
          storageId: storageId,
          productId: productId,
          quantity: numericQuantity,
        },
      });

      return NextResponse.json(newStorageProduct);
    } catch (error) {
      console.error('[STORAGE_PRODUCTS_POST]', error);
      return new NextResponse('Internal error', { status: 500 });
    }
}
