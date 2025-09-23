import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { revisionId } = params;

    const revision = await prisma.storageRevision.findUnique({
      where: {
        id: revisionId,
      },
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
                pcode: true,
              },
            },
          },
        },
      },
    });

    if (!revision) {
      return NextResponse.json(
        { error: "Storage revision not found" },
        { status: 404 }
      );
    }

    // Calculate summary statistics
    const totalProducts = revision.products.length;
    const productsWithChanges = revision.products.filter(
      (p) => p.checkedQuantity !== p.originalQuantity
    ).length;
    
    const totalQuantityChange = revision.products.reduce(
      (sum, p) => sum + (p.checkedQuantity - p.originalQuantity),
      0
    );

    const increases = revision.products.filter(
      (p) => p.checkedQuantity > p.originalQuantity
    ).length;
    
    const decreases = revision.products.filter(
      (p) => p.checkedQuantity < p.originalQuantity
    ).length;

    return NextResponse.json({
      ...revision,
      stats: {
        totalProducts,
        productsWithChanges,
        totalQuantityChange,
        increases,
        decreases,
      },
    });
  } catch (error) {
    console.error("Get storage revision error:", error);
    return NextResponse.json(
      { error: "Failed to fetch storage revision" },
      { status: 500 }
    );
  }
}
