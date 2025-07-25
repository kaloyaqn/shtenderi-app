import { prisma } from '@/lib/prisma'

export async function getAllPartners(user) {
    const whereClause = {};
    if (user && user.role === 'USER') {
        whereClause.userPartners = {
            some: {
                userId: user.id,
            },
        };
    }

    const partners = await prisma.partner.findMany({
        where: whereClause,
        include: {
          stores: true,
        },
        orderBy: { name: 'asc' },
    })
    return partners
}

export async function createPartner({ id, name, bulstat, contactPerson, phone, address, mol, country, city, percentageDiscount }) {
    if (!id?.trim() || !name?.trim()) {
        const error = new Error("ID and company name are required");
        error.status = 400;
        throw error;
    }

    const existing = await prisma.partner.findUnique({ where: { id } })

    if (existing) {
        const error = new Error("Partner with this ID already exists");
        error.status = 409;
        throw error;
    }

    const partner = await prisma.partner.create({
        data: { id, name, bulstat, contactPerson, phone, address, mol, country, city, percentageDiscount },
    })

    return partner
}

export async function getPartnerById(partnerId, includeStores = false) {
    const partner = await prisma.partner.findUnique({
        where: { id: partnerId },
        include: includeStores ? { stores: true } : undefined,
    })

    if (!partner) {
        const error = new Error("Partner not found");
        error.status = 404;
        throw error;
    }

    return partner;
}

export async function updatePartner(partnerId, { name, bulstat, contactPerson, phone, address, mol, country, city, percentageDiscount }) {
    if (!name) {
        const error = new Error("Name is required");
        error.status = 400;
        throw error;
    }

    try {
        const partner = await prisma.partner.update({
            where: { id: partnerId },
            data: { name, bulstat, contactPerson, phone, address, mol, country, city, percentageDiscount },
        })
        return partner;
    } catch (error) {
        if (error.code === 'P2025') { // Prisma code for record not found
            const notFoundError = new Error("Partner not found");
            notFoundError.status = 404;
            throw notFoundError;
        }
        throw error;
    }
}

export async function deletePartner(partnerId) {
    try {
        await prisma.partner.delete({
            where: { id: partnerId },
        })
    } catch (error) {
        if (error.code === 'P2025') {
            const notFoundError = new Error("Partner not found");
            notFoundError.status = 404;
            throw notFoundError;
        }
        throw error;
    }
}

/**
 * Calculate gross income for a partner for a given period.
 * @param {string} partnerId
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {object} prisma - Prisma client instance
 * @returns {Promise<{sales: number, refunds: number, grossIncome: number}>}
 */
