import { prisma } from "@/lib/prisma";
import { generateInvoicePdf, sendInvoiceEmail } from "@/lib/print/print-service";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { invoiceId } = await req.json();
    const { searchParams } = new URL(req.url);
    const variantParam = searchParams.get("variant");
    const variant = variantParam === "copy" ? "copy" : "original";
    const sendEmail = searchParams.get("send_email") === "1";
    const providedEmail = searchParams.get("email");

    if (!invoiceId) {
      return new Response("invoiceId is required", { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        partner: { select: { email: true } },
        revision: { include: { partner: { select: { email: true } }, stand: { select: { email: true } } } },
      },
    });

    if (!invoice) {
      return new Response("Invoice not found", { status: 404 });
    }

    if (sendEmail) {
      let email =
        providedEmail ||
        invoice.partnerEmail ||
        invoice.partner?.email ||
        invoice.revision?.partner?.email ||
        invoice.revision?.stand?.email ||
        null;

      if (!email) {
        return new Response("Email not found for this invoice", { status: 400 });
      }

      await sendInvoiceEmail({ invoice, variant, to: email });
      return Response.json({ ok: true });
    }

    const pdf = await generateInvoicePdf({ invoice, variant });
    const suffix = variant === "copy" ? "-copy" : "-original";
    const filename = `invoice-${invoice.invoiceNumber || invoiceId}${suffix}.pdf`;
    return buildPdfResponse(pdf, filename);
  } catch (err) {
    console.error("[PRINT_INVOICE_ERROR]", err);
    return new Response(err?.message || "Failed to generate invoice PDF", {
      status: 500,
    });
  }
}

function buildPdfResponse(pdf, filename) {
  return new Response(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${filename}`,
    },
  });
}
