import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  try {
    if (id) {
      const cashRegister = await prisma.cashRegister.findUnique({
        where: { id },
        include: { storage: true },
      });
      if (!cashRegister) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(cashRegister);
    } else {
      const cashRegisters = await prisma.cashRegister.findMany({
        include: { storage: true },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json(cashRegisters);
    }
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('[POST /api/cash-registers] Incoming body:', body);
    const { name, storageId } = body;

    if (!name || !storageId) {
      console.warn('[POST /api/cash-registers] Validation failed:', { name, storageId });
      return NextResponse.json({ error: 'Name and storageId are required.' }, { status: 400 });
    }

    const created = await prisma.cashRegister.create({
      data: {
        name,
        storage: { connect: { id: storageId } },
      },
      include: { storage: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('[POST /api/cash-registers] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 