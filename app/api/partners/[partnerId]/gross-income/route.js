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
    // Get current calendar week (Monday to Sunday)
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday-based (0 = Monday, 6 = Sunday)
    
    start = new Date(now);
    start.setDate(now.getDate() - daysFromMonday);
    start.setHours(0, 0, 0, 0);
    
    end = new Date(start);
    end.setDate(start.getDate() + 6); // Add 6 days to get to Sunday
    end.setHours(23, 59, 59, 999);
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
      console.log(`[GROSS_INCOME_SINGLE] ${period} period:`, {
        start: start.toISOString(),
        end: end.toISOString(),
        startLocal: start.toLocaleString('bg-BG'),
        endLocal: end.toLocaleString('bg-BG')
      });
    } else {
      start = searchParams.get('start');
      end = searchParams.get('end');
      if (!start || !end) {
        return NextResponse.json({ error: 'Missing start or end date' }, { status: 400 });
      }
      start = new Date(start);
      end = new Date(end);
      console.log(`[GROSS_INCOME_SINGLE] Custom date range:`, {
        start: start.toISOString(),
        end: end.toISOString(),
        startLocal: start.toLocaleString('bg-BG'),
        endLocal: end.toLocaleString('bg-BG')
      });
    }
    const result = await getPartnerGrossIncome(partnerId, start, end, prisma);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 