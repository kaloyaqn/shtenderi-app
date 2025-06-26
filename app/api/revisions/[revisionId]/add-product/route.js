import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req, { params }) {
  const { revisionId } = await params;
  const { productId, standId, quantity } = await req.json();

  if (!productId || !standId || !quantity) {
    return new NextResponse('Missing productId, standId, or quantity', { status: 400 });
  }

  try {
    // 1. Add to stand if not present
    let standProduct = await prisma.standProduct.findUnique({
      where: {
        standId_productId: {
          standId,
          productId,
        },
      },
    });
    if (!standProduct) {
      standProduct = await prisma.standProduct.create({
        data: {
          standId,
          productId,
          quantity,
        },
      });
    }

    // 2. Add to revision's missing products if not present
    let missingProduct = await prisma.missingProduct.findFirst({
      where: {
        revisionId,
        productId,
      },
    });
    if (!missingProduct) {
      missingProduct = await prisma.missingProduct.create({
        data: {
          revisionId,
          productId,
          missingQuantity: quantity,
        },
      });
    }

    return NextResponse.json({ success: true, standProduct, missingProduct });
  } catch (error) {
    console.error('[REVISION_ADD_PRODUCT]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 