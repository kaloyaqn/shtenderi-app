import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { storeId } = params;
  if (!storeId) {
    return NextResponse.json({ error: 'Missing storeId' }, { status: 400 });
  }
  // Get all revisions for this store
  const revisions = await prisma.revision.findMany({
    where: { storeId },
    select: { id: true, total: true },
  });
  const revisionIds = revisions.map(r => r.id);
  const totalSales = revisions.reduce((sum, r) => sum + (r.total || 0), 0);
  // Get all payments for these revisions
  const payments = await prisma.payment.findMany({
    where: { revisionId: { in: revisionIds } },
    select: { amount: true },
  });
  const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const outstandingDebt = totalSales - totalPayments;
  return NextResponse.json({ totalSales, totalPayments, outstandingDebt });
} 