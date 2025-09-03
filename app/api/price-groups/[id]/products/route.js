import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// price group product model: id string, price_group_id, product_id, price, created_at, updated_at
export async function POST(req) {
    try {
        // const session = await getServerSession(authOptions);
        // if (!session) return new Response("Unauthorized", {status: 401});
        // if (session.user.role !== "ADMIN") return new Response("Forbidden", {status: 403});

        const { price_group_id, price, product_id } = await req.json();
        if (!price_group_id || !price || !product_id) {
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
                priceGroup: {
                    connect: { id: price_group_id }
                },
                product: {
                    connect: { id: product_id }
                },
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
        // Fix: Use prisma instance and correct table/column names in snake_case
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