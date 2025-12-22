import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const storageId = searchParams.get("storageId");
    if (!storageId) {
      return NextResponse.json([]);
    }

    const storageProducts = await prisma.storageProduct.findMany({
      where: { storageId },
      include: {
        product: true,
      },
    });

    const rows = storageProducts
      .filter((sp) => (sp.product?.minQty ?? 0) > 0)
      .map((sp) => ({
        productId: sp.productId,
        barcode: sp.product?.barcode || "",
        pcode: sp.product?.pcode || "",
        name: sp.product?.name || "",
        minQty: sp.product?.minQty ?? 0,
        quantity: sp.quantity || 0,
        diff: (sp.quantity || 0) - (sp.product?.minQty ?? 0),
      }));

    return NextResponse.json(rows);
  } catch (err) {
    console.error("[MIN_QTY_REPORT]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
