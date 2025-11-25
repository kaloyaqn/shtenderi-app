import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/get-session-better-auth';

import { prisma } from '@/lib/prisma';

// Create delivery draft (manual)
export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { supplierId, storageId, products } = await req.json();
    if (!supplierId || !storageId || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Validate refs
    const [supplier, storage] = await Promise.all([
      prisma.deliveryPartner.findUnique({ where: { id: supplierId }, select: { id: true } }),
      prisma.storage.findUnique({ where: { id: storageId }, select: { id: true } }),
    ]);
    if (!supplier) return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    if (!storage) return NextResponse.json({ error: 'Storage not found' }, { status: 404 });

    for (const p of products) {
      const hasProduct = !!p.productId;
      const hasUnresolved = !!(p.barcode || p.name);
      if ((!hasProduct && !hasUnresolved) || typeof p.quantity !== 'number' || p.quantity <= 0 || typeof p.unitPrice !== 'number' || typeof p.clientPrice !== 'number') {
        return NextResponse.json({ error: 'Each item requires productId OR (barcode/name), quantity>0, unitPrice, clientPrice' }, { status: 400 });
      }
      if (hasProduct) {
        const exists = await prisma.product.findUnique({ where: { id: p.productId }, select: { id: true } });
        if (!exists) return NextResponse.json({ error: `Product not found: ${p.productId}` }, { status: 404 });
      }
    }

    // Next delivery number
    const last = await prisma.delivery.findFirst({ orderBy: { number: 'desc' }, select: { number: true } });
    const nextNumber = (last?.number || 0) + 1;

    // Merge duplicate productId rows to satisfy unique (deliveryId, productId)
    const resolved = products.filter(p => !!p.productId);
    const unresolved = products.filter(p => !p.productId);

    const aggregatedByProduct = new Map();
    for (const p of resolved) {
      const key = p.productId;
      const existing = aggregatedByProduct.get(key);
      if (existing) {
        aggregatedByProduct.set(key, {
          ...existing,
          // Sum quantities; keep latest prices/labels
          quantity: existing.quantity + p.quantity,
          unitPrice: p.unitPrice,
          clientPrice: p.clientPrice,
          barcode: p.barcode || existing.barcode || null,
          pcd: p.pcd || existing.pcd || null,
          name: p.name || existing.name || null,
        });
      } else {
        aggregatedByProduct.set(key, {
          productId: p.productId,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          clientPrice: p.clientPrice,
          barcode: p.barcode || null,
          pcd: p.pcd || null,
          name: p.name || null,
        });
      }
    }

    const createLines = [
      // unresolved lines (no productId)
      ...unresolved.map(p => ({
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        clientPrice: p.clientPrice,
        barcode: p.barcode || null,
        pcd: p.pcd || null,
        name: p.name || null,
      })),
      // resolved, aggregated by productId
      ...Array.from(aggregatedByProduct.values()).map(p => ({
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        clientPrice: p.clientPrice,
        barcode: p.barcode,
        pcd: p.pcd,
        name: p.name,
        product: { connect: { id: p.productId } },
      })),
    ];

    const delivery = await prisma.delivery.create({
      data: {
        number: nextNumber,
        supplierId,
        storageId,
        userId: session.user.id,
        products: {
          create: createLines,
        },
      },
      include: { products: true, supplier: true },
    });

    return NextResponse.json(delivery, { status: 201 });
  } catch (error) {
    console.error('[DELIVERIES_POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// List deliveries
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // DRAFT/ACCEPTED
    const paid = searchParams.get('paid'); // NOT_PAID/PAID

    const deliveries = await prisma.delivery.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(paid ? { paidStatus: paid } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { supplier: true, storage: true, products: { include: { product: true } } },
    });
    return NextResponse.json(deliveries);
  } catch (error) {
    console.error('[DELIVERIES_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


