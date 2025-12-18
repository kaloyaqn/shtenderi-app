import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/get-session-better-auth';


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
    const session = await getServerSession();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);

    const rawStatus = searchParams.get("status");
    const rawSource = searchParams.get("source");
    const rawPartnerName = searchParams.get("partnerName");
    const rawUserName = searchParams.get("userName");
    const rawUser = searchParams.get("user");
    const rawStand = searchParams.get("stand");
    const rawStore = searchParams.get("store");
    const rawInvoice = searchParams.get("invoice");
    const rawDateFrom = searchParams.get("dateFrom");
    const rawDateTo = searchParams.get("dateTo");


    const clean = (v) =>
      v && v !== "null" && v !== "undefined" && v !== "" ? v : undefined;

    const status = clean(rawStatus);
    const source = clean(rawSource);
    const partnerName = clean(rawPartnerName);
    const userName = clean(rawUserName);
    const user = clean(rawUser);
    const stand = clean(rawStand);
    const store = clean(rawStore);
    const invoice = clean(rawInvoice);
    const dateFrom = clean(rawDateFrom);
    const dateTo = clean(rawDateTo);

    const where = {};


    if (session.user.role === "USER") {
      const userStands = await prisma.userStand.findMany({
        where: { userId: session.user.id },
        select: { standId: true },
      });

      where.standId = { in: userStands.map((s) => s.standId) };
    }

    if (status === "PAID" || status === "NOT_PAID") {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};

      if (dateFrom) {
        where.createdAt.gte = new Date(`${dateFrom}T00:00:00.000Z`);
      }

      if (dateTo) {
        where.createdAt.lte = new Date(`${dateTo}T23:59:59.999Z`);
      }
    }

    if (source) {
      where.type = source;
    }

    if (user) {
      where.userId = user;
    }

    if (stand) {
      where.standId = stand; // overrides only if a REAL standId is passed
    }

    if (store) {
      where.stand = { storeId: store };
    }

    if (invoice) {
      where.invoiceId = invoice;
    }

    if (partnerName) {
      where.partner = {
        name: { contains: partnerName, mode: "insensitive" },
      };
    }

    if (userName) {
      where.user = {
        OR: [
          { name: { contains: userName, mode: "insensitive" } },
          { email: { contains: userName, mode: "insensitive" } },
        ],
      };
    }

    const revisions = await prisma.revision.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        stand: true,
        storage: true,
        partner: true,
        user: true,
        missingProducts: {
          include: {
            product: true,
          },
        },
        invoice: true,
      },
    });

    // Sum price of missingProducts for each revision
    revisions.forEach(rev => {
      rev.missingProductsTotalPrice =
        rev.missingProducts?.reduce((sum, mp) => {
          const unit = mp.priceAtSale ?? mp.product?.clientPrice ?? 0;
          const qty = mp.givenQuantity ?? mp.missingQuantity ?? 0;
          return sum + unit * qty;
        }, 0) ?? 0;
    });

    return NextResponse.json(revisions);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch revisions" },
      { status: 500 }
    );
  }
}
