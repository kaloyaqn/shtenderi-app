import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/get-session-better-auth';


export async function GET(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storageId = searchParams.get('storageId');
    const standId = searchParams.get('standId');
    const userId = searchParams.get('userId');

    const where = {};
    if (storageId) where.storageId = storageId;
    if (standId) where.standId = standId;
    if (userId) where.userId = userId;

    const imports = await prisma.import.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        stand: true,
        storage: true,
        importProducts: {
          include: { product: true }
        }
      }
    });
    return NextResponse.json(imports);
  } catch (error) {
    console.error('[IMPORTS_GET_ERROR]', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 