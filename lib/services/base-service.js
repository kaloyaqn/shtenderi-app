import { prisma } from '@/lib/prisma';

/**
 * Base service class for common database operations
 */
export class BaseService {
  constructor(modelName) {
    this.modelName = modelName;
    this.prisma = prisma;
  }

  /**
   * Find all records with optional filtering
   */
  async findAll(options = {}) {
    try {
      const { where = {}, include = {}, orderBy = {}, take, skip } = options;
      
      return await this.prisma[this.modelName].findMany({
        where,
        include,
        orderBy,
        take,
        skip,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find a single record by ID
   */
  async findById(id, options = {}) {
    try {
      const { include = {} } = options;
      
      const record = await this.prisma[this.modelName].findUnique({
        where: { id },
        include,
      });

      if (!record) throw new Error(`${this.modelName} not found`);

      return record;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new record
   */
  async create(data) {
    try {
      return await this.prisma[this.modelName].create({
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a record by ID
   */
  async update(id, data) {
    try {
      return await this.prisma[this.modelName].update({
        where: { id },
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id) {
    try {
      await this.prisma[this.modelName].delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count records with optional filtering
   */
  async count(where = {}) {
    try {
      return await this.prisma[this.modelName].count({ where });
    } catch (error) {
      throw ApiError.fromPrismaError(error);
    }
  }

  /**
   * Check if a record exists
   */
  async exists(id) {
    try {
      const count = await this.prisma[this.modelName].count({
        where: { id },
      });
      return count > 0;
    } catch (error) {
      throw ApiError.fromPrismaError(error);
    }
  }
}

