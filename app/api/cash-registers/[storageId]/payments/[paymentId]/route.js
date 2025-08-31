import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Placeholder admin check
async function isAdmin(req) {
  // TODO: Implement real admin check
  return true;
}

export async function PATCH(req, { params }) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { storageId, paymentId } = params;
  const body = await req.json();
  const { amount, method, invoiceId } = body;
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }
  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: { amount, method, invoiceId },
  });
  // If method changed and is CASH, update cash balance
  // (For simplicity, not handling all edge cases here)
  return NextResponse.json(updated);
}

export async function DELETE(req, { params }) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { storageId, paymentId } = params;
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }
  await prisma.payment.delete({ where: { id: paymentId } });
  // If payment was CASH, decrement cash register balance
  if (payment.method === 'CASH') {
    await prisma.cashRegister.update({
      where: { id: payment.cashRegisterId },
      data: { cashBalance: { decrement: payment.amount } },
    });
  }
  return NextResponse.json({ success: true });
} 