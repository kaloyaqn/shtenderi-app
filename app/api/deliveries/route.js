import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Create delivery draft (manual)
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
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
      if (!p.productId || typeof p.quantity !== 'number' || p.quantity <= 0 || typeof p.unitPrice !== 'number') {
        return NextResponse.json({ error: 'Each item requires productId, quantity>0, unitPrice' }, { status: 400 });
      }
      const exists = await prisma.product.findUnique({ where: { id: p.productId }, select: { id: true } });
      if (!exists) return NextResponse.json({ error: `Product not found: ${p.productId}` }, { status: 404 });
    }

    // Next delivery number
    const last = await prisma.delivery.findFirst({ orderBy: { number: 'desc' }, select: { number: true } });
    const nextNumber = (last?.number || 0) + 1;

    const delivery = await prisma.delivery.create({
      data: {
        number: nextNumber,
        supplierId,
        storageId,
        userId: session.user.id,
        products: {
          create: products.map(p => ({ productId: p.productId, quantity: p.quantity, unitPrice: p.unitPrice })),
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


