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