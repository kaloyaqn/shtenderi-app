import { getServerSession } from "@/lib/get-session-better-auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  // const session = await getServerSession();
  // if (!session) return new Response("Unauthorized", { status: 401 });
  //
  // Колко бройки общо са приети, колко не са, за какви пари средно е бройката

  try {
    const { searchParams } = new URL(req.url);

    const productId = searchParams.get("product");
    const dateTo = searchParams.get("dateTo");
    const dateFrom = searchParams.get("dateFrom");

    const whereClause = {};

    if (productId) {
      whereClause.productId = productId;
    }

    const dateFilter = {};

    if (dateFrom) {
      dateFilter.gte = new Date(dateFrom);
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.lte = endDate;
    }
    if (Object.keys(dateFilter).length > 0) {
      whereClause.delivery = { createdAt: dateFilter };
    }

    const delivery_products = await prisma.deliveryProduct.findMany({
      where: whereClause,
      include: {
        delivery: true,
        product: true,
      },
    });



    return NextResponse.json(delivery_products);

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
