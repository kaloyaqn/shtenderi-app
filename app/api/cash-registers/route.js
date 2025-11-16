import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/get-session-better-auth';


export async function GET(req) {
  const session = await getServerSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // New endpoint: /api/cash-registers/my-balance
  if (req.nextUrl?.pathname?.endsWith('/my-balance')) {
    try {
      if (session.user.role === 'ADMIN') {
        return NextResponse.json({ error: 'Admins do not have a personal cash register.' }, { status: 403 });
      }
      // Get the user's assigned storage (first one if multiple)
      const userStorage = await prisma.userStorage.findFirst({
        where: { userId: session.user.id },
        include: { storage: true },
      });
      if (!userStorage || !userStorage.storage) {
        return NextResponse.json({ error: 'No storage assigned to user or storage not found.' }, { status: 404 });
      }
      // Only fetch, do not create
      const cashRegister = await prisma.cashRegister.findUnique({
        where: { storageId: userStorage.storageId },
      });
      return NextResponse.json({
        storageId: userStorage.storageId,
        storageName: userStorage.storage.name,
        cashBalance: cashRegister ? cashRegister.cashBalance : 0,
      });
    } catch (err) {
      console.error('[MY_BALANCE_ERROR]', err);
      return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
    }
  }

  // New endpoint: /api/cash-registers/my-cash
  if (req.nextUrl?.pathname?.endsWith('/my-cash')) {
    try {
      if (session.user.role === 'ADMIN') {
        return NextResponse.json({ error: 'Admins do not have a personal cash register.' }, { status: 403 });
      }
      const userStorage = await prisma.userStorage.findFirst({
        where: { userId: session.user.id },
        include: { storage: true },
      });
      if (!userStorage || !userStorage.storage) {
        return NextResponse.json({ cashBalance: 0 });
      }
      const cashRegister = await prisma.cashRegister.findUnique({
        where: { storageId: userStorage.storageId },
      });
      return NextResponse.json({
        cashBalance: cashRegister ? cashRegister.cashBalance : 0,
        storageId: userStorage.storageId,
        storageName: userStorage.storage.name,
      });
    } catch (err) {
      console.error('[MY_CASH_ERROR]', err);
      return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
    }
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