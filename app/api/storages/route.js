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
    
    let storages;
    if (session.user?.role === 'ADMIN') {
        storages = await prisma.storage.findMany({
            orderBy: { createdAt: 'desc' }
        });
    } else if (session.user?.role === 'USER') {
        const userStorages = await prisma.userStorage.findMany({
            where: { userId: session.user.id },
            include: { storage: true }
        });
        storages = userStorages.map(us => us.storage);
    } else {
        storages = []; // Should not happen
    }

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

    // Create a cash register for this storage
    await prisma.cashRegister.create({
      data: {
        storageId: storage.id,
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