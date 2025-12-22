import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session-better-auth";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { refundId } = params;
    const body = await req.json();
    const { storageId, products } = body || {};

    if (!refundId || !storageId) {
      return NextResponse.json(
        { error: "Missing refundId or storageId" },
        { status: 400 }
      );
    }

    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: {
        refundProducts: true,
      },
    });

    if (!refund) {
      return NextResponse.json({ error: "Refund not found" }, { status: 404 });
    }

    const refundMap = new Map();
    refund.refundProducts.forEach((rp) => {
      refundMap.set(rp.productId, rp.quantity);
    });

    const selection =
      Array.isArray(products) && products.length > 0
        ? products
        : refund.refundProducts.map((rp) => ({
            productId: rp.productId,
            quantity: rp.quantity,
          }));

    if (selection.length === 0) {
      return NextResponse.json(
        { error: "No products selected for return" },
        { status: 400 }
      );
    }

    // Validate quantities and aggregate duplicates
    const aggregated = new Map();
    for (const item of selection) {
      const pid = item.productId;
      const qty = Number(item.quantity);
      if (!pid || !qty || qty <= 0) {
        return NextResponse.json(
          { error: "Invalid product selection" },
          { status: 400 }
        );
      }
      const allowed = refundMap.get(pid) || 0;
      const current = aggregated.get(pid) || 0;
      if (current + qty > allowed) {
        return NextResponse.json(
          { error: "Quantity exceeds refunded amount" },
          { status: 400 }
        );
      }
      aggregated.set(pid, current + qty);
    }

    await prisma.$transaction(async (tx) => {
      // Increment storage quantities
      for (const [productId, quantity] of aggregated.entries()) {
        await tx.storageProduct.upsert({
          where: { storageId_productId: { storageId, productId } },
          update: { quantity: { increment: quantity } },
          create: { storageId, productId, quantity },
        });
      }

      await tx.refund.update({
        where: { id: refundId },
        data: {
          returnedToStorageId: storageId,
          returnedAt: new Date(),
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("REFUND_RETURN_TO_STORAGE_ERROR", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
