import { prisma } from '@/lib/prisma'

/**
 * Gets all products assigned to a specific stand.
 * @param {string} standId - The ID of the stand.
 * @returns {Promise<Array>} A list of products on the stand.
 */
export async function getProductsOnStand(standId) {
    return await prisma.standProduct.findMany({
        where: {
            standId,
            product: { active: true }, // Only include active products
        },
        include: {
            product: true, // Include the full product details
        },
        orderBy: {
            product: {
                name: 'asc'
            }
        }
    });
}

/**
 * Adds a product to a stand with a specific quantity.
 * @param {string} standId - The ID of the stand.
 * @param {object} data - The data for the new stand product.
 * @param {string} data.productId - The ID of the product to add.
 * @param {number} data.quantity - The quantity of the product on the stand.
 * @returns {Promise<object>} The newly created standProduct record.
 */
export async function addProductToStand(standId, { productId, quantity }) {
    if (!productId || quantity === undefined) {
        const error = new Error("Product and quantity are required");
        error.status = 400;
        throw error;
    }

    // Check if the product is already on the stand
    const existing = await prisma.standProduct.findFirst({
        where: { standId, productId }
    });

    if (existing) {
        // If it exists, just update the quantity
        return await updateProductOnStand(existing.id, { quantity: existing.quantity + quantity });
    }

    // If it doesn't exist, create a new record
    return await prisma.standProduct.create({
        data: {
            standId,
            productId,
            quantity
        }
    });
}

/**
 * Updates the quantity of a product on a stand.
 * @param {string} standProductId - The ID of the stand-product relationship record.
 * @param {object} data - The data to update.
 * @param {number} data.quantity - The new quantity.
 * @returns {Promise<object>} The updated standProduct record.
 */
export async function updateProductOnStand(standProductId, { quantity, userId }) {
    if (quantity === undefined || quantity < 0) {
        const error = new Error("A valid quantity is required");
        error.status = 400;
        throw error;
    }

    // Fetch the current standProduct
    const standProduct = await prisma.standProduct.findUnique({
        where: { id: standProductId },
        include: { product: true, stand: true }
    });
    if (!standProduct) {
        const notFoundError = new Error("Product on stand not found");
        notFoundError.status = 404;
        throw notFoundError;
    }

    // If reducing quantity, create a refund for the difference
    if (quantity < standProduct.quantity && userId) {
        const refundQty = standProduct.quantity - quantity;
        await prisma.refund.create({
            data: {
                userId,
                sourceType: 'STAND',
                sourceId: standProduct.standId,
                refundProducts: {
                    create: [{ productId: standProduct.productId, quantity: refundQty }]
                }
            }
        });
    }

    try {
        return await prisma.standProduct.update({
            where: { id: standProductId },
            data: { quantity }
        });
    } catch (error) {
        if (error.code === 'P2025') {
            const notFoundError = new Error("Product on stand not found");
            notFoundError.status = 404;
            throw notFoundError;
        }
        throw error;
    }
}

/**
 * Removes a product from a stand.
 * @param {string} standProductId - The ID of the stand-product relationship record.
 */
export async function removeProductFromStand(standProductId) {
    try {
        await prisma.standProduct.delete({
            where: { id: standProductId }
        });
    } catch (error) {
        if (error.code === 'P2025') {
            const notFoundError = new Error("Product on stand not found");
            notFoundError.status = 404;
            throw notFoundError;
        }
        throw error;
    }
} 