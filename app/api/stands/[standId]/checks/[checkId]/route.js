import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  const { standId, checkId } = params;
  const check = await prisma.check.findUnique({
    where: { id: checkId },
    include: {
      checkedProducts: { include: { product: true } },
      user: { select: { id: true, name: true, email: true } },
      revisions: { 
        select: { 
          id: true, 
          number: true, 
          createdAt: true, 
          status: true,
          missingProducts: { select: { missingQuantity: true, givenQuantity: true } }
        } 
      },
    },
  });
  if (!check || check.standId !== standId) {
    return NextResponse.json({ error: 'Check not found' }, { status: 404 });
  }
  return NextResponse.json(check);
} 