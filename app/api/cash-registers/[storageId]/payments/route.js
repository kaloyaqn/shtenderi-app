import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { RevisionStatus } from '@prisma/client';

export async function POST(req, { params }) {
  const { storageId } = params;
  const body = await req.json();
  const { amount, method, revisionId, invoiceId, userId } = body;
  if (!storageId || !amount || !method || !revisionId || !userId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!['CASH', 'BANK'].includes(method)) {
    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
  }
  if (amount === undefined || amount === null || isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
  }
  let cashRegister = await prisma.cashRegister.findUnique({ where: { storageId } });
  if (!cashRegister) {
    cashRegister = await prisma.cashRegister.create({ data: { storageId } });
  }
  // Debug: log payment data
  console.log('Creating payment with:', {
    amount,
    method,
    revisionId,
    invoiceId,
    cashRegisterId: cashRegister.id,
    userId,
  });
  let payment;
  try {
    payment = await prisma.payment.create({
      data: {
        amount,
        method,
        revisionId,
        invoiceId,
        cashRegisterId: cashRegister.id,
        userId,
      },
    });
  } catch (err) {
    console.error('Error creating payment:', err);
    return NextResponse.json({ error: err.message, details: err }, { status: 500 });
  }
  // Removed status update: handled by DB trigger
  // If cash, update cash balance
  if (method === 'CASH') {
    await prisma.cashRegister.update({
      where: { id: cashRegister.id },
      data: { cashBalance: { increment: amount } },
    });
  }
  const updatedRegister = await prisma.cashRegister.findUnique({
    where: { id: cashRegister.id },
    include: { payments: true, cashMovements: true },
  });
  return NextResponse.json({ payment, cashRegister: updatedRegister });
}

export async function GET(req, { params }) {
  const { storageId } = params;
  if (!storageId) {
    return NextResponse.json({ error: 'Missing storageId' }, { status: 400 });
  }
  const cashRegister = await prisma.cashRegister.findUnique({
    where: { storageId },
    include: {
      payments: {
        include: {
          user: true,
          revision: true,
          invoice: true,
        },
      },
    },
  });
  if (!cashRegister) {
    return NextResponse.json({ error: 'Cash register not found' }, { status: 404 });
  }
  return NextResponse.json(cashRegister.payments);
} 