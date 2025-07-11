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
    const { searchParams } = new URL(req.url);
    let start, end;
    const period = searchParams.get('period');
    if (period) {
      ({ start, end } = getPeriodDates(period));
    } else {
      start = searchParams.get('start');
      end = searchParams.get('end');
      if (!start || !end) {
        return NextResponse.json({ error: 'Missing start or end date' }, { status: 400 });
      }
      start = new Date(start);
      end = new Date(end);
    }
    const result = await getPartnerGrossIncome(partnerId, start, end, prisma);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 