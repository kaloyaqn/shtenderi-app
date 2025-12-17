import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const regionId = searchParams.get("regionId");
    const partnerQuery = (searchParams.get("partner") || "").trim().toLowerCase();

    const from = dateFrom ? new Date(dateFrom) : new Date("2000-01-01");
    const to = dateTo ? new Date(dateTo) : new Date("2100-01-01");

    const stands = await prisma.stand.findMany({
      where: {
        isActive: true,
        ...(regionId ? { regionId } : {}),
      },
      include: {
        region: true,
        store: {
          include: {
            partner: true,
            city: true,
          },
        },
        revisions: {
          where: { createdAt: { gte: from, lte: to } },
          include: {
            missingProducts: {
              include: { product: true },
            },
          },
        },
      },
    });

    const standIds = stands.map((s) => s.id);

    const refunds = standIds.length
      ? await prisma.refund.findMany({
          where: {
            sourceType: "STAND",
            sourceId: { in: standIds },
            createdAt: { gte: from, lte: to },
          },
          include: {
            refundProducts: {
              include: { product: true },
            },
          },
        })
      : [];

    const refundsByStand = refunds.reduce((acc, rf) => {
      acc[rf.sourceId] = acc[rf.sourceId] || [];
      acc[rf.sourceId].push(rf);
      return acc;
    }, {});

    const partnerMap = {};
    const BGN_TO_EUR = 1.95583;

    for (const stand of stands) {
      const partner = stand.store.partner;
      if (!partner) continue;

      const matchesPartner =
        !partnerQuery ||
        partner.name?.toLowerCase().includes(partnerQuery) ||
        partner.id?.toLowerCase().includes(partnerQuery);
      if (!matchesPartner) continue;

      if (!partnerMap[partner.id]) {
        partnerMap[partner.id] = {
          partnerId: partner.id,
          partnerName: partner.name,
          regionName: stand.region?.name || "Без регион",
          cities: new Set(),
          sold: 0,
          returned: 0,
          revenue: 0,
          stands: new Set(),
        };
      }

      const entry = partnerMap[partner.id];
      if (stand.store.city?.name) entry.cities.add(stand.store.city.name);
      entry.stands.add(stand.id);

      const soldOnStandQty = stand.revisions
        .flatMap((rev) => rev.missingProducts)
        .reduce((sum, mp) => sum + mp.missingQuantity, 0);

      const soldOnStandAmount = stand.revisions
        .flatMap((rev) => rev.missingProducts)
        .reduce(
          (sum, mp) =>
            sum +
            mp.missingQuantity *
              (mp.priceAtSale ?? mp.product?.clientPrice ?? 0),
          0
        );

      const returnedOnStandQty = (refundsByStand[stand.id] || [])
        .flatMap((rf) => rf.refundProducts)
        .reduce((sum, rp) => sum + rp.quantity, 0);

      const returnedOnStandAmount = (refundsByStand[stand.id] || [])
        .flatMap((rf) => rf.refundProducts)
        .reduce(
          (sum, rp) =>
            sum +
            rp.quantity * (rp.priceAtRefund ?? rp.product?.clientPrice ?? 0),
          0
        );

      entry.sold += soldOnStandQty;
      entry.returned += returnedOnStandQty;
      entry.soldAmount = (entry.soldAmount || 0) + soldOnStandAmount;
      entry.returnedAmount = (entry.returnedAmount || 0) + returnedOnStandAmount;
    }

    const clients = Object.values(partnerMap)
      .map((p) => {
        const revenueBgn = (p.soldAmount || 0) - (p.returnedAmount || 0);
        return {
          ...p,
          cities: Array.from(p.cities),
          stands: Array.from(p.stands),
          revenueBgn,
          revenueEur: Number((revenueBgn / BGN_TO_EUR).toFixed(2)),
          soldAmount: Number((p.soldAmount || 0).toFixed(2)),
          returnedAmount: Number((p.returnedAmount || 0).toFixed(2)),
        };
      })
      .sort((a, b) => b.revenueBgn - a.revenueBgn);

    return NextResponse.json({ clients });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
