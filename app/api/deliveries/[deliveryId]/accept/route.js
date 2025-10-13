import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Accept a delivery: increment storage stock, update avg delivery price, lock document
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { deliveryId } = params;
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { products: true },
    });
    if (!delivery) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (delivery.status !== 'DRAFT') return NextResponse.json({ error: 'Already accepted' }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      // Auto-create missing products for rows without productId
      const unresolved = delivery.products.filter(p => !p.productId);
      if (unresolved.length > 0) {
        const payload = [];
        for (const r of unresolved) {
          const barcode = r.barcode?.trim();
          const name = r.name?.trim();
          if (!barcode || !name) continue; // skip invalid rows
          // Idempotent check by barcode
          const existing = await tx.product.findUnique({ where: { barcode } });
          if (existing) {
            await tx.deliveryProduct.update({ where: { id: r.id }, data: { productId: existing.id } });
            continue;
          }
          const created = await tx.product.create({
            data: {
              barcode,
              pcode: r.pcode || null,
              name,
              invoiceName: name,
              deliveryPrice: r.unitPrice || 0,
              clientPrice: r.clientPrice || 0,
              active: true,
            },
            select: { id: true },
          });
          await tx.deliveryProduct.update({ where: { id: r.id }, data: { productId: created.id } });
        }
      }
      // For each product: update storage quantity and weighted average delivery price
      // Reload products to ensure productId set
      const items = await tx.deliveryProduct.findMany({ where: { deliveryId }, select: { id: true, productId: true, quantity: true, unitPrice: true, clientPrice: true } });
      for (const item of items) {
        const { productId, quantity, unitPrice, clientPrice } = item;
        if (!productId) continue; // skip unresolved items that failed validation
        // Current stock in storage
        const sp = await tx.storageProduct.findUnique({
          where: { storageId_productId: { storageId: delivery.storageId, productId } },
        });
        const currentQty = sp?.quantity || 0;

        // Update weighted avg delivery price on Product
        // avg = (Q_old * price_old + Q_new * price_new) / (Q_old + Q_new)
        const product = await tx.product.findUnique({ where: { id: productId }, select: { deliveryPrice: true } });
        const priceOld = product?.deliveryPrice || 0;
        const qOld = currentQty; // leftover quantity in storage
        const qNew = quantity;   // new quantity from delivery
        const avgDeliveryPrice = qOld + qNew > 0 ? ((qOld * priceOld) + (qNew * unitPrice)) / (qOld + qNew) : unitPrice;

        // Update both delivery price (weighted average) and client price (new value from delivery)
        await tx.product.update({ 
          where: { id: productId }, 
          data: { 
            deliveryPrice: +avgDeliveryPrice.toFixed(4),
            clientPrice: clientPrice || 0
          } 
        });

        // Increment storage quantity
        await tx.storageProduct.upsert({
          where: { storageId_productId: { storageId: delivery.storageId, productId } },
          update: { quantity: { increment: quantity } },
          create: { storageId: delivery.storageId, productId, quantity },
        });

        // Link product to delivery partner (many-to-many)
        await tx.productDeliveryPartner.upsert({
          where: { productId_deliveryPartnerId: { productId, deliveryPartnerId: delivery.supplierId } },
          update: {},
          create: { productId, deliveryPartnerId: delivery.supplierId },
        });
      }

      // Lock delivery
      await tx.delivery.update({
        where: { id: deliveryId },
        data: { status: 'ACCEPTED', acceptedAt: new Date(), acceptedById: session.user.id },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELIVERIES_ACCEPT_POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


