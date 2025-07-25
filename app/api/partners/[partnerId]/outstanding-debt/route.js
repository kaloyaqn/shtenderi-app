import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { partnerId } = params;
  if (!partnerId) {
    return NextResponse.json({ error: 'Missing partnerId' }, { status: 400 });
  }
  // Get all revisions for this partner
  const revisions = await prisma.revision.findMany({
    where: { partnerId },
    select: {
      id: true,
      missingProducts: { 
        select: { 
          missingQuantity: true, 
          givenQuantity: true,
          priceAtSale: true, 
          product: { select: { clientPrice: true } } 
        } 
      },
    },
  });
  // Calculate total sales
  let totalSales = 0;
  const revisionIds = [];
  for (const rev of revisions) {
    revisionIds.push(rev.id);
    for (const mp of rev.missingProducts) {
      const price = mp.priceAtSale ?? mp.product?.clientPrice ?? 0;
      // Use givenQuantity if available (for sale mode), otherwise use missingQuantity
      const quantity = mp.givenQuantity !== null ? mp.givenQuantity : (mp.missingQuantity ?? 0);
      
      // Ensure both price and quantity are valid numbers
      const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
      const validQuantity = typeof quantity === 'number' && !isNaN(quantity) ? quantity : 0;
      
      const productTotal = validQuantity * validPrice;
      totalSales += productTotal;
      
      console.log(`[OUTSTANDING-DEBT] Product calculation: quantity=${quantity} (valid: ${validQuantity}), price=${price} (valid: ${validPrice}), total=${productTotal}`);
    }
  }
  // Calculate total payments
  const payments = await prisma.payment.findMany({
    where: { revisionId: { in: revisionIds } },
    select: { amount: true, revisionId: true },
  });
  const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const outstandingDebt = totalSales - totalPayments;
  
  console.log(`[OUTSTANDING-DEBT] Found ${payments.length} payments for ${revisionIds.length} revisions`);
  console.log(`[OUTSTANDING-DEBT] Payment details:`, payments.map(p => ({ revisionId: p.revisionId, amount: p.amount })));
  console.log(`[OUTSTANDING-DEBT] Final calculation: totalSales=${totalSales}, totalPayments=${totalPayments}, outstandingDebt=${outstandingDebt}`);
  
  // Ensure all values are valid numbers
  const validTotalSales = typeof totalSales === 'number' && !isNaN(totalSales) ? totalSales : 0;
  const validTotalPayments = typeof totalPayments === 'number' && !isNaN(totalPayments) ? totalPayments : 0;
  const validOutstandingDebt = typeof outstandingDebt === 'number' && !isNaN(outstandingDebt) ? outstandingDebt : 0;
  
  return NextResponse.json({ 
    outstandingDebt: Number(validOutstandingDebt).toFixed(2),
    totalSales: Number(validTotalSales).toFixed(2),
    totalPayments: Number(validTotalPayments).toFixed(2)
  });
} 