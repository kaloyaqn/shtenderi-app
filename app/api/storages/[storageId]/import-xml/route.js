import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req, { params }) {
  const { storageId } = await params;
  const { products: productsFromXml, fileName } = await req.json();

  if (!storageId || !Array.isArray(productsFromXml)) {
    return new NextResponse('Missing storageId or products data', { status: 400 });
  }

  // Debug: log the fileName being imported
  console.log('[IMPORT] Attempting import with fileName:', fileName);

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const importedProductIds = [];
    for (const product of productsFromXml) {
      if (!product.barcode || typeof product.quantity !== 'number') {
        console.warn('Skipping product with invalid data:', product);
        continue;
      }
      
      const xmlQuantity = product.quantity;

      // Use 'price' from XML as deliveryPrice
      const deliveryPrice = typeof product.price === 'number' ? product.price : (product.deliveryPrice || 0);

      // Always increment the global product quantity
      let dbProduct = await prisma.product.findUnique({
        where: { barcode: product.barcode },
      });

      if (dbProduct) {
        // Increment the global product quantity
        await prisma.product.update({
          where: { id: dbProduct.id },
          data: {
            name: product.name,
            deliveryPrice: deliveryPrice,
            // Do NOT update clientPrice
            quantity: { increment: xmlQuantity },
          },
        });
      } else {
        // If it doesn't exist, create it
        dbProduct = await prisma.product.create({
          data: {
            barcode: product.barcode,
            name: product.name || `XML Import ${product.barcode}`,
            clientPrice: 0, // Always 0 on create
            deliveryPrice: deliveryPrice,
            quantity: xmlQuantity,
          },
        });
      }
      importedProductIds.push({ productId: dbProduct.id, quantity: xmlQuantity });
      
      // Upsert the product in the specific storage
      await prisma.storageProduct.upsert({
        where: {
          storageId_productId: {
            storageId,
            productId: dbProduct.id,
          },
        },
        update: {
          quantity: { increment: xmlQuantity },
        },
        create: {
          storageId,
          productId: dbProduct.id,
          quantity: xmlQuantity,
        },
      });
    }

    // Create Import record first
    const importRecord = await prisma.import.create({
      data: {
        userId: session.user.id,
        storageId,
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
      await prisma.revision.create({
        data: {
          number: nextNumber,
          storageId,
          userId: session.user.id,
          type: 'import',
          missingProducts: {
            create: importedProductIds.map(p => ({ productId: p.productId, missingQuantity: p.quantity })),
          },
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Products imported successfully.' });

  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('fileName')) {
      console.warn('[IMPORT] Duplicate fileName error:', fileName);
      return new NextResponse('A file with this name was already imported. Please rename the file and try again.', { status: 400 });
    }
    console.error('[STORAGE_IMPORT_XML_ERROR]', error, 'fileName:', fileName);
    return new NextResponse('Internal server error during XML import.', { status: 500 });
  }
} 