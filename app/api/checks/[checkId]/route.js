import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  const { checkId } = params;
  const check = await prisma.check.findUnique({
    where: { id: checkId },
    include: {
      stand: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true } },
      checkedProducts: { include: { product: true } },
    },
  });
  if (!check) {
    return NextResponse.json({ error: 'Check not found' }, { status: 404 });
  }
  return NextResponse.json(check);
} 