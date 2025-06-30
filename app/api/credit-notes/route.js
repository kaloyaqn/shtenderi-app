import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST: Create a credit note as a mirror of an existing invoice
export async function POST(req) {
  try {
    const { invoiceId } = await req.json();
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

    // 4. Get current user
    const session = await getServerSession(authOptions);
    const preparedBy = session?.user?.name || session?.user?.email || 'System';

    // 5. Create the new credit note by copying data
    const newCreditNote = await prisma.creditNote.create({
      data: {
        creditNoteNumber: nextNumber,
        issuedAt: new Date(),
        partnerName: originalInvoice.partnerName,
        partnerBulstat: originalInvoice.partnerBulstat,
        partnerMol: originalInvoice.partnerMol,
        partnerAddress: originalInvoice.partnerAddress,
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
      include: { invoice: true } // Include the linked invoice
    });

    if (!creditNote) {
      return NextResponse.json({ error: 'Credit note not found' }, { status: 404 });
    }
    return NextResponse.json(creditNote);
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