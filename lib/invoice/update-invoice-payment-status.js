"use server";

import { prisma } from "@/lib/prisma";

export async function updateInvoicePaymentStatus(invoiceId) {
  if (!invoiceId) return;
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { id: true, totalValue: true },
  });
  if (!invoice) return;

  const payments = await prisma.payment.aggregate({
    where: { invoiceId },
    _sum: { amount: true },
  });

  const paid = Number(payments._sum.amount || 0);
  const total = Number(invoice.totalValue || 0);
  const epsilon = 0.01;

  let status = "UNPAID";
  if (paid >= total - epsilon && total > 0) status = "PAID";
  else if (paid > 0) status = "PARTIALLY_PAID";

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      paymentStatus: status,
      paidAmount: paid,
    },
  });
}
