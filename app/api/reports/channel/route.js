import {prisma} from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const from = dateFrom ? new Date(dateFrom) : new Date("2000-01-01");
    const to = dateTo ? new Date(dateTo) : new Date("2100-01-01");

    // ------------------------------------------
    // Load active stands in stores that have channels
    // ------------------------------------------
    const stands = await prisma.stand.findMany({
      where: {
        isActive: true,
        store: {
          channelId: { not: null },
        },
      },
      include: {
        store: {
          include: { channel: true },
        },
        standProducts: {
          include: { product: true },
        },
        revisions: {
          where: { createdAt: { gte: from, lte: to } },
          include: { missingProducts: true },
        },
      },
    });

    // Refunds in same date range
    const refunds = await prisma.refund.findMany({
      where: {
        sourceType: "STAND",
        createdAt: { gte: from, lte: to },
      },
      include: {
        refundProducts: true,
      },
    });

    // ------------------------------------------
    // PRODUCT aggregation map
    // ------------------------------------------
    const productMap = {}; // productId → aggregated product result

    for (const stand of stands) {
      const store = stand.store;

      for (const sp of stand.standProducts) {
        const product = sp.product;

        // Ensure product entry exists
        if (!productMap[product.id]) {
          productMap[product.id] = {
            productId: product.id,
            productName: product.name,
            sold: 0,
            returned: 0,
            finalQty: 0,
            stores: [], // array of { storeId, storeName, qty }
          };
        }

        // SOLD on this stand
        const soldOnStand = stand.revisions
          .flatMap((rev) => rev.missingProducts)
          .filter((mp) => mp.productId === product.id)
          .reduce((sum, mp) => sum + mp.missingQuantity, 0);

        // RETURNED on this stand
        const returnedOnStand = refunds
          .filter((rf) => rf.sourceId === stand.id)
          .flatMap((rf) => rf.refundProducts)
          .filter((rp) => rp.productId === product.id)
          .reduce((sum, rp) => sum + rp.quantity, 0);

        // Add to global totals
        productMap[product.id].sold += soldOnStand;
        productMap[product.id].returned += returnedOnStand;

        // ------------------------------------------------------
        // 🟢 STORE-level aggregation (merge multiple stands)
        // ------------------------------------------------------
        let storeEntry = productMap[product.id].stores.find(
          (s) => s.storeId === store.id
        );

        if (!storeEntry) {
          storeEntry = {
            storeId: store.id,
            storeName: store.name,
            channelName: store.channel?.name || "Unknown",
            qty: 0,
          };
          productMap[product.id].stores.push(storeEntry);
        }

        // Add stand sold-qty to store total
        storeEntry.qty += soldOnStand - returnedOnStand;
      }
    }

    // Compute finalQty
    for (const pid in productMap) {
      const p = productMap[pid];
      p.finalQty = p.sold - p.returned;
    }

    return NextResponse.json({
      products: Object.values(productMap),
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
