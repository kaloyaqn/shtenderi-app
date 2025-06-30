import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST: Create immutable credit note snapshot for a refund
export async function POST(req) {
  try {
    const { refundId } = await req.json();
    if (!refundId) {
      return NextResponse.json({ error: 'refundId is required' }, { status: 400 });
    }

    // Fetch refund with all needed data
    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: {
        user: true,
        refundProducts: { include: { product: true } },
      },
    });
    if (!refund) {
      return NextResponse.json({ error: 'Refund not found' }, { status: 404 });
    }

    // New logic: Generate a credit note per invoice for refund products
    // 1. Get partner info (as before)
    let partnerName = '';
    let partnerBulstat = '';
    let partnerMol = '';
    let partnerAddress = '';
    let partnerInvoices = [];
    if (refund.sourceType === 'STAND') {
      const stand = await prisma.stand.findUnique({
        where: { id: refund.sourceId },
        include: { store: { include: { partner: true } } },
      });
      if (stand?.store?.partner) {
        partnerName = stand.store.partner.name;
        partnerBulstat = stand.store.partner.bulstat;
        partnerMol = stand.store.partner.mol;
        partnerAddress = stand.store.partner.address;
        // Fetch all invoices for this partner, newest first
        partnerInvoices = await prisma.invoice.findMany({
          where: { partnerName: partnerName },
          orderBy: { issuedAt: 'desc' },
        });
        console.log('DEBUG: partnerName:', partnerName);
        console.log('DEBUG: partnerInvoices:', partnerInvoices.map(i => ({ invoiceNumber: i.invoiceNumber, issuedAt: i.issuedAt, products: i.products.map(p => p.barcode) })));
      }
    } else if (refund.sourceType === 'STORAGE') {
      // Extend if storages are linked to partners
    }

    // 2. For each refund product, find the latest invoice that contains it
    const productToInvoice = {};
    const skippedProducts = [];
    for (const rp of refund.refundProducts) {
      let found = false;
      for (const invoice of partnerInvoices) {
        if (Array.isArray(invoice.products) && invoice.products.some(p => p.barcode === rp.product.barcode)) {
          productToInvoice[rp.product.barcode] = invoice;
          found = true;
          break;
        }
      }
      if (!found) {
        skippedProducts.push(rp.product.barcode);
      }
    }
    console.log('DEBUG: productToInvoice:', productToInvoice);
    console.log('DEBUG: skippedProducts:', skippedProducts);

    // 3. Group refund products by invoice number
    const invoiceGroups = {};
    for (const rp of refund.refundProducts) {
      const invoice = productToInvoice[rp.product.barcode];
      if (!invoice) continue; // skip products not found in any invoice
      if (!invoiceGroups[invoice.invoiceNumber]) invoiceGroups[invoice.invoiceNumber] = { invoice, products: [] };
      invoiceGroups[invoice.invoiceNumber].products.push(rp);
    }
    console.log('DEBUG: invoiceGroups:', Object.keys(invoiceGroups));

    // 4. For each group, create a credit note
    const createdCreditNotes = [];
    let lastCreditNote = await prisma.creditNote.findFirst({ orderBy: { creditNoteNumber: 'desc' } });
    let nextNumber = lastCreditNote ? lastCreditNote.creditNoteNumber + 1 : 1;
    for (const [invoiceNumber, group] of Object.entries(invoiceGroups)) {
      // Check if a credit note already exists for this refund and invoiceNumber
      const existing = await prisma.creditNote.findFirst({ where: { refundId, invoiceNumber: Number(invoiceNumber) } });
      if (existing) {
        createdCreditNotes.push(existing);
        continue;
      }
      const products = group.products.map(rp => ({
        name: rp.product?.name || '-',
        barcode: rp.product?.barcode || '-',
        quantity: rp.quantity,
        clientPrice: rp.product?.clientPrice || 0,
        pcd: rp.product?.pcd || '',
      }));
      const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.clientPrice), 0);
      const vatBase = totalValue / 1.2;
      const vatAmount = totalValue - vatBase;
      const session = await getServerSession(authOptions);
      const preparedBy = session?.user?.name || session?.user?.email || 'Admin';
      console.log('DEBUG: Creating credit note for invoice', invoiceNumber, 'with products:', products.map(p => p.barcode));
      const creditNote = await prisma.creditNote.create({
        data: {
          creditNoteNumber: nextNumber++,
          issuedAt: new Date(),
          partnerName,
          partnerBulstat,
          partnerMol,
          partnerAddress,
          preparedBy,
          products,
          totalValue,
          vatBase,
          vatAmount,
          paymentMethod: 'CASH',
          refundId: refund.id,
          invoiceNumber: Number(invoiceNumber),
        },
      });
      createdCreditNotes.push(creditNote);
    }
    console.log('DEBUG: createdCreditNotes:', createdCreditNotes.map(cn => ({ creditNoteNumber: cn.creditNoteNumber, invoiceNumber: cn.invoiceNumber })));
    return NextResponse.json(createdCreditNotes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Fetch all credit notes or a specific credit note
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const creditNoteId = searchParams.get('id');
    const refundId = searchParams.get('refundId');

    // If refundId is present, get all credit notes for this refund
    if (refundId) {
      const creditNotes = await prisma.creditNote.findMany({
        where: { refundId },
        orderBy: { creditNoteNumber: 'asc' },
      });
      return NextResponse.json(creditNotes);
    }

    // If no ID, get all credit notes for the list view
    if (!creditNoteId) {
      const creditNotes = await prisma.creditNote.findMany({
        orderBy: { creditNoteNumber: 'desc' },
      });
      return NextResponse.json(creditNotes);
    }

    // If ID is present, get one specific credit note
    const creditNote = await prisma.creditNote.findUnique({
      where: { id: creditNoteId },
    });

    if (!creditNote) {
      return NextResponse.json({ error: 'Credit note not found' }, { status: 404 });
    }
    return NextResponse.json(creditNote);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update a credit note (e.g., payment method)
export async function PUT(req) {
  try {
    const { searchParams } = new URL(req.url);
    const creditNoteId = searchParams.get('id');
    const { paymentMethod } = await req.json();

    if (!creditNoteId) {
      return NextResponse.json({ error: 'Credit Note ID is required' }, { status: 400 });
    }
    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method is required' }, { status: 400 });
    }

    const updatedCreditNote = await prisma.creditNote.update({
      where: { id: creditNoteId },
      data: { paymentMethod },
    });

    return NextResponse.json(updatedCreditNote);
  } catch (error) {
    console.error('Error updating credit note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 