import { NextResponse } from 'next/server';
import { getEffectivePrice } from '@/lib/pricing/get-effective-price';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return NextResponse.json({ items: [], total: 0 }, { status: 200 });
    }

    const results = await Promise.all(items.map(async (it) => {
      const productId = it.productId;
      const partnerId = it.partnerId || null;
      const price = await getEffectivePrice({ productId, partnerId });
      const quantity = Number(it.quantity || 1);
      return { productId, price, quantity, lineTotal: Number(price) * quantity };
    }));

    const total = results.reduce((sum, r) => sum + Number(r.lineTotal || 0), 0);
    return NextResponse.json({ items: results, total }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to compute effective prices' }, { status: 500 });
  }
}


