import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/get-session-better-auth';


export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  let whereClause = {};
  if (session.user.role !== 'ADMIN') {
    // Get stands assigned to the user
    const userWithStands = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { userStands: { select: { standId: true } } },
    });
    const standIds = userWithStands.userStands.map(us => us.standId);
    whereClause = { standId: { in: standIds } };
  }
  const checks = await prisma.check.findMany({
    where: whereClause,
    include: {
      stand: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { checkedProducts: true } },
      revisions: { 
        select: { 
          id: true, 
          number: true, 
          createdAt: true, 
          status: true 
        } 
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  // Map to summary info
  const summary = checks.map(c => ({
    id: c.id,
    createdAt: c.createdAt,
    stand: c.stand,
    user: c.user,
    checkedProductsCount: c._count.checkedProducts,
  }));
  return NextResponse.json(summary);
} 