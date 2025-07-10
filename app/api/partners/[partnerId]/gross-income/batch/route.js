import { getPartnerGrossIncome } from '@/lib/partners/partner';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

function getPeriodDates(period) {
  const now = new Date();
  let start, end;
  if (period === 'this_month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  } else if (period === 'last_month') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === 'this_week') {
    const day = now.getDay() || 7;
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(now.getDate() - day + 1);
    end = new Date(start);
    end.setDate(start.getDate() + 7);
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
    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 