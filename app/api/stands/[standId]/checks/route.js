import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  const { standId } = params;
  const checks = await prisma.check.findMany({
    where: { standId },
    include: {
      checkedProducts: {
        include: { product: true },
      },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(checks);
}

export async function POST(req, { params }) {
  const { standId } = params;
  const body = await req.json();
  const { userId, checkedProducts } = body;
  if (!userId || !Array.isArray(checkedProducts)) {
    return NextResponse.json({ error: 'Missing userId or checkedProducts' }, { status: 400 });
  }
  const check = await prisma.check.create({
    data: {
      standId,
      userId,
      checkedProducts: {
        create: checkedProducts.map(cp => ({
          productId: cp.productId,
          quantity: cp.quantity,
          originalQuantity: cp.originalQuantity,
          status: cp.status || 'ok',
        })),
      },
    },
    include: {
      checkedProducts: true,
    },
  });
  return NextResponse.json(check);
} 