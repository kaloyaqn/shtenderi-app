import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  const { storageId } = params;
  const body = await req.json();
  const { amount, type, userId, reason } = body;
  if (!storageId || !amount || !type || !userId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!['DEPOSIT', 'WITHDRAWAL'].includes(type)) {
    return NextResponse.json({ error: 'Invalid movement type' }, { status: 400 });
  }
  let cashRegister = await prisma.cashRegister.findUnique({ where: { storageId } });
  if (!cashRegister) {
    cashRegister = await prisma.cashRegister.create({ data: { storageId } });
  }
  const cashMovement = await prisma.cashMovement.create({
    data: {
      amount,
      type,
      reason,
      cashRegisterId: cashRegister.id,
      userId,
    },
  });
  // Update cash balance
  await prisma.cashRegister.update({
    where: { id: cashRegister.id },
    data: {
      cashBalance: {
        increment: type === 'DEPOSIT' ? amount : -amount,
      },
    },
  });
  const updatedRegister = await prisma.cashRegister.findUnique({
    where: { id: cashRegister.id },
    include: { payments: true, cashMovements: true },
  });
  return NextResponse.json({ cashMovement, cashRegister: updatedRegister });
}

export async function GET(req, { params }) {
  const { storageId } = params;
  if (!storageId) {
    return NextResponse.json({ error: 'Missing storageId' }, { status: 400 });
  }
  const cashRegister = await prisma.cashRegister.findUnique({
    where: { storageId },
    include: {
      cashMovements: {
        include: {
          user: true,
        },
      },
    },
  });
  if (!cashRegister) {
    return NextResponse.json({ error: 'Cash register not found' }, { status: 404 });
  }
  return NextResponse.json(cashRegister.cashMovements);
} 