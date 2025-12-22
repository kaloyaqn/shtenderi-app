import { prisma } from "@/lib/prisma";
import { generateCreditNotePdf, sendCreditNoteEmail } from "@/lib/print/print-service";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { creditNoteId } = await req.json();
    const { searchParams } = new URL(req.url);
    const variantParam = searchParams.get("variant");
    const variant = variantParam === "copy" ? "copy" : "original";
    const sendEmail = searchParams.get("send_email") === "1";
    const providedEmail = searchParams.get("email");

    if (!creditNoteId) {
      return new Response("creditNoteId is required", { status: 400 });
    }

    let creditNote = await prisma.creditNote.findUnique({
      where: { id: creditNoteId },
      include: {
        invoice: { include: { partner: true } },
        partner: true,
      },
    });

    if (!creditNote) {
      return new Response("Credit note not found", { status: 404 });
    }

    if (sendEmail) {
      let email =
        providedEmail ||
        creditNote.partnerEmail ||
        creditNote.partner?.email ||
        creditNote.invoice?.partnerEmail ||
        creditNote.invoice?.partner?.email ||
        null;

      // Fallback fetch if still missing and a partnerId exists
      if (!email && creditNote.partnerId) {
        const partner = await prisma.partner.findUnique({ where: { id: creditNote.partnerId } });
        email = partner?.email || email;
      }
      if (!email && creditNote.invoice?.partnerId) {
        const partner = await prisma.partner.findUnique({ where: { id: creditNote.invoice.partnerId } });
        email = partner?.email || email;
      }

      if (!email) {
        return new Response("Email not found for this credit note", { status: 400 });
      }

      await sendCreditNoteEmail({ creditNote, variant, to: email });
      return Response.json({ ok: true });
    }

    const pdf = await generateCreditNotePdf({ creditNote, variant });
    const suffix = variant === "copy" ? "-copy" : "-original";
    const filename = `credit-note-${creditNote.creditNoteNumber || creditNoteId}${suffix}.pdf`;
    return buildPdfResponse(pdf, filename);
  } catch (err) {
    console.error("[PRINT_CREDIT_NOTE_ERROR]", err);
    return new Response(err?.message || "Failed to generate credit note PDF", {
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
