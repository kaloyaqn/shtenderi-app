import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      name,
      bulstat,
      contactPerson,
      email,
      phone,
      address,
      country,
      city,
      mol,
      bankAccountBG,
      bankAccountEUR,
    } = body || {};

    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const partner = await prisma.deliveryPartner.create({
      data: {
        name: name.trim(),
        bulstat,
        contactPerson,
        email,
        phone,
        address,
        country,
        city,
        mol,
        bankAccountBG,
        bankAccountEUR,
      },
    });
    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    console.error('[DELIVERY_PARTNERS_POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const partners = await prisma.deliveryPartner.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(partners);
  } catch (error) {
    console.error('[DELIVERY_PARTNERS_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


