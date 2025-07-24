import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { partnerId } = params;
  if (!partnerId) {
    return NextResponse.json({ error: 'Missing partnerId' }, { status: 400 });
  }
  // Get all revisions for this partner
  const revisions = await prisma.revision.findMany({
    where: { partnerId },
    select: {
      id: true,
      missingProducts: { select: { missingQuantity: true, priceAtSale: true, product: { select: { clientPrice: true } } } },
    },
  });
  // Calculate total sales
  let totalSales = 0;
  const revisionIds = [];
  for (const rev of revisions) {
    revisionIds.push(rev.id);
    for (const mp of rev.missingProducts) {
      const price = mp.priceAtSale ?? mp.product?.clientPrice ?? 0;
      // Use givenQuantity if available (for sale mode), otherwise use missingQuantity
      const quantity = mp.givenQuantity !== null ? mp.givenQuantity : mp.missingQuantity;
      totalSales += quantity * price;
    }
  }
  // Calculate total payments
  const payments = await prisma.payment.findMany({
    where: { revisionId: { in: revisionIds } },
    select: { amount: true },
  });
  const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const outstandingDebt = totalSales - totalPayments;
  return NextResponse.json({ 
    outstandingDebt: Number(outstandingDebt).toFixed(2),
    totalSales: Number(totalSales).toFixed(2),
    totalPayments: Number(totalPayments).toFixed(2)
  });
} 