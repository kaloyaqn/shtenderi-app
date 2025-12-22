import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/get-session-better-auth';
import { getEffectivePrice } from '@/lib/pricing/get-effective-price';

import { NextResponse } from 'next/server';

// POST: Create a refund
export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { sourceType, sourceId, products, note, usePriceAtSale = false, revisionId = null } = await req.json();
    if (!sourceType || !sourceId || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Create refund
    // Determine pricing path
    let partnerDiscount = 0;
    let priceAtSaleByProductId = {};
    let partnerIdForEffectivePrice = null;

    if (usePriceAtSale && revisionId) {
      const revision = await prisma.revision.findUnique({
        where: { id: revisionId },
        include: { missingProducts: true },
      });
      if (revision?.missingProducts?.length) {
        for (const mp of revision.missingProducts) {
          priceAtSaleByProductId[mp.productId] = Number(mp.priceAtSale ?? 0);
        }
      }
    } else {
      if (sourceType === 'STAND') {
        const stand = await prisma.stand.findUnique({
          where: { id: sourceId },
          select: { store: { select: { partnerId: true, partner: { select: { percentageDiscount: true } } } } }
        });
        partnerDiscount = stand?.store?.partner?.percentageDiscount || 0;
        partnerIdForEffectivePrice = stand?.store?.partnerId || null;
      }
    }
    // For storage refunds, you may want to fetch the partner if needed
    const refund = await prisma.refund.create({
      data: {
        userId: session.user.id,
        sourceType,
        sourceId,
        note,
        refundProducts: {
          create: await Promise.all(products.map(async (p) => {
            const priceAtSale = usePriceAtSale
              ? (typeof p.priceAtSale === 'number' ? p.priceAtSale : (priceAtSaleByProductId[p.productId] ?? 0))
              : null;

            let priceFromEffective = null;
            if (!usePriceAtSale && partnerIdForEffectivePrice) {
              priceFromEffective = await getEffectivePrice({
                productId: p.productId,
                partnerId: partnerIdForEffectivePrice,
              });
            }

            const baseClientPrice = typeof p.clientPrice === 'number' ? p.clientPrice : 0;

            const computedPrice =
              priceAtSale != null
                ? priceAtSale
                : priceFromEffective != null
                  ? priceFromEffective
                  : baseClientPrice * (1 - partnerDiscount / 100);

            return {
              productId: p.productId,
              quantity: p.quantity,
              priceAtRefund: computedPrice,
            };
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
    const session = await getServerSession();
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
    // Fetch stand/storage names and enrich prices with effective price when missing
    const withNames = await Promise.all(refunds.map(async (refund) => {
      let sourceName = '';
      let partnerId = null;
      let partnerInfo = null;

      if (refund.sourceType === 'STAND') {
        const stand = await prisma.stand.findUnique({
          where: { id: refund.sourceId },
          select: { name: true, store: { select: { partnerId: true, partner: true } } },
        });
        sourceName = stand?.name || refund.sourceId;
        partnerId = stand?.store?.partnerId || null;
        partnerInfo = stand?.store?.partner || null;
      } else if (refund.sourceType === 'STORAGE') {
        const storage = await prisma.storage.findUnique({ where: { id: refund.sourceId } });
        sourceName = storage?.name || refund.sourceId;
      }

      let refundProducts = refund.refundProducts;
      if (partnerId) {
        refundProducts = await Promise.all(
          refund.refundProducts.map(async (rp) => {
            if (rp.priceAtRefund != null) return rp;
            const effectivePrice = await getEffectivePrice({
              productId: rp.productId,
              partnerId,
            });
            return { ...rp, priceAtRefund: effectivePrice };
          })
        );
      }

      return {
        ...refund,
        sourceName,
        partnerId,
        partner: partnerInfo,
        partnerName: partnerInfo?.name || null,
        partnerBulstat: partnerInfo?.bulstat || null,
        partnerMol: partnerInfo?.mol || null,
        partnerAddress: partnerInfo?.address || null,
        partnerCountry: partnerInfo?.country || null,
        partnerCity: partnerInfo?.city || null,
        partnerEmail: partnerInfo?.email || null,
        refundProducts,
      };
    }));
    return NextResponse.json(withNames);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
