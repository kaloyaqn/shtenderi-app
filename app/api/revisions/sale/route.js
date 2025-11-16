import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/get-session-better-auth';

import { getEffectivePrice } from '@/lib/pricing/get-effective-price';

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

    // Check if this check already has a revision (prevent duplicate sales)
    const existingRevision = await prisma.revision.findFirst({
      where: { checkId: checkId }
    });

    if (existingRevision) {
      return NextResponse.json({ 
        error: 'Check already has a revision/sale. Cannot create duplicate sales from the same check.' 
      }, { status: 409 });
    }

    // Get partner info from stand
    const stand = await prisma.stand.findUnique({
      where: { id: standId },
      select: { 
        store: { 
          select: { 
            partnerId: true, 
            partner: { select: { percentageDiscount: true, priceGroup: true } }
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
    // Patch for: Sale revision error due to undefined partnerId in getEffectivePrice
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
        // Find the missing quantity from the check (not the original stand quantity)
        const checkProduct = check.checkedProducts.find(cp => cp.productId === checked.productId);
        const missingQuantityFromCheck = checkProduct?.quantity || 0; // This is the missing quantity from check
        
        console.log('Sale API Debug:', {
          productId: checked.productId,
          checkProductQuantity: checkProduct?.quantity,
          checkProductOriginalQuantity: checkProduct?.originalQuantity,
          missingQuantityFromCheck,
          givenQuantity: checked.checked
        });
        
        missingProducts.push({
          productId: checked.productId,
          missingQuantity: missingQuantityFromCheck, // Missing quantity from check (what was requested)
          givenQuantity: checked.checked, // Actually scanned/transferred
          clientPrice: checked.clientPrice
        });
      }

      // 3. Handle unchecked products (DON'T change stand quantity, they weren't sold)
      // The stand quantity should remain unchanged for products that weren't given/sold
      // Only products that were actually transferred and sold should affect stand quantities

      // 4. Create revision (ONLY for checked products - actually sold)

      // Defensive: If partnerId is undefined, do not call getEffectivePrice with undefined partnerId
      let safePartnerId = partnerId;
      if (!safePartnerId) {
        // Try to fetch partnerId from stand.store.partnerId again, or fallback to null
        safePartnerId = stand?.store?.partnerId || null;
      }

      const missingProductsWithPrice = await Promise.all(
        missingProducts.map(async mp => ({
          productId: mp.productId,
          missingQuantity: mp.missingQuantity,
          givenQuantity: mp.givenQuantity,
          priceAtSale: safePartnerId
            ? await getEffectivePrice({ productId: mp.productId, partnerId: safePartnerId })
            : mp.clientPrice ?? 0 // fallback to clientPrice if partnerId is not available
        }))
      );

      const revision = await tx.revision.create({
        data: {
          number: nextNumber,
          standId,
          partnerId: safePartnerId,
          userId,
          checkId, // Store reference to the check
          missingProducts: {
            create: missingProductsWithPrice
          }
        },
        include: { missingProducts: true }
      });

      // 5. Update stand quantities based on resupply logic
      console.log('[SALE-COMPLETION] Check data:', check.checkedProducts);
      console.log('[SALE-COMPLETION] Sale checked products:', saleChecked);
      
      for (const checkProduct of check.checkedProducts) {
        const missingQuantity = checkProduct.quantity || 0; // What was missing from check
        const originalStandQuantity = checkProduct.standQuantityAtCheck || 0; // Original stand quantity at check time
        const currentStandQuantity = checkProduct.originalQuantity || 0; // Current stand quantity (after transfers)
        
        // Find how much was actually given in this sale
        const saleProduct = saleChecked.find(sp => sp.productId === checkProduct.productId);
        const givenQuantity = saleProduct?.checked || 0;
        
        console.log('[SALE-COMPLETION] Processing check product:', {
          productId: checkProduct.productId,
          missingQuantity,
          originalStandQuantity,
          currentStandQuantity,
          givenQuantity
        });
        
        if (missingQuantity > 0) {
          const currentStandProduct = await tx.standProduct.findFirst({
            where: { standId, productId: checkProduct.productId }
          });
          
          if (currentStandProduct) {
            let newQuantity;
            
            if (givenQuantity >= missingQuantity) {
              // FULL RESUPPLY: Stand quantity goes back to original
              newQuantity = originalStandQuantity;
              console.log('FULL RESUPPLY - Stand quantity restored to original:', {
                productId: checkProduct.productId,
                originalStandQuantity,
                newQuantity
              });
            } else if (givenQuantity > 0) {
              // PARTIAL RESUPPLY: Stand quantity = quantity found during check + given
              const quantityFoundDuringCheck = originalStandQuantity - missingQuantity;
              newQuantity = quantityFoundDuringCheck + givenQuantity;
              console.log('PARTIAL RESUPPLY - Stand quantity calculated:', {
                productId: checkProduct.productId,
                originalStandQuantity,
                missingQuantity,
                quantityFoundDuringCheck,
                givenQuantity,
                newQuantity
              });
            } else {
              // NO RESUPPLY: Stand quantity = original - missing
              newQuantity = Math.max(0, originalStandQuantity - missingQuantity);
              console.log('NO RESUPPLY - Stand quantity reduced:', {
                productId: checkProduct.productId,
                originalStandQuantity,
                missingQuantity,
                newQuantity
              });
            }
            
            await tx.standProduct.update({
              where: { id: currentStandProduct.id },
              data: { quantity: newQuantity }
            });
          }
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