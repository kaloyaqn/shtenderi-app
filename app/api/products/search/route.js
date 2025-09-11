import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const input = searchParams.get("q")?.trim();

    if (!input) {
      return new Response(
        JSON.stringify({ error: "No query provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // normalize to lowercase to avoid collation issues
    const normalized = input.toLowerCase();

    const conditions = [
      { name: { contains: normalized, mode: "insensitive" } },
      { invoiceName: { contains: normalized, mode: "insensitive" } },
      { pcode: { contains: normalized, mode: "insensitive" } },
    ];

    // only add barcode if input is a valid number
    const parsed = Number(input);
    if (!isNaN(parsed) && input !== "") {
      conditions.push({ barcode: { equals: input, mode: "insensitive" } });
    }

    console.log("SEARCH CONDITIONS:", conditions);

    const products = await prisma.product.findMany({
      where: { OR: conditions },
    });

    return new Response(
      JSON.stringify(products),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("ERROR SEARCHING PRODUCTS", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
