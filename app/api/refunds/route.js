import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

// POST: Create a refund
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { sourceType, sourceId, products, note } = await req.json();
    if (!sourceType || !sourceId || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Create refund
    // Fetch partner's percentageDiscount if needed (if refund is for a stand, get the stand's partner)
    let partnerDiscount = 0;
    if (sourceType === 'STAND') {
      const stand = await prisma.stand.findUnique({
        where: { id: sourceId },
        select: { store: { select: { partner: { select: { percentageDiscount: true } } } } }
      });
      partnerDiscount = stand?.store?.partner?.percentageDiscount || 0;
    }
    // For storage refunds, you may want to fetch the partner if needed
    const refund = await prisma.refund.create({
      data: {
        userId: session.user.id,
        sourceType,
        sourceId,
        note,
        refundProducts: {
          create: products.map(p => ({
            productId: p.productId,
            quantity: p.quantity,
            priceAtRefund: p.clientPrice * (1 - partnerDiscount / 100),
          }))
        }
      },
      include: { refundProducts: true }
    });
    // Subtract refunded quantity from source
    for (const p of products) {
      if (sourceType === 'STAND') {
        await prisma.standProduct.updateMany({
          where: { standId: sourceId, productId: p.productId },
          data: { quantity: { decrement: p.quantity } }
        });
      } else if (sourceType === 'STORAGE') {
        await prisma.storageProduct.updateMany({
          where: { storageId: sourceId, productId: p.productId },
          data: { quantity: { decrement: p.quantity } }
        });
      }
    }
    return NextResponse.json(refund);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: List all refunds, include stand/storage name
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    let whereClause = {};
    if (session.user.role === 'USER') {
      const userWithRelations = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { 
          userStands: { select: { standId: true } },
          userStorages: { select: { storageId: true } },
        },
      });
      const standIds = userWithRelations.userStands.map(us => us.standId);
      const storageIds = userWithRelations.userStorages.map(us => us.storageId);

      whereClause = {
        OR: [
          {
            sourceType: 'STAND',
            sourceId: { in: standIds },
          },
          {
            sourceType: 'STORAGE',
            sourceId: { in: storageIds },
          }
        ]
      };
    }

    const refunds = await prisma.refund.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        refundProducts: { include: { product: true } }
      }
    });
    // Fetch stand/storage names for each refund
    const withNames = await Promise.all(refunds.map(async (refund) => {
      let sourceName = '';
      if (refund.sourceType === 'STAND') {
        const stand = await prisma.stand.findUnique({ where: { id: refund.sourceId } });
        sourceName = stand?.name || refund.sourceId;
      } else if (refund.sourceType === 'STORAGE') {
        const storage = await prisma.storage.findUnique({ where: { id: refund.sourceId } });
        sourceName = storage?.name || refund.sourceId;
      }
      return { ...refund, sourceName };
    }));
    return NextResponse.json(withNames);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 