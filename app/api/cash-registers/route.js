import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const cashRegisters = await prisma.cashRegister.findMany({
    include: { storage: true },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(cashRegisters);
} 