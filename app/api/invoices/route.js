import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST: Create immutable invoice snapshot for a revision
export async function POST(req) {
  try {
    const { revisionId } = await req.json();
    if (!revisionId) {
      return NextResponse.json({ error: 'revisionId is required' }, { status: 400 });
    }

    // Fetch revision with all needed data
    const revision = await prisma.revision.findUnique({
      where: { id: revisionId },
      include: {
        partner: true,
        user: true,
        missingProducts: {
          include: { product: true },
        },
      },
    });
    if (!revision) {
      return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
    }

    // Check if invoice already exists for this revision number
    const existing = await prisma.invoice.findFirst({ where: { revisionNumber: revision.number } });
    if (existing) {
      return NextResponse.json(existing);
    }

    // Get session for preparedBy
    const session = await getServerSession(authOptions);
    const preparedBy = session?.user?.name || session?.user?.email || 'Admin';

    // Prepare products snapshot
    const products = revision.missingProducts.map(mp => ({
      name: mp.product?.name || '-',
      barcode: mp.product?.barcode || '-',
      quantity: mp.missingQuantity,
      clientPrice: mp.product?.clientPrice || 0,
      pcd: mp.product?.pcd || '',
    }));
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.clientPrice), 0);
    const vatBase = totalValue / 1.2;
    const vatAmount = totalValue - vatBase;

    // Get the next invoice number
    const lastInvoice = await prisma.invoice.findFirst({ orderBy: { invoiceNumber: 'desc' } });
    const nextNumber = lastInvoice ? lastInvoice.invoiceNumber + 1 : 1;

    // Create immutable invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: nextNumber,
        issuedAt: new Date(),
        partnerName: revision.partner.name,
        partnerBulstat: revision.partner.bulstat,
        partnerMol: revision.partner.mol,
        partnerAddress: revision.partner.address,
        preparedBy,
        products,
        totalValue,
        vatBase,
        vatAmount,
        paymentMethod: 'CASH', // default, can be changed if needed
        revisionNumber: revision.number,
      },
    });
    return NextResponse.json(invoice);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Fetch all invoices or a specific invoice
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get('id');

    // If ID is present, get one specific invoice (check access later)
    if (invoiceId) {
      const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
      if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      // Security check: does user have access to this invoice's revision stand?
      if (session.user.role === 'USER') {
        const userStands = await prisma.userStand.findMany({ where: { userId: session.user.id }, select: { standId: true } });
        const standIds = userStands.map(s => s.standId);
        const revision = await prisma.revision.findFirst({ where: { number: invoice.revisionNumber }, select: { standId: true } });
        if (!revision || !standIds.includes(revision.standId)) {
          return new NextResponse('Forbidden', { status: 403 });
        }
      }
      return NextResponse.json(invoice);
    }

    // If no ID, get all invoices for the list view
    let whereClause = {};
    if (session.user.role === 'USER') {
      const userStands = await prisma.userStand.findMany({ where: { userId: session.user.id }, select: { standId: true } });
      const standIds = userStands.map(s => s.standId);
      const allowedRevisions = await prisma.revision.findMany({
        where: { standId: { in: standIds } },
        select: { number: true },
      });
      const revisionNumbers = allowedRevisions.map(r => r.number);
      whereClause = {
        revisionNumber: {
          in: revisionNumbers,
        },
      };
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      orderBy: { invoiceNumber: 'desc' },
    });
    return NextResponse.json(invoices);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update an invoice (e.g., payment method)
export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get('id');
    const { paymentMethod } = await req.json();

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }
    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method is required' }, { status: 400 });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { paymentMethod },
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 