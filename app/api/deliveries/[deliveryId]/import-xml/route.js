import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Import parsed XML lines into a Delivery (draft). Expects JSON payload, the client parses XML.
// Body: { items: [{ barcode?: string, pcode?: string, quantity: number, unitPrice: number }] }
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { deliveryId } = params;
    const { items } = await req.json();
    if (!deliveryId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId }, select: { id: true, status: true } });
    if (!delivery) return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    if (delivery.status !== 'DRAFT') return NextResponse.json({ error: 'Delivery already accepted' }, { status: 400 });

    const missing = [];
    const toCreate = [];
    for (const it of items) {
      const { barcode, pcode, name, quantity, unitPrice, clientPrice } = it || {};
      if (typeof quantity !== 'number' || quantity <= 0 || typeof unitPrice !== 'number' || typeof clientPrice !== 'number') continue;
      let product = null;
      
      // Try to find by barcode first
      if (barcode) {
        product = await prisma.product.findUnique({ where: { barcode: String(barcode) } });
      }
      
      // Try to find by pcode
      if (!product && pcode) {
        product = await prisma.product.findFirst({ where: { pcode: String(pcode) } });
      }
      
      // Try to find by name (for new format)
      if (!product && name) {
        product = await prisma.product.findFirst({ 
          where: { 
            name: { 
              contains: name, 
              mode: 'insensitive' 
            } 
          } 
        });
      }
      
      if (!product) {
        missing.push({ barcode: barcode || null, pcode: pcode || null, name: name || null, quantity, unitPrice, clientPrice });
        continue;
      }
      toCreate.push({ productId: product.id, quantity, unitPrice, clientPrice });
    }

    if (toCreate.length > 0) {
      // Insert or merge with existing delivery lines
      await prisma.$transaction(async (tx) => {
        for (const row of toCreate) {
          const existing = await tx.deliveryProduct.findUnique({
            where: { deliveryId_productId: { deliveryId, productId: row.productId } },
          }).catch(() => null);
          if (existing) {
            await tx.deliveryProduct.update({
              where: { id: existing.id },
              data: { quantity: existing.quantity + row.quantity, unitPrice: row.unitPrice, clientPrice: row.clientPrice },
            });
          } else {
            await tx.deliveryProduct.create({ data: { deliveryId, productId: row.productId, quantity: row.quantity, unitPrice: row.unitPrice, clientPrice: row.clientPrice } });
          }
        }
      });
    }

    const updated = await prisma.delivery.findUnique({ where: { id: deliveryId }, include: { products: { include: { product: true } } } });
    return NextResponse.json({ ok: true, created: toCreate.length, missing, delivery: updated });
  } catch (e) {
    console.error('[DELIVERY_IMPORT_XML]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



