import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { storageId, checkedProducts } = await req.json();

    if (!storageId || !checkedProducts || !Array.isArray(checkedProducts)) {
      return NextResponse.json(
        { error: "Storage ID and checked products are required" },
        { status: 400 }
      );
    }

    // Create storage revision record
    const storageRevision = await prisma.storageRevision.create({
      data: {
        storageId,
        userId: session.user.id,
        products: {
          create: checkedProducts.map(({ productId, originalQuantity, checkedQuantity }) => ({
            productId,
            originalQuantity,
            checkedQuantity,
          })),
        },
      },
      include: {
        storage: true,
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    // Update storage quantities in a transaction
    await prisma.$transaction(async (tx) => {
      for (const { productId, originalQuantity, checkedQuantity } of checkedProducts) {
        const quantityDifference = checkedQuantity - originalQuantity;
        
        if (quantityDifference !== 0) {
          await tx.storageProduct.upsert({
            where: {
              storageId_productId: {
                storageId,
                productId,
              },
            },
            update: {
              quantity: {
                increment: quantityDifference,
              },
            },
            create: {
              storageId,
              productId,
              quantity: checkedQuantity,
            },
          });
        }
      }
    });

    return NextResponse.json({
      message: "Storage revision completed successfully",
      storageRevision,
    });
  } catch (error) {
    console.error("Storage revision error:", error);
    return NextResponse.json(
      { error: "Failed to complete storage revision" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storageId = searchParams.get("storageId");

    if (!storageId) {
      return NextResponse.json(
        { error: "Storage ID is required" },
        { status: 400 }
      );
    }

    // Get products in the storage
    const storageProducts = await prisma.storageProduct.findMany({
      where: { storageId },
      include: {
        product: true,
      },
    });

    return NextResponse.json(storageProducts);
  } catch (error) {
    console.error("Get storage products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch storage products" },
      { status: 500 }
    );
  }
}
