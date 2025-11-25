import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session-better-auth";
import { prisma } from "@/lib/prisma";

import { getEffectivePrice } from "@/lib/pricing/get-effective-price";

export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { sourceStorageId, destinationStandId, products } = await req.json();

    if (!sourceStorageId || !destinationStandId || !products || !Array.isArray(products)) {
      return NextResponse.json(
        { error: "Source storage, destination stand, and products are required" },
        { status: 400 }
      );
    }

    // Validate that all products exist and have sufficient quantity in storage
    const storageProducts = await prisma.storageProduct.findMany({
      where: {
        storageId: sourceStorageId,
        productId: { in: products.map(p => p.productId) }
      },
      include: {
        product: true
      }
    });

    const storageProductMap = new Map(storageProducts.map(sp => [sp.productId, sp]));

    // Check if all products exist in storage and have sufficient quantity
    for (const product of products) {
      const storageProduct = storageProductMap.get(product.productId);
      if (!storageProduct) {
        return NextResponse.json(
          { error: `Product not found in storage: ${product.productId}` },
          { status: 400 }
        );
      }
      if (storageProduct.quantity < product.quantity) {
        return NextResponse.json(
          { error: `Insufficient quantity for product: ${storageProduct.product.name}. Available: ${storageProduct.quantity}, Requested: ${product.quantity}` },
          { status: 400 }
        );
      }
    }

    // Get stand and partner information
    const stand = await prisma.stand.findUnique({
      where: { id: destinationStandId },
      include: {
        store: {
          include: {
            partner: true
          }
        }
      }
    });

    if (!stand || !stand.store || !stand.store.partner) {
      return NextResponse.json(
        { error: "Stand or partner not found" },
        { status: 400 }
      );
    }

    const partner = stand.store.partner;

    // Create revision and update storage quantities in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Generate next revision number
      const lastRevision = await tx.revision.findFirst({
        orderBy: { number: 'desc' },
        select: { number: true }
      });
      const nextNumber = (lastRevision?.number || 0) + 1;

      // 2. Decrease storage quantities
      for (const product of products) {
        await tx.storageProduct.updateMany({
          where: {
            storageId: sourceStorageId,
            productId: product.productId
          },
          data: {
            quantity: { decrement: product.quantity }
          }
        });
      }

      // 3. Create revision (sale record)
      const revision = await tx.revision.create({
        data: {
          number: nextNumber,
          standId: destinationStandId,
          userId: session.user.id,
          type: 'admin', // Special type to identify admin virtual sales
          partnerId: partner.id,
        }
      });

      // 4. Create missing products with effective prices
      const missingProducts = await Promise.all(
        products.map(async (product) => {
          const priceAtSale = await getEffectivePrice({
            productId: product.productId,
            partnerId: partner.id
          });

          return tx.missingProduct.create({
            data: {
              revisionId: revision.id,
              productId: product.productId,
              missingQuantity: product.quantity,
              priceAtSale
            }
          });
        })
      );

      return { revision, missingProducts };
    });

    return NextResponse.json({
      message: "Virtual sale created successfully",
      revision: result.revision,
      missingProducts: result.missingProducts
    });

  } catch (error) {
    console.error("Virtual sale error:", error);
    return NextResponse.json(
      { error: "Failed to create virtual sale" },
      { status: 500 }
    );
  }
}
