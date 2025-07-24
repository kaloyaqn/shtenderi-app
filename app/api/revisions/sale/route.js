import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req) {
  try {
    const { standId, userId, checkId, saleChecked, selectedStorage } = await req.json();
    
    if (!standId || !userId || !checkId || !Array.isArray(saleChecked) || !selectedStorage) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get the check data to see all missing products
    const check = await prisma.check.findUnique({
      where: { id: checkId },
      include: {
        checkedProducts: { 
          include: { product: true } 
        }
      }
    });

    if (!check) {
      return NextResponse.json({ error: 'Check not found' }, { status: 404 });
    }

    // Get partner info from stand
    const stand = await prisma.stand.findUnique({
      where: { id: standId },
      select: { 
        store: { 
          select: { 
            partnerId: true, 
            partner: { select: { percentageDiscount: true } } 
          } 
        } 
      }
    });

    if (!stand) {
      return NextResponse.json({ error: 'Stand not found' }, { status: 404 });
    }

    const partnerId = stand.store.partnerId;
    const partnerDiscount = stand.store.partner?.percentageDiscount || 0;

    // Get next global revision number
    const last = await prisma.revision.findFirst({ 
      orderBy: { number: 'desc' }, 
      select: { number: true } 
    });
    const nextNumber = last?.number ? last.number + 1 : 1;

    // Process the sale with automatic zeroing
    const result = await prisma.$transaction(async (tx) => {
      // 1. Handle transfer for checked products (if any)
      if (saleChecked.length > 0) {
        // Validate storage has sufficient stock
        const insufficient = [];
        for (const product of saleChecked) {
          const storageProduct = await tx.storageProduct.findFirst({
            where: { storageId: selectedStorage, productId: product.productId },
          });
          if (!storageProduct || storageProduct.quantity < product.checked) {
            insufficient.push({
              productId: product.productId,
              productName: product.name,
              needed: product.checked,
              available: storageProduct ? storageProduct.quantity : 0,
            });
          }
        }
        
        if (insufficient.length > 0) {
          const err = new Error('Insufficient stock');
          err.insufficient = insufficient;
          throw err;
        }

        // Transfer from storage to stand
        for (const product of saleChecked) {
          await tx.storageProduct.update({
            where: { storageId_productId: { storageId: selectedStorage, productId: product.productId } },
            data: { quantity: { decrement: product.checked } },
          });
          await tx.standProduct.upsert({
            where: { standId_productId: { standId, productId: product.productId } },
            update: { quantity: { increment: product.checked } },
            create: { standId, productId: product.productId, quantity: product.checked },
          });
        }
      }

      // 2. Build missingProducts array - ONLY for checked products (actually sold)
      const missingProducts = [];
      
      // Add checked products (transferred and now "sold")
      for (const checked of saleChecked) {
        // Find the original quantity from the check
        const checkProduct = check.checkedProducts.find(cp => cp.productId === checked.productId);
        const originalQuantity = checkProduct?.originalQuantity || checked.checked;
        
        missingProducts.push({
          productId: checked.productId,
          missingQuantity: originalQuantity, // Original quantity (what should have been there)
          givenQuantity: checked.checked, // Actually scanned/transferred
          clientPrice: checked.clientPrice,
        });
      }

      // 3. Handle unchecked products (set stand quantity to 0, but DON'T include in sale)
      const checkedProductIds = saleChecked.map(p => p.productId);
      const uncheckedProducts = check.checkedProducts.filter(cp => 
        cp.quantity > 0 && !checkedProductIds.includes(cp.productId)
      );

      for (const unchecked of uncheckedProducts) {
        // Set stand quantity to 0 for unchecked products
        await tx.standProduct.updateMany({
          where: { standId, productId: unchecked.productId },
          data: { quantity: 0 },
        });
        // DO NOT add to missingProducts - they weren't sold!
      }

      // 4. Create revision (ONLY for checked products - actually sold)
      const revision = await tx.revision.create({
        data: {
          number: nextNumber,
          standId,
          partnerId,
          userId,
          checkId, // Store reference to the check
          missingProducts: {
            create: missingProducts.map(mp => ({
              productId: mp.productId,
              missingQuantity: mp.missingQuantity,
              givenQuantity: mp.givenQuantity,
              priceAtSale: mp.clientPrice * (1 - partnerDiscount / 100),
            }))
          }
        },
        include: { missingProducts: true }
      });

      // 5. Subtract quantities from stand for checked products
      for (const checked of saleChecked) {
        const standProduct = await tx.standProduct.findFirst({
          where: { standId, productId: checked.productId }
        });
        if (standProduct) {
          const newQty = Math.max(0, standProduct.quantity - checked.checked);
          await tx.standProduct.update({
            where: { id: standProduct.id },
            data: { quantity: newQty }
          });
        }
      }

      return revision;
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('Sale revision error:', err);
    
    if (err.message === 'Insufficient stock') {
      return NextResponse.json({ 
        error: 'Insufficient stock', 
        insufficient: err.insufficient || [] 
      }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 