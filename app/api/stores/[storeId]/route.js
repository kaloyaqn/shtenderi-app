import {prisma} from "@/lib/prisma";

// GET store by ID
export async function GET(req, { params }) {
  try {
    const { storeId } = await params;

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        partner: true,
        city: true,
        stands: {
          include: {
            region: true,
          }
        }
      }
    });

    const revenue = await prisma.revision.aggregate({
      _sum: { saleAmount: true },
      where: {
        stand: {
          storeId: storeId,
        },
      },
    });



    return Response.json({      ...store,
    revenue: revenue._sum.saleAmount ?? 0,});
  } catch (error) {
    console.error("[STORE_GET_ERROR]", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch store" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// UPDATE store
export async function PUT(req, { params }) {
  try {
    const { storeId } = params;
    const data = await req.json();

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: {
        name: data.name,
        address: data.address,
        contact: data.contact,
        phone: data.phone,
        partnerId: data.partnerId,
        cityId: data.cityId || null,
      },
      include: {
        partner: { select: { id: true, name: true, percentageDiscount: true } },
        city: { select: { id: true, name: true } },
      },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("[STORE_PUT_ERROR]", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to update store" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// DELETE store
export async function DELETE(req, { params }) {
  try {
    const { storeId } = params;

    await prisma.store.delete({
      where: { id: storeId },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[STORE_DELETE_ERROR]", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to delete store" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
