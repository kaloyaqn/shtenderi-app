import { createStand, getAllStands } from "@/lib/stands/stand";
import { getServerSession } from "@/lib/get-session-better-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const session = await getServerSession();
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);

    const regionId = searchParams.get("region");
    const cityId   = searchParams.get("city");
    const partner  = searchParams.get("partner");
    const name     = searchParams.get("name");

    const storeFilter = {};

    if (cityId && cityId !== "null" && cityId !== "") {
      storeFilter.cityId = cityId;
    }

    if (partner && partner !== "null" && partner !== "") {
      storeFilter.partner = {
        name: { contains: partner, mode: "insensitive" }
      };
    }

    const where = {
      isActive: true,

      ...(session.user.role === "USER" && {
        userStands: {
          some: { userId: session.user.id }
        }
      }),

      ...(name && name !== "null" && {
        name: { contains: name, mode: "insensitive" }
      }),

      ...(regionId && regionId !== "null" && {
        regionId: regionId        // 👈 REGION FILTER FIXED
      }),

      ...(Object.keys(storeFilter).length > 0 && {
        store: storeFilter
      })
    };

    const stands = await prisma.stand.findMany({
      where,
      include: {
        _count: { select: { standProducts: true } },
        region: { select: { id: true, name: true } },
        store: {
          select: {
            id: true,
            name: true,
            city: { select: { id: true, name: true } },
            partnerId: true,
            partner: {
              select: {
                id: true,
                name: true,
                percentageDiscount: true,
              },
            },
          },
        },
        checks: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, createdAt: true },
        },
        userStands: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const result = stands.map((s) => ({
      ...s,
      partnerId: s.store?.partnerId ?? null,
      lastCheckAt: s.checks[0]?.createdAt ?? null,
      lastCheckId: s.checks[0]?.id ?? null,
    }));

    return Response.json(result);

  } catch (err) {
    console.error("[STANDS_GET_ERROR]", err);
    return new Response("Failed to fetch stands", { status: 500 });
  }
}



export async function POST(req) {
  try {
    const { name, storeId, regionId } = await req.json();
    const stand = await createStand({ name, storeId, regionId });
    return Response.json(stand);
  } catch (err) {
    console.error("[STAND_POST_ERROR]", err);

    const status = err.status || 500;
    const message = err.message || "Failed to create stand";

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}
