import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const checks = await prisma.check.findMany({
    include: {
      stand: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { checkedProducts: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  // Map to summary info
  const summary = checks.map(c => ({
    id: c.id,
    createdAt: c.createdAt,
    stand: c.stand,
    user: c.user,
    checkedProductsCount: c._count.checkedProducts,
  }));
  return NextResponse.json(summary);
} 