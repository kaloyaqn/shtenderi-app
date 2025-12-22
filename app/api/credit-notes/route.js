import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/get-session-better-auth';


// POST: Create a credit note as a mirror of an existing invoice
export async function POST(req) {
  try {
    const body = await req.json();
    const { invoiceId, refundId, products } = body;
    const session = await getServerSession();
    const preparedBy = session?.user?.name || session?.user?.email || 'System';

    // --- NEW LOGIC: Create credit note from refund ---
    if (refundId) {
      // 1. Fetch the refund and its products
      const refund = await prisma.refund.findUnique({
        where: { id: refundId },
        include: {
          refundProducts: { include: { product: true } },
          user: true,
        },
      });
      if (!refund) {
        return NextResponse.json({ error: 'Refund not found' }, { status: 404 });
      }
      // 2. Partner info: get from the first product's partner (or extend Refund schema if needed)
      // For now, assume partner info is in the refund's user or source (customize as needed)
      // 3. Validate products
      if (!Array.isArray(products) || products.length === 0) {
        return NextResponse.json({ error: 'No products provided' }, { status: 400 });
      }
      // 4. Calculate already credited quantities for this refund
      const existingCreditNotes = await prisma.creditNote.findMany({
        where: { refundId },
        select: { products: true },
      });
      const creditedByProductId = {};
      existingCreditNotes.forEach((cn) => {
        const prods = Array.isArray(cn.products) ? cn.products : [];
        prods.forEach((p) => {
          const pid = p.productId;
          if (!pid) return;
          creditedByProductId[pid] = (creditedByProductId[pid] || 0) + Number(p.quantity || 0);
        });
      });
      // 5. For each product, check if it is in the refund and not already over-credited
      for (const p of products) {
        const refundProduct = refund.refundProducts.find(rp => rp.productId === p.productId);
        if (!refundProduct) {
          return NextResponse.json({ error: `Този продукт не фигурира в избраното връщане` }, { status: 400 });
        }
        const alreadyCreditedQty = creditedByProductId[p.productId] || 0;
        const requestedQty = Number(p.quantity || 0);
        if (alreadyCreditedQty + requestedQty > refundProduct.quantity) {
          const remaining = Math.max(refundProduct.quantity - alreadyCreditedQty, 0);
          return NextResponse.json(
            { error: `Можете да кредитирате още ${remaining} бр. за ${refundProduct.product?.name || 'този продукт'}` },
            { status: 400 }
          );
        }
        // reserve in map to also account for multiple entries of same product in current request
        creditedByProductId[p.productId] = alreadyCreditedQty + requestedQty;
      }
      // 6. For each product, find invoices for the partner where the product is present and not fully credited
      // (Assume partner info is available, or extend Refund to include partnerId)
      // For now, skip invoice linkage and just create the credit note with the products and refund info
      // 7. Fetch invoices referenced by the selected products to lock prices to the invoice values
      const invoiceIds = Array.from(new Set((products || []).map(p => p.invoiceId).filter(Boolean)));
      const invoices = invoiceIds.length
        ? await prisma.invoice.findMany({ where: { id: { in: invoiceIds } } })
        : [];
      const invoiceById = Object.fromEntries(invoices.map(i => [i.id, i]));

      const findProductInInvoice = (invoice, product) => {
        if (!invoice) return null;
        const list = Array.isArray(invoice.products) ? invoice.products : [];
        const productId = product.productId || product.id || product.product?.id;
        const barcode = product.barcode || product.product?.barcode;
        const pcode = product.pcode || product.product?.pcode;
        return list.find(
          (p) =>
            p.productId === productId ||
            p.id === productId ||
            p.product?.id === productId ||
            (barcode && (p.barcode === barcode || p.product?.barcode === barcode)) ||
            (pcode && (p.pcode === pcode || p.product?.pcode === pcode))
        );
      };

      // 8. Build credit note products using the price from the chosen invoice line when available
      const creditNoteProducts = products.map(p => {
        const invoice = p.invoiceId ? invoiceById[p.invoiceId] : null;
        const invProduct = invoice ? findProductInInvoice(invoice, p) : null;
        const clientPrice = invProduct?.clientPrice ?? p.clientPrice ?? 0;

        return {
          ...p,
          clientPrice: Number(clientPrice),
        };
      });

      // 9. Select partner info from the first matched invoice if present
      const partnerInvoice = invoices[0];

      // 10. Get the next credit note number
      const lastCreditNote = await prisma.creditNote.findFirst({ orderBy: { creditNoteNumber: 'desc' } });
      const nextNumber = (lastCreditNote?.creditNoteNumber || 0) + 1;

      // 11. Create the credit note
      const totalValue = creditNoteProducts.reduce((sum, p) => sum + (p.quantity * (p.clientPrice || 0)), 0);
      const vatBase = totalValue / 1.2;
      const vatAmount = totalValue - vatBase;

      const newCreditNote = await prisma.creditNote.create({
        data: {
          creditNoteNumber: nextNumber,
          issuedAt: new Date(),
          partnerName: partnerInvoice?.partnerName || refund.user?.name || '',
          partnerBulstat: partnerInvoice?.partnerBulstat || '',
          partnerMol: partnerInvoice?.partnerMol || '',
          partnerAddress: partnerInvoice?.partnerAddress || '',
          partnerCountry: partnerInvoice?.partnerCountry || '',
          partnerCity: partnerInvoice?.partnerCity || '',
          preparedBy,
          products: creditNoteProducts,
          totalValue,
          vatBase,
          vatAmount,
          paymentMethod: 'CASH',
          invoiceId: products[0]?.invoiceId || null, // Link to the first invoice if available
          refundId: refundId, // <-- set refundId if present
        },
      });
      return NextResponse.json(newCreditNote, { status: 201 });
    }
    // --- EXISTING LOGIC: Create credit note from invoice ---
    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 });
    }

    // 1. Fetch the original invoice
    const originalInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });
    if (!originalInvoice) {
      return NextResponse.json({ error: 'Original invoice not found' }, { status: 404 });
    }

    // 2. Check if a credit note for this invoice already exists to prevent duplicates
    const existingCreditNote = await prisma.creditNote.findFirst({
        where: { invoiceId: invoiceId },
    });
    if (existingCreditNote) {
        // Redirect to the existing credit note or send its data
        return NextResponse.json(existingCreditNote);
    }

    // 3. Get the next credit note number
    const lastCreditNote = await prisma.creditNote.findFirst({ orderBy: { creditNoteNumber: 'desc' } });
    const nextNumber = (lastCreditNote?.creditNoteNumber || 0) + 1;

    // 4. Create the new credit note by copying data
    const newCreditNote = await prisma.creditNote.create({
      data: {
        creditNoteNumber: nextNumber,
        issuedAt: new Date(),
        partnerName: originalInvoice.partnerName,
        partnerBulstat: originalInvoice.partnerBulstat,
        partnerMol: originalInvoice.partnerMol,
        partnerAddress: originalInvoice.partnerAddress,
        partnerCountry: originalInvoice.partnerCountry,
        partnerCity: originalInvoice.partnerCity,
        preparedBy: preparedBy,
        products: originalInvoice.products, // Direct copy
        totalValue: originalInvoice.totalValue,
        vatBase: originalInvoice.vatBase,
        vatAmount: originalInvoice.vatAmount,
        paymentMethod: originalInvoice.paymentMethod,
        invoiceId: originalInvoice.id, // Link to the original invoice
      },
    });

    return NextResponse.json(newCreditNote, { status: 201 });

  } catch (error) {
    console.error('CREDIT_NOTE_POST_ERROR', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Fetch all credit notes or a specific credit note
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const creditNoteId = searchParams.get('id');
    const refundId = searchParams.get('refundId'); // <-- add this

    // If ID is present, get one specific credit note
    if (creditNoteId) {
    const creditNote = await prisma.creditNote.findUnique({
      where: { id: creditNoteId },
      include: { invoice: true } // Include the linked invoice
    });

    if (!creditNote) {
      return NextResponse.json({ error: 'Credit note not found' }, { status: 404 });
    }
    return NextResponse.json(creditNote);
    }

    // If refundId is present, filter by it
    if (refundId) {
      const creditNotes = await prisma.creditNote.findMany({
        where: { refundId },
        orderBy: { creditNoteNumber: 'desc' },
      });
      return NextResponse.json(creditNotes);
    }

    // If no ID and no refundId, get all credit notes for the list view
    const creditNotes = await prisma.creditNote.findMany({
      orderBy: { creditNoteNumber: 'desc' },
    });
    return NextResponse.json(creditNotes);
  } catch (error) {
    console.error('CREDIT_NOTE_GET_ERROR', error);
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
