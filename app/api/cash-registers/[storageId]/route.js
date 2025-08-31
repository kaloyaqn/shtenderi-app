import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { storageId } = params;
  if (!storageId) {
    return NextResponse.json({ error: 'Missing storageId' }, { status: 400 });
  }
  let cashRegister = await prisma.cashRegister.findUnique({
    where: { storageId },
    include: {
      payments: {
        include: {
          user: true,
          revision: true,
          invoice: true,
        },
      },
      cashMovements: {
        include: {
          user: true,
        },
      },
      storage: true,
    },
  });
  if (!cashRegister) {
    cashRegister = await prisma.cashRegister.create({
      data: { storageId },
      include: {
        payments: {
          include: {
            user: true,
            revision: true,
            invoice: true,
          },
        },
        cashMovements: {
          include: {
            user: true,
          },
        },
        storage: true,
      },
    });
  }
  return NextResponse.json(cashRegister);
} 