import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Ensure prisma is imported

export async function GET(req, { params }) {
    const { id } = await params;

    try {
        const price_group = await prisma.priceGroup.findUnique({
            where: { id: id },
        });

        console.log(price_group)

        if (!price_group) {
            return NextResponse.json({ error: "Price group not found" }, { status: 404 });
        }

        return NextResponse.json(price_group);
    } catch (error) {
        console.error("Error fetching price group:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}