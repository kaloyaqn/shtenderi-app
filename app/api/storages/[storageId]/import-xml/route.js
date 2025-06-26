import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req, { params }) {
  const { storageId } = await params;
  const { products: productsFromXml } = await req.json();

  if (!storageId || !Array.isArray(productsFromXml)) {
    return new NextResponse('Missing storageId or products data', { status: 400 });
  }

  try {
    for (const product of productsFromXml) {
      if (!product.barcode || typeof product.quantity !== 'number') {
        console.warn('Skipping product with invalid data:', product);
        continue;
      }
      
      const xmlQuantity = product.quantity;

      // Always increment the global product quantity
      let dbProduct = await prisma.product.findUnique({
        where: { barcode: product.barcode },
      });

      if (dbProduct) {
        // Increment the global product quantity
        await prisma.product.update({
          where: { id: dbProduct.id },
          data: { quantity: { increment: xmlQuantity } },
        });
      } else {
        // If it doesn't exist, create it
        dbProduct = await prisma.product.create({
          data: {
            barcode: product.barcode,
            name: product.name || `XML Import ${product.barcode}`,
            clientPrice: product.clientPrice || 0,
            quantity: xmlQuantity,
          },
        });
      }
      
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

    return NextResponse.json({ success: true, message: 'Products imported successfully.' });

  } catch (error) {
    console.error('[STORAGE_IMPORT_XML_ERROR]', error);
    return new NextResponse('Internal server error during XML import.', { status: 500 });
  }
} 