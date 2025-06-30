import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }
    
    const whereClause = {};
    if (session.user && session.user.role === 'USER') {
      whereClause.userStorages = {
        some: {
          userId: session.user.id,
        },
      };
    }

    const storages = await prisma.storage.findMany({
      where: whereClause,
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