export async function getPartnerGrossIncome(partnerId, startDate, endDate, prisma) {
  // 1. Sales: sum of all missingProducts.priceAtSale * missingQuantity for revisions in period
  const revisions = await prisma.revision.findMany({
    where: {
      partnerId,
      createdAt: { gte: startDate, lt: endDate },
    },
    include: {
      missingProducts: true,
    },
  });
  
  console.log('[PARTNER_GROSS_INCOME] Found revisions for partner:', {
    partnerId,
    revisionsCount: revisions.length,
    revisions: revisions.map(r => ({
      id: r.id,
      number: r.number,
      type: r.type,
      createdAt: r.createdAt,
      missingProductsCount: r.missingProducts.length,
      totalValue: r.missingProducts.reduce((sum, mp) => {
        const quantity = mp.givenQuantity !== null ? mp.givenQuantity : mp.missingQuantity;
        return sum + ((mp.priceAtSale || 0) * (quantity || 0));
      }, 0)
    }))
  });
  
  const sales = revisions.reduce((sum, rev) => {
    return sum + rev.missingProducts.reduce((s, mp) => {
      // Use givenQuantity if available (for sale mode), otherwise use missingQuantity
      const quantity = mp.givenQuantity !== null ? mp.givenQuantity : (mp.missingQuantity ?? 0);
      const price = mp.priceAtSale || 0;
      
      // Ensure both price and quantity are valid numbers
      const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
      const validQuantity = typeof quantity === 'number' && !isNaN(quantity) ? quantity : 0;
      
      return s + (validQuantity * validPrice);
    }, 0);
  }, 0);

  // 2. Refunds: sum of all refundProducts.priceAtRefund * quantity for refunds in period
  // Find all stand IDs for this partner
  const stands = await prisma.stand.findMany({
    where: { store: { partnerId } },
    select: { id: true },
  });
  const standIds = stands.map(s => s.id);
  // Find all refunds for those stands in the period
  const refunds = await prisma.refund.findMany({
    where: {
      createdAt: { gte: startDate, lt: endDate },
      sourceType: 'STAND',
      sourceId: { in: standIds },
    },
    include: {
      refundProducts: true,
    },
  });
  const refundSum = refunds.reduce((sum, refund) => {
    return sum + refund.refundProducts.reduce((s, rp) => {
      return s + ((rp.priceAtRefund || 0) * (rp.quantity || 0));
    }, 0);
  }, 0);

  // 3. Outstanding debt (all time, not just period)
  // Get all revisions for this partner (all time, including imports)
  const allRevisions = await prisma.revision.findMany({
    where: { 
      partnerId,
    },
    select: {
      id: true,
      missingProducts: { 
        select: { 
          missingQuantity: true, 
          givenQuantity: true,
          priceAtSale: true, 
          product: { select: { clientPrice: true } } 
        } 
      },
    },
  });
  let totalSales = 0;
  const revisionIds = [];
  for (const rev of allRevisions) {
    revisionIds.push(rev.id);
    for (const mp of rev.missingProducts) {
      const price = mp.priceAtSale ?? mp.product?.clientPrice ?? 0;
      // Use givenQuantity if available (for sale mode), otherwise use missingQuantity
      const quantity = mp.givenQuantity !== null ? mp.givenQuantity : (mp.missingQuantity ?? 0);
      
      // Ensure both price and quantity are valid numbers
      const validPrice = typeof price === 'number' && !isNaN(price) ? price : 0;
      const validQuantity = typeof quantity === 'number' && !isNaN(quantity) ? quantity : 0;
      
      totalSales += validQuantity * validPrice;
    }
  }
  const payments = await prisma.payment.findMany({
    where: { revisionId: { in: revisionIds } },
    select: { amount: true, revisionId: true },
  });
  const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const outstandingDebt = totalSales - totalPayments;
  
  console.log(`[PARTNER_GROSS_INCOME] Found ${payments.length} payments for ${revisionIds.length} revisions`);
  console.log(`[PARTNER_GROSS_INCOME] Payment details:`, payments.map(p => ({ revisionId: p.revisionId, amount: p.amount })));
  console.log(`[PARTNER_GROSS_INCOME] Outstanding debt calculation: totalSales=${totalSales}, totalPayments=${totalPayments}, outstandingDebt=${outstandingDebt}`);

  // Ensure all values are valid numbers
  const validSales = typeof sales === 'number' && !isNaN(sales) ? sales : 0;
  const validRefundSum = typeof refundSum === 'number' && !isNaN(refundSum) ? refundSum : 0;
  const validTotalSales = typeof totalSales === 'number' && !isNaN(totalSales) ? totalSales : 0;
  const validTotalPayments = typeof totalPayments === 'number' && !isNaN(totalPayments) ? totalPayments : 0;
  const validOutstandingDebt = typeof outstandingDebt === 'number' && !isNaN(outstandingDebt) ? outstandingDebt : 0;

  return {
    sales: validSales.toFixed(2),
    refunds: validRefundSum.toFixed(2),
    grossIncome: (validSales - validRefundSum).toFixed(2),
    outstandingDebt: validOutstandingDebt.toFixed(2),
    totalSales: validTotalSales.toFixed(2),
    totalPayments: validTotalPayments.toFixed(2),
  };
} 