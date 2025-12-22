import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, parseISO, isValid } from 'date-fns';

export async function GET(req) {
  const url = new URL(req.url);
  const dateParam = url.searchParams.get('date');
  const fromParam = url.searchParams.get('from');
  const toParam = url.searchParams.get('to');
  const partnerId = url.searchParams.get('partnerId');

  let from, to;
  if (dateParam) {
    const date = parseISO(dateParam);
    if (isValid(date)) {
      from = startOfDay(date);
      to = endOfDay(date);
    }
  } else if (fromParam && toParam) {
    const fromDate = parseISO(fromParam);
    const toDate = parseISO(toParam);
    if (isValid(fromDate) && isValid(toDate)) {
      from = startOfDay(fromDate);
      to = endOfDay(toDate);
    }
  }
  // Default: today
  if (!from || !to) {
    const now = new Date();
    from = startOfDay(now);
    to = endOfDay(now);
  }

  // Fetch all payments
  const payments = await prisma.payment.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      ...(partnerId ? { revision: { partnerId } } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      revision: { select: { id: true, number: true, partner: { select: { id: true, name: true } } } },
      invoice: { select: { id: true, invoiceNumber: true } },
      cashRegister: { include: { storage: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  // Fetch all cash movements
  const cashMovements = await prisma.cashMovement.findMany({
    where: {
      createdAt: { gte: from, lte: to },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      cashRegister: { include: { storage: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Merge and sort
  const all = [
    ...payments.map(p => ({
      ...p,
      type: 'payment',
      revisionId: p.revision?.id || p.revisionId,
      invoiceId: p.invoice?.id || p.invoiceId,
      storageName: p.cashRegister?.storage?.name || p.cashRegister?.storageId || '-',
    })),
    ...cashMovements.map(m => ({
      ...m,
      type: 'cash_movement',
      cashMovementType: m.type,
      storageName: m.cashRegister?.storage?.name || m.cashRegister?.storageId || '-',
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return NextResponse.json(all);
} 
