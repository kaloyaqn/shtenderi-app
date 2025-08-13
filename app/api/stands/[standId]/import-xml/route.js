import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req, context) {
  let fileName = null; // Declare fileName at function scope
  try {
    const { standId } = await context.params;
    const { products, fileName: fileNameFromRequest } = await req.json();
    fileName = fileNameFromRequest; // Assign to function-scoped variable
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
    const priceChanges = [];
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

      // Detect delivery price change
      if (dbProduct && typeof dbProduct.deliveryPrice === 'number' && dbProduct.deliveryPrice !== deliveryPrice) {
        priceChanges.push({
          barcode: dbProduct.barcode,
          name: dbProduct.name,
          oldPrice: dbProduct.deliveryPrice,
          newPrice: deliveryPrice
        });
      }

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
        console.log('[IMPORT-XML][STAND] Found existing product:', {
          id: dbProduct.id,
          barcode: dbProduct.barcode,
          currentName: dbProduct.name,
          xmlName: product.name,
          namesMatch: dbProduct.name === product.name
        });
        
        const updateData = {
          deliveryPrice: deliveryPrice,
          // Do NOT update name or clientPrice if product already exists
        };
        updateData.quantity = { increment: product.quantity };
        if (product.shouldActivate) {
          updateData.active = true;
          console.log('[IMPORT-XML][STAND] Activating product:', product.barcode);
        }
        console.log('[IMPORT-XML][STAND] Updating product with:', updateData);
        console.log('[IMPORT-XML][STAND] Fields being updated:', Object.keys(updateData));
        const updatedProduct = await prisma.product.update({
          where: { id: dbProduct.id },
          data: updateData,
        });
        console.log('[IMPORT-XML][STAND] Product after update:', {
          id: updatedProduct.id,
          barcode: updatedProduct.barcode,
          name: updatedProduct.name,
          nameChanged: updatedProduct.name !== dbProduct.name
        });
        dbProduct = updatedProduct;
      }

      importedProductIds.push({ 
        productId: dbProduct.id, 
        quantity: product.quantity,
        clientPrice: product.clientPrice || 0
      });

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
    if (!fileName) {
      console.error('[IMPORT] No fileName provided, cannot create import record');
      return NextResponse.json({ error: 'Filename is required for import' }, { status: 400 });
    }
    
    const importRecord = await prisma.import.create({
      data: {
        user: {
          connect: { id: session.user.id }
        },
        stand: {
          connect: { id: standId }
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
      // Fetch the stand to get its partnerId
      const stand = await prisma.stand.findUnique({
        where: { id: standId },
        include: { store: { include: { partner: true } } },
      });
      let partnerId = null;
      let partnerDiscount = 0;
      if (stand?.store?.partnerId) {
        partnerId = stand.store.partnerId;
        partnerDiscount = stand.store.partner?.percentageDiscount || 0;
      }
      
      console.log('[IMPORT-XML][STAND] Creating revision with:', {
        nextNumber,
        standId,
        userId: session.user.id,
        partnerId,
        partnerDiscount,
        importedProductIds: importedProductIds.length,
        stand: stand ? { id: stand.id, name: stand.name, storeId: stand.storeId } : null,
        store: stand?.store ? { id: stand.store.id, name: stand.store.name, partnerId: stand.store.partnerId } : null
      });
      
      const revision = await prisma.revision.create({
        data: {
          number: nextNumber,
          standId,
          userId: session.user.id,
          type: 'import',
          partnerId: partnerId,
          missingProducts: {
            create: importedProductIds.map(p => ({ 
              productId: p.productId, 
              missingQuantity: p.quantity,
              priceAtSale: p.clientPrice * (1 - partnerDiscount / 100) // Apply partner discount
            })),
          },
        },
      });
      
      console.log('[IMPORT-XML][STAND] Created revision:', revision.id);
    }

    return NextResponse.json({ success: true, priceChanges });
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