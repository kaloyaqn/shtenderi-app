import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role === 'ADMIN') {
    // Admin: return all cash registers
    const cashRegisters = await prisma.cashRegister.findMany({
      include: { storage: true },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(cashRegisters);
  } else {
    // Not admin: return only cash registers for storages the user has access to
    const userStorages = await prisma.userStorage.findMany({
      where: { userId: session.user.id },
      select: { storageId: true },
    });
    const storageIds = userStorages.map(us => us.storageId);

    const cashRegisters = await prisma.cashRegister.findMany({
      where: { storageId: { in: storageIds } },
      include: { storage: true },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(cashRegisters);
  }
} 