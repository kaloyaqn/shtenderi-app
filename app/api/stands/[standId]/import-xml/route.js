import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req, { params }) {
  try {
    const { products } = await req.json();
    const standId = params.standId;
    if (!Array.isArray(products) || !standId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      for (const product of products) {
        if (!product.barcode || typeof product.quantity !== 'number') continue;

        let dbProduct = await tx.product.findUnique({
            where: { barcode: String(product.barcode) },
        });

        if (!dbProduct) {
            dbProduct = await tx.product.create({
                data: {
                    barcode: String(product.barcode),
                    name: product.name || `Imported ${product.barcode}`,
                    clientPrice: product.clientPrice || 0,
                    quantity: product.quantity,
                },
            });
        }

        await tx.standProduct.upsert({
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
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Import Stand XML error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 