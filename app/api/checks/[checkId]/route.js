import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/get-session-better-auth';


export async function GET(req, { params }) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { checkId } = params;
  const check = await prisma.check.findUnique({
    where: { id: checkId },
    include: {
      stand: {
        select: {
          id: true,
          name: true,
          store: {
            select: {
              partner: {
                select: {
                  id:true,
                  name:true,
                }
              }
            }
          }
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      checkedProducts: { include: { product: true } },
      revisions: {
        select: {
          id: true,
          number: true,
          createdAt: true,
          status: true,
          missingProducts: { select: { missingQuantity: true, givenQuantity: true } }
        }
      },
    },
  });
  if (!check) {
    return NextResponse.json({ error: 'Check not found' }, { status: 404 });
  }
  if (session.user.role !== 'ADMIN') {
    // Get stands assigned to the user
    const userWithStands = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { userStands: { select: { standId: true } } },
    });
    const standIds = userWithStands.userStands.map(us => us.standId);
    if (!standIds.includes(check.stand.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }
  return NextResponse.json(check);
}
