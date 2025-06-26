import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req, context) {
  try {
    const { standId } = await context.params;
    const { products } = await req.json();
    console.log('IMPORT XML: standId:', standId, 'products:', products);
    if (!Array.isArray(products) || !standId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    for (const product of products) {
      if (!product.barcode || typeof product.quantity !== 'number') continue;

      let dbProduct = await prisma.product.findUnique({
        where: { barcode: String(product.barcode) },
      });

      if (!dbProduct) {
        dbProduct = await prisma.product.create({
          data: {
            barcode: String(product.barcode),
            name: product.name || `Imported ${product.barcode}`,
            clientPrice: product.clientPrice || 0,
            quantity: product.quantity,
          },
        });
      } else {
        // Increment the global product quantity by the XML quantity
        dbProduct = await prisma.product.update({
          where: { id: dbProduct.id },
          data: {
            quantity: { increment: product.quantity },
          },
        });
      }

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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Import Stand XML error:', err);
    if (err instanceof Error) {
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 