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
      // For each product: update storage quantity and weighted average delivery price
      for (const item of delivery.products) {
        const { productId, quantity, unitPrice } = item;
        // Current stock in storage
        const sp = await tx.storageProduct.findUnique({
          where: { storageId_productId: { storageId: delivery.storageId, productId } },
        });
        const currentQty = sp?.quantity || 0;

        // Update weighted avg delivery price on Product
        // avg = (Q_old * price_old + Q_new * price_new) / (Q_old + Q_new)
        const product = await tx.product.findUnique({ where: { id: productId }, select: { deliveryPrice: true } });
        const priceOld = product?.deliveryPrice || 0;
        const qOld = currentQty;
        const qNew = quantity;
        const avg = qOld + qNew > 0 ? ((qOld * priceOld) + (qNew * unitPrice)) / (qOld + qNew) : unitPrice;

        await tx.product.update({ where: { id: productId }, data: { deliveryPrice: +avg.toFixed(4) } });

        // Increment storage quantity
        await tx.storageProduct.upsert({
          where: { storageId_productId: { storageId: delivery.storageId, productId } },
          update: { quantity: { increment: quantity } },
          create: { storageId: delivery.storageId, productId, quantity },
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


