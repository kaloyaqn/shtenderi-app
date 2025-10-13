import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Special cash register logic: Deliveries are EXPENSES for the Main storage cash.
// We create a negative cash movement (WITHDRAWAL) and mark delivery as PAID when covered.
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { deliveryId } = params;
    const { method = 'CASH', amount } = await req.json();
    if (!['CASH', 'BANK'].includes(method)) return NextResponse.json({ error: 'Invalid method' }, { status: 400 });
    if (typeof amount !== 'number' || amount <= 0) return NextResponse.json({ error: 'Amount must be > 0' }, { status: 400 });

    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { products: true, storage: true, payments: true },
    });
    if (!delivery) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (delivery.status !== 'ACCEPTED') return NextResponse.json({ error: 'Delivery must be accepted first' }, { status: 400 });

    // Compute total from line items
    const total = delivery.products.reduce((s, p) => s + p.quantity * p.unitPrice, 0);
    const paidSoFar = delivery.payments.reduce((s, p) => s + p.amount, 0);
    const remaining = Math.max(0, total - paidSoFar);
    if (amount > remaining) return NextResponse.json({ error: 'Amount exceeds remaining' }, { status: 400 });
    const payAmount = amount;

    // Ensure cash register exists for storage
    let cashRegister = await prisma.cashRegister.findUnique({ where: { storageId: delivery.storageId } });
    if (!cashRegister) cashRegister = await prisma.cashRegister.create({ data: { storageId: delivery.storageId } });

    // Save delivery payment row
    await prisma.deliveryPayment.create({ data: { deliveryId, amount: payAmount, method, userId: session.user.id } });

    // Record cash movement for expenses when method is CASH
    if (method === 'CASH') {
      await prisma.cashMovement.create({
        data: {
          amount: payAmount,
          type: 'WITHDRAWAL',
          cashRegisterId: cashRegister.id,
          userId: session.user.id,
          reason: `Плащане Доставка №${delivery.number}`,
        },
      });
      await prisma.cashRegister.update({
        where: { id: cashRegister.id },
        data: { cashBalance: { decrement: payAmount } },
      });
    }

    // Recompute paid status
    const newPaid = paidSoFar + payAmount;
    const newStatus = newPaid >= total ? 'PAID' : 'NOT_PAID';
    await prisma.delivery.update({ where: { id: deliveryId }, data: { paidStatus: newStatus } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELIVERIES_PAY_POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


