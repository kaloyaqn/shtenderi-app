import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/get-session-better-auth';

import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role === 'ADMIN') {
    return NextResponse.json({ error: 'Admins do not have a personal cash register.' }, { status: 403 });
  }
  try {
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
    // Calculate grossIncome for this user for today only (including imports)
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const revisions = await prisma.revision.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startOfDay,
          lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        },
      },
      include: { missingProducts: true },
    });
    let grossIncome = 0;
    for (const rev of revisions) {
      for (const mp of rev.missingProducts) {
        // Use givenQuantity if available (for sale mode), otherwise use missingQuantity
        const quantity = mp.givenQuantity !== null ? mp.givenQuantity : mp.missingQuantity;
        grossIncome += (quantity || 0) * (mp.priceAtSale || 0);
      }
    }
    return NextResponse.json({
      cashBalance: cashRegister ? cashRegister.cashBalance : 0,
      storageId: userStorage.storageId,
      storageName: userStorage.storage.name,
      grossIncome,
    });
  } catch (err) {
    console.error('[USERS_MY_CASH_ERROR]', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
} 