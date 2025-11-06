import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    const { partnerId } = params;
    if (!partnerId) return NextResponse.json({ error: 'Missing partnerId' }, { status: 400 });

    const deliveries = await prisma.delivery.findMany({
      where: { supplierId: partnerId, status: 'ACCEPTED' },
      include: { products: true, payments: true },
    });

    let totalDeliveries = 0;
    let totalPayments = 0;
    let outstandingDebt = 0;

    for (const d of deliveries) {
      const deliveryTotal = d.products.reduce((s, p) => s + Number(p.quantity || 0) * Number(p.unitPrice || 0), 0);
      const paidForDelivery = d.payments.reduce((s, p) => s + Number(p.amount || 0), 0);
      totalDeliveries += deliveryTotal;
      totalPayments += paidForDelivery;
      const remaining = Math.max(0, deliveryTotal - paidForDelivery);
      if (remaining > 0) outstandingDebt += remaining;
    }

    return NextResponse.json({
      totalDeliveries: Number(totalDeliveries.toFixed(2)),
      totalPayments: Number(totalPayments.toFixed(2)),
      outstandingDebt: Number(outstandingDebt.toFixed(2)),
    });
  } catch (e) {
    console.error('[DELIVERY_PARTNER_OUTSTANDING_DEBT]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


