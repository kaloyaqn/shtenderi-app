import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const storages = await prisma.storage.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(storages);
  } catch (error) {
    console.error('[STORAGES_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }

    const storage = await prisma.storage.create({
      data: {
        name,
      },
    });

    return NextResponse.json(storage);
  } catch (error) {
    console.error('[STORAGES_POST]', error);
    if (error.code === 'P2002') {
        return new NextResponse('A storage with this name already exists', { status: 409 });
    }
    return new NextResponse('Internal error', { status: 500 });
  }
} 