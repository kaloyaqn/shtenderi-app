import { prisma } from "@/lib/prisma";
import { generateInvoicePdf } from "@/lib/print/print-service";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { invoiceId } = await req.json();
    if (!invoiceId) {
      return new Response("invoiceId is required", { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return new Response("Invoice not found", { status: 404 });
    }

    const pdf = await generateInvoicePdf({ invoice });
    return buildPdfResponse(pdf, `invoice-${invoice.invoiceNumber || invoiceId}.pdf`);
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
