import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Basic transfer: Stand -> Storage (no revision, no refund)
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { standId } = params;
  try {
    const { destinationStorageId, products } = await req.json();

    if (!standId || !destinationStorageId || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Validate existence
      const [stand, storage] = await Promise.all([
        tx.stand.findUnique({ where: { id: standId }, select: { id: true } }),
        tx.storage.findUnique({ where: { id: destinationStorageId }, select: { id: true } }),
      ]);
      if (!stand) throw new Error('Stand not found');
      if (!storage) throw new Error('Destination storage not found');

      // Validate quantities on the stand
      for (const p of products) {
        const sp = await tx.standProduct.findFirst({
          where: { standId, productId: p.productId },
          select: { quantity: true },
        });
        if (!sp || sp.quantity < p.quantity) {
          throw new Error('Insufficient stand quantity for one or more products');
        }
      }

      // Move stock: decrement stand, increment storage
      for (const p of products) {
        await tx.standProduct.updateMany({
          where: { standId, productId: p.productId },
          data: { quantity: { decrement: p.quantity } },
        });

        await tx.storageProduct.upsert({
          where: {
            storageId_productId: { storageId: destinationStorageId, productId: p.productId },
          },
          update: { quantity: { increment: p.quantity } },
          create: { storageId: destinationStorageId, productId: p.productId, quantity: p.quantity },
        });
      }

      // Create a completed transfer record (no confirmation required)
      const transfer = await tx.transfer.create({
        data: {
          sourceStorageId: standId, // we store the stand id in this field (as used elsewhere)
          destinationStorageId: destinationStorageId,
          userId: session.user.id,
          status: 'COMPLETED',
          confirmedById: session.user.id,
          confirmedAt: new Date(),
          products: {
            create: products.map(p => ({ productId: p.productId, quantity: p.quantity })),
          },
        },
        include: { products: true },
      });

      return { ok: true, transfer };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}


