import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session-better-auth";
import { updateInvoicePaymentStatus } from "@/lib/invoice/update-invoice-payment-status";
import { RevisionStatus } from "@prisma/client";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { invoiceId } = params;
    if (!invoiceId) {
      return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 });
    }

    const { amount, method, storageId } = await req.json();
    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Amount must be positive" }, { status: 400 });
    }
    if (!["CASH", "BANK"].includes(method)) {
      return NextResponse.json({ error: "Invalid method" }, { status: 400 });
    }
    if (!storageId) {
      return NextResponse.json({ error: "storageId is required" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { id: true, revisionId: true },
    });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    let cashRegister = await prisma.cashRegister.findUnique({ where: { storageId } });
    if (!cashRegister) {
      cashRegister = await prisma.cashRegister.create({ data: { storageId } });
    }

    const payment = await prisma.payment.create({
      data: {
        amount: Number(amount),
        method,
        revisionId: invoice.revisionId || "",
        invoiceId,
        cashRegisterId: cashRegister.id,
        userId: session.user.id,
      },
    });

    if (method === "CASH") {
      await prisma.cashRegister.update({
        where: { id: cashRegister.id },
        data: { cashBalance: { increment: Number(amount) } },
      });
    }

    await updateInvoicePaymentStatus(invoiceId);

    // Also update revision payment status if linked
    if (invoice.revisionId) {
      try {
        const payments = await prisma.payment.aggregate({
          where: { revisionId: invoice.revisionId },
          _sum: { amount: true },
        });
        const revision = await prisma.revision.findUnique({
          where: { id: invoice.revisionId },
          include: {
            missingProducts: { include: { product: true } },
          },
        });
        if (revision) {
          const totalSale = revision.missingProducts.reduce((sum, mp) => {
            const price = mp.priceAtSale ?? mp.product?.clientPrice ?? 0;
            const qty = mp.givenQuantity ?? mp.missingQuantity ?? 0;
            return sum + price * qty;
          }, 0);
          const paid = Number(payments._sum.amount || 0);
          const newStatus =
            paid >= totalSale - 0.01 && totalSale > 0 ? RevisionStatus.PAID : RevisionStatus.NOT_PAID;
          if (newStatus !== revision.status) {
            await prisma.revision.update({
              where: { id: revision.id },
              data: { status: newStatus },
            });
          }
        }
      } catch (err) {
        console.error("REVISION_STATUS_UPDATE_ERROR", err);
      }
    }

    const updatedInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        payments: {
          include: { user: true, cashRegister: { include: { storage: true } } },
          orderBy: { createdAt: "desc" },
        },
        creditNotes: true,
      },
    });

    return NextResponse.json({ payment, invoice: updatedInvoice });
  } catch (err) {
    console.error("INVOICE_PAYMENT_POST_ERROR", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
