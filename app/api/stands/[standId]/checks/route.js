import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  const { standId } = params;
  const checks = await prisma.check.findMany({
    where: { standId },
    include: {
      checkedProducts: {
        include: { product: true },
      },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(checks);
}

export async function POST(req, { params }) {
  const { standId } = params;
  const body = await req.json();
  const { userId, checkedProducts } = body;
  if (!userId || !Array.isArray(checkedProducts)) {
    return NextResponse.json({ error: 'Missing userId or checkedProducts' }, { status: 400 });
  }
  
  // Use transaction to ensure data consistency
  const check = await prisma.$transaction(async (tx) => {
    // 1. Get current stand quantities for all products in the check
    const standProducts = await tx.standProduct.findMany({
      where: { 
        standId,
        productId: { in: checkedProducts.map(cp => cp.productId) }
      },
      select: { productId: true, quantity: true }
    });
    
    console.log('[CHECK-CREATION] Stand products found:', standProducts);
    console.log('[CHECK-CREATION] Checked products:', checkedProducts);
    
    // 2. Create the check with current stand quantities
    const newCheck = await tx.check.create({
      data: {
        standId,
        userId,
        checkedProducts: {
          create: checkedProducts.map(cp => {
            const standProduct = standProducts.find(sp => sp.productId === cp.productId);
            const checkProductData = {
              productId: cp.productId,
              quantity: cp.quantity, // Missing quantity from check
              originalQuantity: cp.originalQuantity, // Original quantity from check
              standQuantityAtCheck: standProduct?.quantity || 0, // Current stand quantity at check time
              status: cp.status || 'ok',
            };
            console.log('[CHECK-CREATION] Creating check product:', checkProductData);
            return checkProductData;
          }),
        },
      },
      include: {
        checkedProducts: true,
      },
    });
    
    return newCheck;
  });
  
  return NextResponse.json(check);
} 