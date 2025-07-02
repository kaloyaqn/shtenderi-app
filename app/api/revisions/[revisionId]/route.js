import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get a single revision with details
export async function GET(req, { params }) {
  try {
    const { revisionId } = params;
    const revision = await prisma.revision.findUnique({
      where: { id: revisionId },
      include: {
        stand: true,
        partner: true,
        user: true,
        missingProducts: {
          include: { product: true }
        }
      }
    });
    if (!revision) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(revision);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch revision' }, { status: 500 });
  }
}

// Edit a revision (PATCH)
export async function PATCH(req, { params }) {
  try {
    const { revisionId } = params;
    const { missingProducts } = await req.json();
    // For simplicity, delete all and recreate (can be optimized)
    await prisma.missingProduct.deleteMany({ where: { revisionId } });
    await prisma.missingProduct.createMany({
      data: missingProducts.map(mp => ({
        revisionId,
        productId: mp.productId,
        missingQuantity: mp.missingQuantity,
      }))
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update revision' }, { status: 500 });
  }
}

// Duplicate a revision (repeat sale)
export async function POST(req, { params }) {
  try {
    const { revisionId } = params;
    const { standId, userId } = await req.json();
    if (!standId || !userId) {
      return NextResponse.json({ error: 'Missing standId or userId' }, { status: 400 });
    }
    // Get the original revision
    const original = await prisma.revision.findUnique({
      where: { id: revisionId },
      include: { missingProducts: true }
    });
    if (!original) {
      return NextResponse.json({ error: 'Original revision not found' }, { status: 404 });
    }
    // Get partnerId from new stand
    const stand = await prisma.stand.findUnique({
      where: { id: standId },
      select: { store: { select: { partnerId: true } } }
    });
    if (!stand) {
      return NextResponse.json({ error: 'Stand not found' }, { status: 404 });
    }
    const partnerId = stand.store.partnerId;
    // Get next global revision number
    const last = await prisma.revision.findFirst({ orderBy: { number: 'desc' }, select: { number: true } });
    const nextNumber = last?.number ? last.number + 1 : 1;
    // Create new revision
    const revision = await prisma.revision.create({
      data: {
        number: nextNumber,
        standId,
        partnerId,
        userId,
        missingProducts: {
          create: original.missingProducts.map(mp => ({
            productId: mp.productId,
            missingQuantity: mp.missingQuantity,
          }))
        }
      },
      include: { missingProducts: true }
    });
    return NextResponse.json(revision);
  } catch (err) {
    console.error('Repeat revision error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 