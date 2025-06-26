import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req, { params }) {
  try {
    const { storageProductId, storageId } = await params;
    const { quantity } = await req.json();

    if (quantity === undefined || Number(quantity) < 0) {
      return new NextResponse('Valid quantity is required', { status: 400 });
    }

    const updatedProduct = await prisma.storageProduct.update({
      where: { id: storageProductId },
      data: { quantity: Number(quantity) },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('[STORAGE_PRODUCT_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { storageProductId, storageId } = await params;

    await prisma.storageProduct.delete({
      where: { id: storageProductId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[STORAGE_PRODUCT_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 