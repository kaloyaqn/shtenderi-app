import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { partnerId } = params;
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const status = searchParams.get("status"); // paid/unpaid
    const type = searchParams.get("type"); // missing/refund
    const revisionType = searchParams.get("revisionType"); // import/manual

    console.log("Date filtering:", { dateFrom, dateTo });

    // Build where clause for revisions
    let revisionWhereClause = {
      partnerId: partnerId,
    };

    // Add date filters
    if (dateFrom && dateTo) {
      // Create date range from start of dateFrom to end of dateTo
      const startDate = new Date(dateFrom + 'T00:00:00.000Z');
      const endDate = new Date(dateTo + 'T23:59:59.999Z');
      revisionWhereClause.createdAt = {
        gte: startDate,
        lte: endDate,
      };
      console.log("Date range filter:", { startDate, endDate });
    } else if (dateFrom) {
      const startDate = new Date(dateFrom + 'T00:00:00.000Z');
      revisionWhereClause.createdAt = {
        gte: startDate,
      };
      console.log("Date from filter:", { startDate });
    } else if (dateTo) {
      const endDate = new Date(dateTo + 'T23:59:59.999Z');
      revisionWhereClause.createdAt = {
        lte: endDate,
      };
      console.log("Date to filter:", { endDate });
    }

    // Add status filter
    if (status) {
      revisionWhereClause.status = status.toUpperCase();
    }

    // Add revision type filter
    if (revisionType) {
      revisionWhereClause.type = revisionType;
    }

    // Fetch revisions (sales) with payment and invoice details
    let revisions = [];
    if (!type || type === "missing") {
      revisions = await prisma.revision.findMany({
        where: revisionWhereClause,
        include: {
          user: true,
          partner: true,
          stand: true,
          storage: true,
          payments: {
            include: {
              invoice: true,
            },
          },
          missingProducts: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    // Build where clause for refunds
    let refundWhereClause = {
      refund: {
        sourceType: "STAND",
      },
    };

    // For refunds, we need to get partner info through stands
    const standsWithPartner = await prisma.stand.findMany({
      where: {
        store: {
          partnerId: partnerId,
        },
      },
      include: {
        store: {
          include: {
            partner: true,
          },
        },
      },
    });

    const standIds = standsWithPartner.map(stand => stand.id);

    // Fetch refunds with payment and invoice details
    let refunds = [];
    if (!type || type === "refund") {
      refunds = await prisma.refund.findMany({
        where: {
          sourceType: "STAND",
          sourceId: {
            in: standIds,
          },
          ...(dateFrom && dateTo ? {
            createdAt: {
              gte: new Date(dateFrom + 'T00:00:00.000Z'),
              lte: new Date(dateTo + 'T23:59:59.999Z'),
            },
          } : dateFrom ? {
            createdAt: {
              gte: new Date(dateFrom + 'T00:00:00.000Z'),
            },
          } : dateTo ? {
            createdAt: {
              lte: new Date(dateTo + 'T23:59:59.999Z'),
            },
          } : {}),
        },
        include: {
          user: true,
          creditNotes: {
            include: {
              invoice: true,
            },
          },
          refundProducts: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    // Add source info to refunds
    const refundsWithSource = await Promise.all(
      refunds.map(async (refund) => {
        const stand = await prisma.stand.findUnique({
          where: { id: refund.sourceId },
          include: {
            store: {
              include: {
                partner: true,
              },
            },
          },
        });

        return {
          ...refund,
          sourceInfo: stand,
          partner: stand?.store?.partner,
          type: "refund",
        };
      })
    );

    // Add type and payment info to revisions
    const revisionsWithType = revisions.map((revision) => ({
      ...revision,
      type: "missing",
      paymentInfo: revision.payments[0] || null,
      invoiceInfo: revision.payments[0]?.invoice || null,
    }));

    // Add type and payment info to refunds
    const refundsWithType = refundsWithSource.map((refund) => ({
      ...refund,
      paymentInfo: refund.creditNotes[0] || null,
      invoiceInfo: refund.creditNotes[0]?.invoice || null,
    }));

    // Combine and sort by date
    const allSales = [...revisionsWithType, ...refundsWithType].sort(
      (a, b) => {
        const dateA = a.createdAt;
        const dateB = b.createdAt;
        return new Date(dateB) - new Date(dateA);
      }
    );

    return Response.json({
      sales: allSales,
      partner: standsWithPartner[0]?.store?.partner || null,
      summary: {
        totalSales: revisionsWithType.length,
        totalRefunds: refundsWithType.length,
        totalPaid: allSales.filter(sale => 
          sale.type === "missing" ? sale.status === "PAID" : sale.paymentInfo
        ).length,
        totalUnpaid: allSales.filter(sale => 
          sale.type === "missing" ? sale.status === "NOT_PAID" : !sale.paymentInfo
        ).length,
      },
    });

  } catch (error) {
    console.error("Error fetching partner sales:", error);
    return Response.json(
      { error: "Failed to fetch partner sales" },
      { status: 500 }
    );
  }
}

// POST endpoint for settling payments
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can settle payments
    if (session.user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { partnerId } = params;
    const body = await request.json();
    const { revisionId, paymentMethod, amount, invoiceId } = body;

    if (!revisionId || !paymentMethod || !amount) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the revision
    const revision = await prisma.revision.findUnique({
      where: { id: revisionId },
      include: {
        partner: true,
        payments: true,
      },
    });

    if (!revision) {
      return Response.json(
        { error: "Revision not found" },
        { status: 404 }
      );
    }

    // Check if revision belongs to the partner
    if (revision.partnerId !== partnerId) {
      return Response.json(
        { error: "Revision does not belong to this partner" },
        { status: 403 }
      );
    }

    // Check if already paid
    if (revision.status === "PAID") {
      return Response.json(
        { error: "Revision is already paid" },
        { status: 400 }
      );
    }

    // Get cash register (assuming one per storage)
    const cashRegister = await prisma.cashRegister.findFirst({
      where: {
        storageId: revision.storageId,
      },
    });

    if (!cashRegister) {
      return Response.json(
        { error: "Cash register not found" },
        { status: 404 }
      );
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        method: paymentMethod.toUpperCase(),
        revisionId: revisionId,
        invoiceId: invoiceId || null,
        cashRegisterId: cashRegister.id,
        userId: session.user.id,
      },
    });

    // Update revision status
    await prisma.revision.update({
      where: { id: revisionId },
      data: { status: "PAID" },
    });

    // Update cash register balance
    await prisma.cashRegister.update({
      where: { id: cashRegister.id },
      data: {
        cashBalance: {
          increment: parseFloat(amount),
        },
      },
    });

    return Response.json({
      success: true,
      payment: payment,
      message: "Payment settled successfully",
    });

  } catch (error) {
    console.error("Error settling payment:", error);
    return Response.json(
      { error: "Failed to settle payment" },
      { status: 500 }
    );
  }
} 