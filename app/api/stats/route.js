import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // Date range for last 30 days
  const now = new Date();
  const startOf30Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29); // includes today
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  // 1. Total sales value (all time)
  const allRevisions = await prisma.revision.findMany({
    include: {
      missingProducts: {
        include: { product: true }
      }
    }
  });
  let totalSalesValue = 0;
  for (const rev of allRevisions) {
    for (const mp of rev.missingProducts) {
      totalSalesValue += (mp.missingQuantity || 0) * (mp.product?.clientPrice || 0);
    }
  }

  // 2, 3, 4. Last 30 days
  const last30DaysRevisions = await prisma.revision.findMany({
    where: {
      createdAt: {
        gte: startOf30Days,
        lt: endOfToday,
      }
    },
    include: {
      missingProducts: {
        include: { product: true }
      }
    }
  });
  let salesLast30Days = 0;
  let itemsSoldLast30Days = 0;
  for (const rev of last30DaysRevisions) {
    for (const mp of rev.missingProducts) {
      salesLast30Days += (mp.missingQuantity || 0) * (mp.product?.clientPrice || 0);
      itemsSoldLast30Days += mp.missingQuantity || 0;
    }
  }
  const salesCountLast30Days = last30DaysRevisions.length;

  return NextResponse.json({
    totalSalesValue,
    salesLast30Days,
    salesCountLast30Days,
    itemsSoldLast30Days
  });
} 