import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session-better-auth";
import { prisma } from "@/lib/prisma";


export async function GET(req) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const storageId = searchParams.get("storageId");
    const userId = searchParams.get("userId");
    
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (storageId) {
      where.storageId = storageId;
    }
    if (userId) {
      where.userId = userId;
    }

    // Fetch storage revisions with related data
    const [revisions, total] = await Promise.all([
      prisma.storageRevision.findMany({
        where,
        include: {
          storage: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  barcode: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.storageRevision.count({ where }),
    ]);

    // Calculate summary statistics for each revision
    const revisionsWithStats = revisions.map((revision) => {
      const totalProducts = revision.products.length;
      const productsWithChanges = revision.products.filter(
        (p) => p.checkedQuantity !== p.originalQuantity
      ).length;
      
      const totalQuantityChange = revision.products.reduce(
        (sum, p) => sum + (p.checkedQuantity - p.originalQuantity),
        0
      );

      return {
        ...revision,
        stats: {
          totalProducts,
          productsWithChanges,
          totalQuantityChange,
        },
      };
    });

    return NextResponse.json({
      revisions: revisionsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get storage revisions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch storage revisions" },
      { status: 500 }
    );
  }
}
