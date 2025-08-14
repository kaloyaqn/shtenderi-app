import { BaseService } from './base-service.js';
import { ApiError } from '@/lib/utils/api-response.js';

/**
 * Partner service extending base service
 */
export class PartnerService extends BaseService {
  constructor() {
    super('partner');
  }

  /**
   * Get all partners with role-based filtering
   */
  async getAllPartners(user) {
    const whereClause = {};
    
    if (user && user.role === 'USER') {
      whereClause.userPartners = {
        some: {
          userId: user.id,
        },
      };
    }

    return await this.findAll({
      where: whereClause,
      include: { stores: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Create a new partner with auto-generated ID
   */
  async createPartner(data) {
    const { id, name, bulstat, contactPerson, phone, address, mol, country, city, percentageDiscount } = data;
    
    if (!name?.trim()) {
      throw new ApiError("Company name is required", 400);
    }

    // Generate ID if not provided
    const partnerId = id?.trim() || crypto.randomUUID();

    // Check if ID already exists (only if ID was manually provided)
    if (id?.trim()) {
      const exists = await this.exists(partnerId);
      if (exists) {
        throw new ApiError("Partner with this ID already exists", 409);
      }
    }

    return await this.create({
      id: partnerId,
      name,
      bulstat,
      contactPerson,
      phone,
      address,
      mol,
      country,
      city,
      percentageDiscount,
    });
  }

  /**
   * Get partner by ID with optional stores
   */
  async getPartnerById(partnerId, includeStores = false) {
    return await this.findById(partnerId, {
      include: includeStores ? { stores: true } : {},
    });
  }

  /**
   * Update partner
   */
  async updatePartner(partnerId, data) {
    const { name, bulstat, contactPerson, phone, address, mol, country, city, percentageDiscount } = data;
    
    if (!name) {
      throw new ApiError("Name is required", 400);
    }

    return await this.update(partnerId, {
      name,
      bulstat,
      contactPerson,
      phone,
      address,
      mol,
      country,
      city,
      percentageDiscount,
    });
  }

  /**
   * Calculate gross income for a partner
   */
  async getPartnerGrossIncome(partnerId, startDate, endDate) {
    console.log('[PARTNER_GROSS_INCOME] Date range for filtering:', {
      partnerId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startDateLocal: startDate.toLocaleString('bg-BG'),
      endDateLocal: endDate.toLocaleString('bg-BG')
    });
    
    const revisions = await this.prisma.revision.findMany({
      where: {
        partnerId,
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        missingProducts: true,
      },
    });

    let sales = 0;
    let refunds = 0;

    for (const revision of revisions) {
      for (const missingProduct of revision.missingProducts) {
        const revenue = (missingProduct.priceAtSale || 0) * missingProduct.missingQuantity;
        sales += revenue;
      }
    }

    // Calculate refunds
    const refundsData = await this.prisma.refund.findMany({
      where: {
        sourceType: 'REVISION',
        sourceId: { in: revisions.map(r => r.id) },
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        refundProducts: true,
      },
    });

    for (const refund of refundsData) {
      for (const refundProduct of refund.refundProducts) {
        refunds += refundProduct.quantity * (refundProduct.priceAtSale || 0);
      }
    }

    const grossIncome = sales - refunds;

    return {
      sales,
      refunds,
      grossIncome,
    };
  }
}

// Export singleton instance
export const partnerService = new PartnerService();

