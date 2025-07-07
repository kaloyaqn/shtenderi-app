import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { invoiceId, amount, method, cashRegisterId } = await req.json();

  if (!invoiceId || !amount || !method || (method === 'CASH' && !cashRegisterId)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // 1. Validate invoice
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // 2. If cash, validate cash register
    let cashRegister = null;
    if (method === 'CASH') {
      cashRegister = await prisma.cashRegister.findUnique({ where: { id: cashRegisterId } });
      if (!cashRegister) {
        return NextResponse.json({ error: 'Cash register not found' }, { status: 404 });
      }
    }

    // 3. Create payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: parseFloat(amount),
        method,
        cashRegisterId: method === 'CASH' ? cashRegisterId : null,
        createdById: session.user.id,
      },
    });

    // 4. Calculate total paid for this invoice
    const payments = await prisma.payment.findMany({ where: { invoiceId } });
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const obligation = invoice.totalValue - totalPaid;

    // 5. Update partner and stand obligations
    let updatedPartner = null;
    let updatedStand = null;
    if (invoice.standId) {
      const stand = await prisma.stand.findUnique({
        where: { id: invoice.standId },
        include: { store: { select: { partnerId: true } } }
      });
      if (stand) {
        updatedStand = await prisma.stand.update({
          where: { id: stand.id },
          data: { obligation: { decrement: parseFloat(amount) } }
        });
        if (stand.store?.partnerId) {
          updatedPartner = await prisma.partner.update({
            where: { id: stand.store.partnerId },
            data: { obligation: { decrement: parseFloat(amount) } }
          });
        }
      }
    }

    // 6. Return updated info
    return NextResponse.json({
      payment,
      invoice: { ...invoice, totalPaid, obligation },
      partnerObligation: updatedPartner?.obligation ?? null,
      standObligation: updatedStand?.obligation ?? null,
    });
  } catch (error) {
    console.error('[PAYMENT_POST_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const invoiceId = searchParams.get('invoiceId');
  const where = {};
  if (invoiceId) where.invoiceId = invoiceId;
  try {
    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { cashRegister: true, invoice: true },
    });
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 