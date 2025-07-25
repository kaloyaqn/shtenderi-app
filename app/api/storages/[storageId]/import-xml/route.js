import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req, { params }) {
  let fileName = null; // Declare fileName at function scope
  const { storageId } = await params;
  const { products: productsFromXml, fileName: fileNameFromRequest } = await req.json();
  fileName = fileNameFromRequest; // Assign to function-scoped variable

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
    const priceChanges = [];
    for (const product of productsFromXml) {
      if (!product.barcode || typeof product.quantity !== 'number') {
        console.warn('Skipping product with invalid data:', product);
        continue;
      }
      
      const xmlQuantity = product.quantity;

      // Use 'price' from XML as deliveryPrice, fallback to clientPrice, then deliveryPrice, then 0
      const deliveryPrice =
        typeof product.price === 'number'
          ? product.price
          : typeof product.clientPrice === 'number'
            ? product.clientPrice
            : (product.deliveryPrice || 0);
      console.log('[IMPORT-XML][STORAGE] Incoming product:', product);
      console.log('[IMPORT-XML][STORAGE] Computed deliveryPrice:', deliveryPrice);

      // Always increment the global product quantity
      let dbProduct = await prisma.product.findUnique({
        where: { barcode: product.barcode },
      });

      // Detect delivery price change
      if (dbProduct && typeof dbProduct.deliveryPrice === 'number' && dbProduct.deliveryPrice !== deliveryPrice) {
        priceChanges.push({
          barcode: dbProduct.barcode,
          name: dbProduct.name,
          oldPrice: dbProduct.deliveryPrice,
          newPrice: deliveryPrice
        });
      }

      if (dbProduct) {
        // Increment the global product quantity
        const updateData = {
          name: product.name,
          deliveryPrice: deliveryPrice,
          // Do NOT update clientPrice
          quantity: { increment: xmlQuantity },
        };
        if (product.shouldActivate) {
          updateData.active = true;
          console.log('[IMPORT-XML][STORAGE] Activating product:', product.barcode);
        }
        console.log('[IMPORT-XML][STORAGE] Updating product with:', updateData);
        await prisma.product.update({
          where: { id: dbProduct.id },
          data: updateData,
        });
      } else {
        // If it doesn't exist, create it
        console.log('[IMPORT-XML][STORAGE] Creating product with:', {
          barcode: product.barcode,
          name: product.name || `XML Import ${product.barcode}`,
          clientPrice: 0,
          deliveryPrice: deliveryPrice,
          quantity: xmlQuantity,
        });
        const createData = {
          barcode: product.barcode,
          name: product.name || `XML Import ${product.barcode}`,
          clientPrice: 0, // Always 0 on create
          deliveryPrice: deliveryPrice,
          quantity: xmlQuantity,
          active: true, // Always active when created
        };
        if (product.shouldActivate) {
          createData.active = true;
        }
        console.log('[IMPORT-XML][STORAGE] Creating product with:', createData);
        dbProduct = await prisma.product.create({
          data: createData,
        });
      }
      importedProductIds.push({ 
        productId: dbProduct.id, 
        quantity: xmlQuantity,
        clientPrice: product.clientPrice || 0
      });
      
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
    if (!fileName) {
      console.error('[IMPORT] No fileName provided, cannot create import record');
      return NextResponse.json({ error: 'Filename is required for import' }, { status: 400 });
    }
    
    const importRecord = await prisma.import.create({
      data: {
        user: {
          connect: { id: session.user.id }
        },
        storage: {
          connect: { id: storageId }
        },
        fileName: fileName,
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
            create: importedProductIds.map(p => ({ 
              productId: p.productId, 
              missingQuantity: p.quantity,
              priceAtSale: p.clientPrice
            })),
          },
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Products imported successfully.', priceChanges });

  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('fileName')) {
      console.warn('[IMPORT] Duplicate fileName error:', fileName);
      return new NextResponse('A file with this name was already imported. Please rename the file and try again.', { status: 400 });
    }
    console.error('[STORAGE_IMPORT_XML_ERROR]', error, 'fileName:', fileName);
    return new NextResponse('Internal server error during XML import.', { status: 500 });
  }
} 