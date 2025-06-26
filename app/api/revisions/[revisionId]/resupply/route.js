import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req, { params }) {
  const { revisionId } = params;
  const { storageId } = await req.json();

  if (!storageId) {
    return new NextResponse('Storage ID is required', { status: 400 });
  }

  try {
    const revision = await prisma.revision.findUnique({
      where: { id: revisionId },
      include: {
        missingProducts: {
          include: {
            product: true,
          },
        },
        stand: true,
      },
    });

    if (!revision || !revision.stand) {
      return new NextResponse('Revision or associated stand not found', { status: 404 });
    }

    if (revision.missingProducts.length === 0) {
      return NextResponse.json({ message: 'No missing products to resupply.' });
    }

    // This is the core logic
    await prisma.$transaction(async (tx) => {
      for (const missingProduct of revision.missingProducts) {
        const requiredQuantity = missingProduct.missingQuantity;
        const productId = missingProduct.productId;
        const standId = revision.standId;

        // 1. Find the product in the selected storage
        const storageProduct = await tx.storageProduct.findUnique({
          where: {
            storageId_productId: {
              storageId,
              productId,
            },
          },
        });

        // 2. Check if there is enough quantity
        if (!storageProduct || storageProduct.quantity < requiredQuantity) {
          throw new Error(`Недостатъчна наличност в склада за продукт ${missingProduct.product.name}.
             Изискват се: ${requiredQuantity}, налични: ${storageProduct?.quantity || 0}`);
        }

        // 3. Decrement quantity in the storage
        await tx.storageProduct.update({
          where: {
            id: storageProduct.id,
          },
          data: {
            quantity: {
              decrement: requiredQuantity,
            },
          },
        });

        // 4. Increment quantity on the stand
        await tx.standProduct.update({
          where: {
            standId_productId: {
              standId,
              productId,
            },
          },
          data: {
            quantity: {
              increment: requiredQuantity,
            },
          },
        });
      }
    });

    return NextResponse.json({ success: true, message: 'Щандът е зареден успешно!' });

  } catch (error) {
    console.error('[RESUPPLY_ERROR]', error);
    // Provide a more specific error message if it's our custom one
    if (error instanceof Error && error.message.startsWith('Недостатъчна наличност')) {
        return new NextResponse(error.message, { status: 409 });
    }
    return new NextResponse('Вътрешна грешка при зареждане', { status: 500 });
  }
} 