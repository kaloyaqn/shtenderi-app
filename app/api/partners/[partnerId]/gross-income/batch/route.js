import { getPartnerGrossIncome } from '@/lib/partners/partner';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

function getPeriodDates(period) {
  const now = new Date();
  let start, end;
  if (period === 'this_month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === 'last_month') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (period === 'this_week') {
    end = new Date(now);
    end.setHours(23, 59, 59, 999);
    start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  }
  return { start, end };
}

export async function GET(req, { params }) {
  try {
    const { partnerId } = params;
    const periods = ['this_month', 'last_month', 'this_week'];
    const results = {};
    for (const period of periods) {
      const { start, end } = getPeriodDates(period);
      results[period] = await getPartnerGrossIncome(partnerId, start, end, prisma);
    }
    // Also fetch all-time outstanding debt and totals
    const allTime = await getPartnerGrossIncome(partnerId, new Date('1970-01-01'), new Date(), prisma);
    results['all_time'] = allTime;
    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 