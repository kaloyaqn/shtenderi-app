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
    console.log(`[GROSS_INCOME_BATCH] Request for partnerId: ${partnerId}`);
    const periods = ['this_month', 'last_month', 'this_week'];
    const results = {};
    for (const period of periods) {
      const { start, end } = getPeriodDates(period);
      console.log(`[GROSS_INCOME_BATCH] ${period} period:`, {
        partnerId,
        start: start.toISOString(),
        end: end.toISOString(),
        startLocal: start.toLocaleString('bg-BG'),
        endLocal: end.toLocaleString('bg-BG')
      });
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