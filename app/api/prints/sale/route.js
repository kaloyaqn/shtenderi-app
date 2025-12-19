import { generateSalePdf, sendSaleEmail } from "@/lib/print/print-service";

export const runtime = "nodejs";

export async function POST(req) {
  const { searchParams } = new URL(req.url);
  const method = (searchParams.get("method") || "roll").toLowerCase(); // default roll
  const sendEmail = searchParams.get("send_email") === "1";
  const emailTo = searchParams.get("email");

  const { revision, adminName } = await req.json();
  if (!revision) {
    return new Response("Revision data missing", { status: 400 });
  }
  if (sendEmail && !emailTo) {
    return new Response("Missing ?email=... for send_email=1", { status: 400 });
  }

  if (method !== "roll" && method !== "a4") {
    return new Response("Invalid method. Use ?method=roll or ?method=a4", {
      status: 400,
    });
  }

  try {
    const pdf = sendEmail
      ? await sendSaleEmail({ revision, adminName, method, to: emailTo })
      : await generateSalePdf({ revision, adminName, method });

    return buildPdfResponse(pdf, `stock-receipt-${method}-${revision.number}.pdf`);
  } catch (err) {
    console.error("[PRINT_SALE_ERROR]", err);
    return new Response(err?.message || "Failed to generate/send PDF", {
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
