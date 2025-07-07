import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { id } = params;
  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: true,
        cashRegister: { include: { storage: true } },
        createdBy: true,
      },
    });
    if (!payment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 