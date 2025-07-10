import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // Get counts
  const [stands, products, partners, stores] = await Promise.all([
    prisma.stand.count(),
    prisma.product.count(),
    prisma.partner.count(),
    prisma.store.count(),
  ]);

  // Gross income this month (sum of all sales from revisions in the month)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  // In the revisionsThisMonth query, include missingProducts.product
  const revisionsThisMonth = await prisma.revision.findMany({
    where: {
      createdAt: {
        gte: startOfMonth,
        lt: endOfMonth,
      },
    },
    include: {
      missingProducts: { include: { product: true } },
    },
  });
  let grossIncome = 0;
  for (const rev of revisionsThisMonth) {
    for (const mp of rev.missingProducts) {
      grossIncome += (mp.missingQuantity || 0) * (mp.priceAtSale || 0);
    }
  }

  // Stands needing resupply: stands with at least one product below threshold
  const LOW_STOCK_THRESHOLD = 5;
  const standProducts = await prisma.standProduct.findMany({
    where: {
      quantity: { lt: LOW_STOCK_THRESHOLD },
    },
    select: { standId: true },
  });
  const standsNeedingResupply = new Set(standProducts.map(sp => sp.standId));

  // --- Sales by Stand (bar chart) ---
  // Map standId to stand name
  const standIdToName = Object.fromEntries(
    (await prisma.stand.findMany({ select: { id: true, name: true } })).map(s => [s.id, s.name])
  );
  // Sum sales per stand
  const salesByStandMap = {};
  for (const rev of revisionsThisMonth) {
    const standId = rev.standId;
    if (!standId) continue;
    let standTotal = 0;
    for (const mp of rev.missingProducts) {
      const price = mp.priceAtSale || (mp.product?.clientPrice || 0);
      standTotal += (mp.missingQuantity || 0) * price;
    }
    salesByStandMap[standId] = (salesByStandMap[standId] || 0) + standTotal;
  }
  const salesByStand = Object.entries(salesByStandMap).map(([standId, value]) => ({
    name: standIdToName[standId] || standId,
    value: Number(value.toFixed(2)),
  })).sort((a, b) => b.value - a.value);

  // --- Top Products (bar chart) ---
  const productSalesMap = {};
  for (const rev of revisionsThisMonth) {
    for (const mp of rev.missingProducts) {
      // Get product name
      const name = mp.product?.name || mp.productId;
      productSalesMap[name] = (productSalesMap[name] || 0) + (mp.missingQuantity || 0);
    }
  }
  const topProducts = Object.entries(productSalesMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // --- Sales Trend (line chart) ---
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const salesTrendMap = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const day = new Date(now.getFullYear(), now.getMonth(), d);
    const key = day.toISOString().slice(0, 10);
    salesTrendMap[key] = 0;
  }
  for (const rev of revisionsThisMonth) {
    const day = rev.createdAt ? new Date(rev.createdAt).toISOString().slice(0, 10) : null;
    if (day && salesTrendMap[day] !== undefined) {
      salesTrendMap[day] += rev.totalValue || 0;
    }
  }
  const salesTrend = Object.entries(salesTrendMap).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));

  return NextResponse.json({
    stands,
    products,
    partners,
    stores,
    grossIncome: grossIncome.toFixed(2) + ' лв.',
    resupplyNeeds: standsNeedingResupply.size,
    chartData: [
      { name: 'Щандове', value: stands },
      { name: 'Продукти', value: products },
      { name: 'Клиенти', value: partners },
      { name: 'Магазини', value: stores },
    ],
    salesByStand,
    topProducts,
    salesTrend,
  });
} 