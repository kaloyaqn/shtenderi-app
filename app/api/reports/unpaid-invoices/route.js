import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get("partnerId");
    const partnerName = searchParams.get("partnerName");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const paymentMethod = searchParams.get("paymentMethod");

    const where = {
      paymentStatus: { in: ["UNPAID", "PARTIALLY_PAID"] },
    };

    if (partnerId) {
      where.partnerId = partnerId;
    } else if (partnerName) {
      where.partnerName = { contains: partnerName, mode: "insensitive" };
    }

    if (paymentMethod && ["CASH", "BANK"].includes(paymentMethod)) {
      where.paymentMethod = paymentMethod;
    }

    if (dateFrom || dateTo) {
      where.issuedAt = {};
      if (dateFrom) where.issuedAt.gte = new Date(`${dateFrom}T00:00:00.000Z`);
      if (dateTo) where.issuedAt.lte = new Date(`${dateTo}T23:59:59.999Z`);
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { issuedAt: "desc" },
      select: {
        id: true,
        invoiceNumber: true,
        partnerName: true,
        partnerId: true,
        totalValue: true,
        paymentStatus: true,
        paymentMethod: true,
        issuedAt: true,
      },
    });

    return NextResponse.json(invoices);
  } catch (err) {
    console.error("[UNPAID_INVOICES_REPORT]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
