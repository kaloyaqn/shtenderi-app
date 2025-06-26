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

    // Do the check and update atomically in a transaction
    let insufficient = [];
    const result = await prisma.$transaction(async (tx) => {
      insufficient = [];
      for (const missingProduct of revision.missingProducts) {
        const requiredQuantity = missingProduct.missingQuantity;
        const productId = missingProduct.productId;
        const standId = revision.standId;
        // Find the product in the selected storage
        const storageProduct = await tx.storageProduct.findUnique({
          where: {
            storageId_productId: {
              storageId,
              productId,
            },
          },
        });
        if (!storageProduct || storageProduct.quantity < requiredQuantity) {
          insufficient.push({
            name: missingProduct.product.name,
            barcode: missingProduct.product.barcode,
            required: requiredQuantity,
            available: storageProduct?.quantity || 0,
          });
        }
      }
      if (insufficient.length > 0) {
        // Throw to abort transaction
        throw { insufficient };
      }
      // All sufficient, do the update
      for (const missingProduct of revision.missingProducts) {
        const requiredQuantity = missingProduct.missingQuantity;
        const productId = missingProduct.productId;
        const standId = revision.standId;
        // Decrement quantity in the storage
        const storageProduct = await tx.storageProduct.findUnique({
          where: {
            storageId_productId: {
              storageId,
              productId,
            },
          },
        });
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
        // Increment quantity on the stand
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
      return true;
    }).catch((err) => {
      if (err && err.insufficient) {
        insufficient = err.insufficient;
        return false;
      }
      throw err;
    });

    if (!result && insufficient.length > 0) {
      return NextResponse.json({ insufficient }, { status: 409 });
    }

    return NextResponse.json({ success: true, message: 'Щандът е зареден успешно!' });

  } catch (error) {
    console.error('[RESUPPLY_ERROR]', error);
    return new NextResponse('Вътрешна грешка при зареждане', { status: 500 });
  }
} 