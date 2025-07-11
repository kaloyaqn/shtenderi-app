import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { revisionId } = params;
  if (!revisionId) {
    return NextResponse.json({ error: 'Missing revisionId' }, { status: 400 });
  }
  const payments = await prisma.payment.findMany({
    where: { revisionId },
    include: {
      user: true,
      cashRegister: true,
    },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(payments);
} 