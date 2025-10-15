import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    const { deliveryId } = params;
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { supplier: true, storage: true, products: { include: { product: true } }, payments: true },
    });
    if (!delivery) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(delivery);
  } catch (error) {
    console.error('[DELIVERIES_ID_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Allow updating draft only
export async function PUT(req, { params }) {
  try {
    const { deliveryId } = params;
    const { supplierId, storageId, products } = await req.json();
    const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
    if (!delivery) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (delivery.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Delivery already accepted' }, { status: 400 });
    }

    const updates = {};
    if (supplierId) updates.supplierId = supplierId;
    if (storageId) updates.storageId = storageId;

    // Sanitize incoming products to avoid prisma type errors
    const sanitized = Array.isArray(products) ? products.map((p) => ({
      deliveryId,
      productId: p.productId || null,
      quantity: Number(p.quantity || 0),
      unitPrice: Number(p.unitPrice || 0),
      clientPrice: p.clientPrice == null || p.clientPrice === '' ? 0 : Number(p.clientPrice),
      barcode: p.barcode || null,
      pcd: p.pcd || null,
      name: p.name || null,
    })) : [];

    const updated = await prisma.$transaction(async (tx) => {
      const base = await tx.delivery.update({ where: { id: deliveryId }, data: updates });
      if (Array.isArray(products)) {
        // Replace products set
        await tx.deliveryProduct.deleteMany({ where: { deliveryId } });
        if (sanitized.length > 0) {
          await tx.deliveryProduct.createMany({ data: sanitized });
        }
      }
      return tx.delivery.findUnique({ where: { id: deliveryId }, include: { products: { include: { product: true } }, supplier: true, storage: true, payments: true } });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[DELIVERIES_ID_PUT]', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}


