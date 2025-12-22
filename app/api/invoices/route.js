import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session-better-auth";


export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const preparedBy = session?.user?.name || session?.user?.email || "Admin";


    if (type === "revision") {
      const { revisionId, paymentMethod } = await req.json();
      if (!revisionId) {
        return NextResponse.json({ error: "revisionId is required" }, { status: 400 });
      }

      const revision = await prisma.revision.findUnique({
        where: { id: revisionId },
        include: {
          partner: true,
          user: true,
          missingProducts: { include: { product: true } },
        },
      });

      if (!revision) {
        return NextResponse.json({ error: "Revision not found" }, { status: 404 });
      }

      // Check if invoice already exists
      if (revision.invoiceId) {
        const existing = await prisma.invoice.findUnique({
          where: { revisionId: revision.id },
        });
        return NextResponse.json(existing);
      }

      const discount = revision.partner?.percentageDiscount || 0;

      const products = revision.missingProducts.map((mp) => {
        const basePrice = mp.priceAtSale ?? mp.product?.clientPrice ?? 0;
        const price =
          mp.priceAtSale != null
            ? Number(basePrice)
            : (mp.product?.clientPrice || 0) * (1 - discount / 100);
        const qty = mp.givenQuantity ?? mp.missingQuantity;

        return {
          productId: mp.product.id,
          name: mp.product.name,
          barcode: mp.product.barcode,
          quantity: qty,
          clientPrice: price,
          pcd: mp.product.pcd || "",
        };
      });

      // Prefer the recorded sale amount (special pricing) over recalculating from products
      const totalValue =
        revision.saleAmount !== null && revision.saleAmount !== undefined
          ? Number(revision.saleAmount)
          : products.reduce((sum, p) => sum + p.quantity * p.clientPrice, 0);

      const vatBase = totalValue / 1.2;
      const vatAmount = totalValue - vatBase;

      const last = await prisma.invoice.findFirst({
        orderBy: { invoiceNumber: "desc" },
      });

      const nextNumber = (last?.invoiceNumber || 0) + 1;

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: nextNumber,
          issuedAt: new Date(),
          preparedBy,
          partnerName: revision.partner.name,
          partnerBulstat: revision.partner.bulstat,
          partnerMol: revision.partner.mol,
          partnerAddress: revision.partner.address,
          partnerCountry: revision.partner.country,
          partnerCity: revision.partner.city,
          partnerEmail: revision.partner.email || null,
          partnerId: revision.partner.id || null,

          revisionId,
          revisionNumber: revision.number,

          products,
          totalValue,
          vatBase,
          vatAmount,
          paymentMethod: paymentMethod || "CASH",
        },
      });

      return NextResponse.json(invoice);
    }


    if (type === "delivery") {
      const { deliveryId } = await req.json();
      if (!deliveryId) {
        return NextResponse.json({ error: "deliveryId is required" }, { status: 400 });
      }

      const delivery = await prisma.delivery.findUnique({
        where: { id: deliveryId },
        include: {
          supplier: true,
          user: true,
          products: true,
        },
      });

      if (!delivery) {
        return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
      }

      // If invoice already exists:
      if (delivery.invoiceId) {
        const existing = await prisma.invoice.findUnique({
          where: { deliveryId: delivery.id },
        });
        return NextResponse.json(existing);
      }

      const products = delivery.products.map((p) => ({
        productId: p.productId || null,
        barcode: p.barcode || "",
        name: p.name || "",
        quantity: p.quantity,
        unitPrice: p.unitPrice,
      }));

      const totalValue = products.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
      const vatBase = totalValue / 1.2;
      const vatAmount = totalValue - vatBase;

      const last = await prisma.invoice.findFirst({
        orderBy: { invoiceNumber: "desc" },
      });

      const nextNumber = (last?.invoiceNumber || 0) + 1;

      // CREATE DELIVERY INVOICE
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: nextNumber,
          issuedAt: new Date(),
          preparedBy,

          partnerName: delivery.supplier.name,
          partnerBulstat: delivery.supplier.bulstat,
          partnerMol: delivery.supplier.mol,
          partnerAddress: delivery.supplier.address,
          partnerCountry: delivery.supplier.country,
          partnerCity: delivery.supplier.city,

          deliveryId,

          products,
          totalValue,
          vatBase,
          vatAmount,
          paymentMethod: "CASH",
        },
      });

      return NextResponse.json(invoice);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("INVOICE POST ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession();
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("id");
    const revisionId = searchParams.get("revisionId");
    const revisionNumbersRaw = searchParams.getAll("revisionNumber");
    const productId = searchParams.get("productId");
    const barcode = searchParams.get("barcode");
    const pcode = searchParams.get("pcode");
    const partnerName = searchParams.get("partnerName");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          creditNotes: true,
          payments: {
            include: {
              user: { select: { id: true, name: true, email: true } },
              cashRegister: { include: { storage: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!invoice) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }

      return NextResponse.json(invoice);
    }

    if (revisionId) {
      const invoice = await prisma.invoice.findFirst({
        where: { revisionId },
      });

      if (!invoice) {
        return NextResponse.json(null);
      }

      return NextResponse.json(invoice);
    }

    const where = {};

    // Filter by revisionNumber when provided (supports multiple values)
    const revisionNumbers = revisionNumbersRaw
      .map((n) => parseInt(n, 10))
      .filter((n) => !isNaN(n));

    if (revisionNumbers.length === 1) {
      where.revisionNumber = revisionNumbers[0];
    } else if (revisionNumbers.length > 1) {
      where.revisionNumber = { in: revisionNumbers };
    }
    if (partnerName) {
      where.partnerName = { contains: partnerName, mode: "insensitive" };
    }
    if (dateFrom || dateTo) {
      where.issuedAt = {};
      if (dateFrom) where.issuedAt.gte = new Date(`${dateFrom}T00:00:00.000Z`);
      if (dateTo) where.issuedAt.lte = new Date(`${dateTo}T23:59:59.999Z`);
    }

    // Fetch invoices, optionally filter by product after fetch (products is JSON)
    const invoicesRaw = await prisma.invoice.findMany({
      where,
      orderBy: { invoiceNumber: "desc" },
    });

    const invoices = productId || barcode || pcode
      ? invoicesRaw.filter((inv) => {
          const products = Array.isArray(inv.products) ? inv.products : [];
          return products.some((p) => {
            const pid = p.productId || p.id || p.product?.id;
            const pb = p.barcode || p.product?.barcode;
            const pp = p.pcode || p.product?.pcode;
            return (
              (productId && pid === productId) ||
              (barcode && pb === barcode) ||
              (pcode && pp === pcode)
            );
          });
        })
      : invoicesRaw;

    return NextResponse.json(invoices);
  } catch (e) {
    console.error("INVOICE GET ERROR:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function PUT(req) {
  try {
    const session = await getServerSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("id");
    const { paymentMethod } = await req.json();

    if (!invoiceId) return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
    if (!paymentMethod) return NextResponse.json({ error: "Payment method is required" }, { status: 400 });

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { paymentMethod },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("INVOICE PUT ERROR:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
