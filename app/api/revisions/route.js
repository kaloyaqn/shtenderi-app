import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req) {
  try {
    const { standId, userId, missingProducts } = await req.json();
    if (!standId || !userId || !Array.isArray(missingProducts)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    // Get partnerId from stand
    const stand = await prisma.stand.findUnique({
      where: { id: standId },
      select: { store: { select: { partnerId: true, partner: { select: { percentageDiscount: true } } } } }
    });
    if (!stand) {
      return NextResponse.json({ error: 'Stand not found' }, { status: 404 });
    }
    const partnerId = stand.store.partnerId;
    const partnerDiscount = stand.store.partner?.percentageDiscount || 0;
    // Get next global revision number
    const last = await prisma.revision.findFirst({ orderBy: { number: 'desc' }, select: { number: true } });
    const nextNumber = last?.number ? last.number + 1 : 1;
    // Create revision
    const revision = await prisma.revision.create({
      data: {
        number: nextNumber,
        standId,
        partnerId,
        userId,
        missingProducts: {
          create: missingProducts.map(mp => ({
            productId: mp.productId,
            missingQuantity: mp.missingQuantity,
            givenQuantity: mp.givenQuantity || null, // Only set if explicitly provided
            priceAtSale: mp.clientPrice * (1 - partnerDiscount / 100),
          }))
        }
      },
      include: { missingProducts: true }
    });

    // Subtract missing quantities from standProducts
    for (const mp of missingProducts) {
      const standProduct = await prisma.standProduct.findFirst({
        where: { standId, productId: mp.productId }
      });
      if (standProduct) {
        const newQty = Math.max(0, standProduct.quantity - mp.missingQuantity);
        await prisma.standProduct.update({
          where: { id: standProduct.id },
          data: { quantity: newQty }
        });
      }
    }
    return NextResponse.json(revision);
  } catch (err) {
    console.error('Revision save error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const partnerName = searchParams.get('partnerName');
    const userName = searchParams.get('userName');

    let whereClause = {};
    if (session.user.role === 'USER') {
      const userWithStands = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { userStands: { select: { standId: true } } },
      });
      const standIds = userWithStands.userStands.map(us => us.standId);
      whereClause = {
        standId: {
          in: standIds,
        },
      };
    }

    // Add status filter if present
    if (status && (status === 'PAID' || status === 'NOT_PAID')) {
      whereClause.status = status;
    }
    // Add source filter (stand name or storage name)
    if (source) {
      whereClause.OR = [
        { stand: { name: { contains: source, mode: 'insensitive' } } },
        { storage: { name: { contains: source, mode: 'insensitive' } } },
      ];
    }
    // Add partnerName filter
    if (partnerName) {
      whereClause.partner = { name: { contains: partnerName, mode: 'insensitive' } };
    }
    // Add userName filter
    if (userName) {
      whereClause.user = {
        OR: [
          { name: { contains: userName, mode: 'insensitive' } },
          { email: { contains: userName, mode: 'insensitive' } },
        ],
      };
    }

    const revisions = await prisma.revision.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        stand: true,
        storage: true, // include storage
        partner: true,
        user: true,
        missingProducts: true,
      }
    });
    return NextResponse.json(revisions);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch revisions' }, { status: 500 });
  }
} 