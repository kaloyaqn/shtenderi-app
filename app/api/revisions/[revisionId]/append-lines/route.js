import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/get-session-better-auth';

import { getEffectivePrice } from '@/lib/pricing/get-effective-price';

export async function POST(req, { params }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { revisionId } = await params;
  const { sourceStorageId, items } = await req.json();
  if (!revisionId || !sourceStorageId || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Invalid payload: sourceStorageId and items are required' }, { status: 400 });
  }

  try {
    const revision = await prisma.revision.findUnique({
      where: { id: revisionId },
      include: { stand: { include: { store: { include: { partner: true } } } } }
    });
    if (!revision) return NextResponse.json({ error: 'Revision not found' }, { status: 404 });

    const partnerId = revision.stand?.store?.partnerId;
    if (!partnerId) return NextResponse.json({ error: 'Partner not found for stand' }, { status: 400 });

    // Resolve items to products
    const normalized = [];
    for (const it of items) {
      let productId = it.productId || null;
      if (!productId && it.barcode) {
        const prod = await prisma.product.findFirst({ where: { barcode: it.barcode }, select: { id: true, name: true } });
        if (!prod) return NextResponse.json({ error: `Product with barcode ${it.barcode} not found` }, { status: 404 });
        productId = prod.id;
      }
      if (!productId) return NextResponse.json({ error: 'Each item needs productId or barcode' }, { status: 400 });
      const quantity = Number(it.quantity || 0);
      if (!Number.isFinite(quantity) || quantity <= 0) return NextResponse.json({ error: 'Quantity must be > 0' }, { status: 400 });
      normalized.push({ productId, quantity });
    }

    // Validate availability from source and move stock; upsert standProduct; append revision lines
    await prisma.$transaction(async (tx) => {
      // Validate availability first
      for (const { productId, quantity } of normalized) {
        const sp = await tx.storageProduct.findFirst({ where: { storageId: sourceStorageId, productId }, select: { id: true, quantity: true } });
        if (!sp || Number(sp.quantity) < Number(quantity)) {
          throw new Error(`Insufficient stock for product ${productId} in source storage`);
        }
      }

      for (const { productId, quantity } of normalized) {
        // Decrement from source storage
        const sp = await tx.storageProduct.findFirst({ where: { storageId: sourceStorageId, productId }, select: { id: true } });
        if (sp) {
          await tx.storageProduct.update({ where: { id: sp.id }, data: { quantity: { decrement: quantity } } });
        }

        // Increment in stand
        await tx.standProduct.upsert({
          where: { standId_productId: { standId: revision.standId, productId } },
          update: { quantity: { increment: quantity } },
          create: { standId: revision.standId, productId, quantity },
        });

        // Compute effective price
        const priceAtSale = await getEffectivePrice({ productId, partnerId });

        // Append or increment revision lines
        const existing = await tx.missingProduct.findFirst({
          where: { revisionId, productId },
          select: { id: true, missingQuantity: true }
        });
        if (existing) {
          await tx.missingProduct.update({
            where: { id: existing.id },
            data: { missingQuantity: existing.missingQuantity + quantity, priceAtSale }
          });
        } else {
          await tx.missingProduct.create({
            data: { revisionId, productId, missingQuantity: quantity, priceAtSale }
          });
        }
      }
    });

    const updated = await prisma.revision.findUnique({
      where: { id: revisionId },
      include: { missingProducts: { include: { product: true } } }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[REVISION_APPEND_LINES_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


