import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// price group product model: id string, price_group_id, product_id, price, created_at, updated_at
export async function POST(req) {
    try {
        // const session = await getServerSession(authOptions);
        // if (!session) return new Response("Unauthorized", {status: 401});
        // if (session.user.role !== "ADMIN") return new Response("Forbidden", {status: 403});

        const { price_group_id, price, product_id } = await req.json();
        if (!price_group_id || price == null || !product_id) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        // Check if price group exists
        const priceGroup = await prisma.priceGroup.findUnique({
            where: { id: price_group_id },
        });

        if (!priceGroup) {
            return NextResponse.json({ error: "Price group not found" }, { status: 404 });
        }

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: product_id },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Create the price group product with correct relation connections
        const groupProduct = await prisma.priceGroupProduct.create({
            data: {
                priceGroup: { connect: { id: price_group_id } },
                product: { connect: { id: product_id } },
                price
            },
        });

        return NextResponse.json(groupProduct);

    } catch (err) {
        return NextResponse.json({ error: "Error", details: err?.message || err }, { status: 500 });
    }
}

export async function GET(req, { params }) {
    const { id } = await params;
    try {
        const products = await prisma.priceGroupProduct.findMany({
            include: {
                product: true,
                priceGroup: true,
            },
            where: {
                priceGroupId: id,
            },
        });

        return NextResponse.json(products);
    } catch (err) {
        return NextResponse.json({ error: "Error", details: err?.message || err }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const { id: priceGroupId } = await params;
        const body = await req.json();
        const upserts = Array.isArray(body.upserts) ? body.upserts : [];
        const remove = Array.isArray(body.remove) ? body.remove : [];

        // Basic validation
        if (!priceGroupId) {
            return NextResponse.json({ error: "Missing priceGroupId" }, { status: 400 });
        }

        // Build transactional ops
        const ops = [];

        // Upserts
        for (const row of upserts) {
            const productId = row?.productId;
            const price = Number(row?.price);
            if (!productId || Number.isNaN(price) || price < 0) continue;
            ops.push(
                prisma.priceGroupProduct.upsert({
                    where: { priceGroupId_productId: { priceGroupId, productId } },
                    create: { priceGroupId, productId, price },
                    update: { price },
                })
            );
        }

        // Deletes
        if (remove.length > 0) {
            ops.push(
                prisma.priceGroupProduct.deleteMany({
                    where: { priceGroupId, productId: { in: remove } },
                })
            );
        }

        const result = ops.length > 0 ? await prisma.$transaction(ops) : [];

        // Return latest state
        const latest = await prisma.priceGroupProduct.findMany({
            include: { product: true, priceGroup: true },
            where: { priceGroupId },
        });

        return NextResponse.json({ ok: true, changes: result.length, items: latest });
    } catch (err) {
        return NextResponse.json({ error: "Error", details: err?.message || err }, { status: 500 });
    }
}