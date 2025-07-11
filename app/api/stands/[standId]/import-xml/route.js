import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req, context) {
  try {
    const { standId } = await context.params;
    const { products, fileName } = await req.json();
    console.log('IMPORT XML: standId:', standId, 'products:', products);
    if (!Array.isArray(products) || !standId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Debug: log the fileName being imported
    console.log('[IMPORT] Attempting import with fileName:', fileName);

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const importedProductIds = [];
    for (const product of products) {
      if (!product.barcode || typeof product.quantity !== 'number') continue;

      // Use 'price' from XML as deliveryPrice, fallback to clientPrice, then deliveryPrice, then 0
      const deliveryPrice =
        typeof product.price === 'number'
          ? product.price
          : typeof product.clientPrice === 'number'
            ? product.clientPrice
            : (product.deliveryPrice || 0);
      console.log('[IMPORT-XML][STAND] Incoming product:', product);
      console.log('[IMPORT-XML][STAND] Computed deliveryPrice:', deliveryPrice);

      let dbProduct = await prisma.product.findUnique({
        where: { barcode: String(product.barcode) },
      });

      if (!dbProduct) {
        console.log('[IMPORT-XML][STAND] Creating product with:', {
          barcode: String(product.barcode),
          name: product.name || `Imported ${product.barcode}`,
          clientPrice: 0,
          deliveryPrice: deliveryPrice,
          quantity: product.quantity,
        });
        dbProduct = await prisma.product.create({
          data: {
            barcode: String(product.barcode),
            name: product.name || `Imported ${product.barcode}`,
            clientPrice: 0, // Always 0 on create
            deliveryPrice: deliveryPrice,
            quantity: product.quantity,
          },
        });
      } else {
        const updateData = {
          name: product.name,
          deliveryPrice: deliveryPrice,
          // Do NOT update clientPrice
        };
        updateData.quantity = { increment: product.quantity };
        if (product.shouldActivate) {
          updateData.active = true;
        }
        console.log('[IMPORT-XML][STAND] Updating product with:', updateData);
        dbProduct = await prisma.product.update({
          where: { id: dbProduct.id },
          data: updateData,
        });
      }

      importedProductIds.push({ productId: dbProduct.id, quantity: product.quantity });

      await prisma.standProduct.upsert({
        where: {
          standId_productId: {
            standId,
            productId: dbProduct.id,
          },
        },
        update: {
          quantity: {
            increment: product.quantity,
          },
        },
        create: {
          standId,
          productId: dbProduct.id,
          quantity: product.quantity,
        },
      });
    }

    // Create Import record first
    const importRecord = await prisma.import.create({
      data: {
        userId: session.user.id,
        standId,
        fileName: fileName || null,
      },
    });

    // Create ImportProduct records
    if (importedProductIds.length > 0) {
      await prisma.importProduct.createMany({
        data: importedProductIds.map(p => ({
          importId: importRecord.id,
          productId: p.productId,
          quantity: p.quantity,
        })),
      });
    }

    // Create Revision (type: 'import')
    if (importedProductIds.length > 0) {
      // Get next revision number
      const lastRevision = await prisma.revision.findFirst({ orderBy: { number: 'desc' }, select: { number: true } });
      const nextNumber = (lastRevision?.number || 0) + 1;
      // Fetch the stand to get its partnerId
      const stand = await prisma.stand.findUnique({
        where: { id: standId },
        include: { store: { include: { partner: true } } },
      });
      let partnerId = null;
      if (stand?.store?.partnerId) {
        partnerId = stand.store.partnerId;
      }
      await prisma.revision.create({
        data: {
          number: nextNumber,
          standId,
          userId: session.user.id,
          type: 'import',
          partnerId: partnerId,
          missingProducts: {
            create: importedProductIds.map(p => ({ productId: p.productId, missingQuantity: p.quantity })),
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err.code === 'P2002' && err.meta?.target?.includes('fileName')) {
      console.warn('[IMPORT] Duplicate fileName error:', fileName);
      return NextResponse.json({ error: 'A file with this name was already imported. Please rename the file and try again.' }, { status: 400 });
    }
    console.error('Import Stand XML error:', err, 'fileName:', fileName);
    if (err instanceof Error) {
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 