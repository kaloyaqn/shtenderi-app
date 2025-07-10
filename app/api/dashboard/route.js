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

  // Revenue this month (sum of all invoices issued this month)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const invoicesThisMonth = await prisma.invoice.findMany({
    where: {
      issuedAt: {
        gte: startOfMonth,
        lt: endOfMonth,
      },
    },
    select: { totalValue: true, products: true, revisionNumber: true },
  });
  const revenue = invoicesThisMonth.reduce((sum, inv) => sum + (inv.totalValue || 0), 0);

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
  // Get all stands
  const allStands = await prisma.stand.findMany({ select: { id: true, name: true } });
  // Map revisionNumber to standId
  const revisions = await prisma.revision.findMany({
    where: {
      number: { in: invoicesThisMonth.map(inv => inv.revisionNumber).filter(Boolean) },
    },
    select: { number: true, standId: true },
  });
  const revisionToStand = Object.fromEntries(revisions.map(r => [r.number, r.standId]));
  const standIdToName = Object.fromEntries(allStands.map(s => [s.id, s.name]));
  // Sum sales per stand
  const salesByStandMap = {};
  for (const inv of invoicesThisMonth) {
    const standId = revisionToStand[inv.revisionNumber];
    if (!standId) continue;
    salesByStandMap[standId] = (salesByStandMap[standId] || 0) + (inv.totalValue || 0);
  }
  const salesByStand = Object.entries(salesByStandMap).map(([standId, value]) => ({
    name: standIdToName[standId] || standId,
    value: Number(value.toFixed(2)),
  })).sort((a, b) => b.value - a.value);

  // --- Top Products (bar chart) ---
  const productSalesMap = {};
  for (const inv of invoicesThisMonth) {
    for (const p of inv.products || []) {
      if (!p.name) continue;
      productSalesMap[p.name] = (productSalesMap[p.name] || 0) + (p.quantity || 0);
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
  for (const inv of invoicesThisMonth) {
    const day = inv.issuedAt ? new Date(inv.issuedAt).toISOString().slice(0, 10) : null;
    if (day && salesTrendMap[day] !== undefined) {
      salesTrendMap[day] += inv.totalValue || 0;
    }
  }
  const salesTrend = Object.entries(salesTrendMap).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));

  return NextResponse.json({
    stands,
    products,
    partners,
    stores,
    revenue: revenue.toFixed(2) + ' лв.',
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