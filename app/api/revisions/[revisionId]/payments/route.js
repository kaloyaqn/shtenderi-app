import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, context) {
  const { revisionId } = await context.params;
  if (!revisionId) {
    return NextResponse.json({ error: 'Missing revisionId' }, { status: 400 });
  }
  const payments = await prisma.payment.findMany({
    where: { revisionId },
    include: {
      user: true,
      cashRegister: { include: { storage: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(payments);
} 