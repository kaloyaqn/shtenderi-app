import { prisma } from '@/lib/prisma'

export async function getAllProducts() {
    return await prisma.product.findMany({
        include: {
            standProducts: {
                include: {
                    stand: {
                        select: { name: true }
                    }
                }
            }
        },
        orderBy: { name: 'asc' }
    });
}

export async function getProductById(productId) {
    const product = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (!product) {
        const error = new Error("Product not found");
        error.status = 404;
        throw error;
    }

    return product;
}

export async function createProduct({ name, invoiceName, barcode, clientPrice, deliveryPrice, pcd, quantity }) {
    if (!name || !barcode || clientPrice === undefined || deliveryPrice === undefined) {
        const error = new Error("Name, barcode, client price, and delivery price are required");
        error.status = 400;
        throw error;
    }

    const existing = await prisma.product.findUnique({ where: { barcode } });
    if (existing) {
        const error = new Error("A product with this barcode already exists");
        error.status = 409;
        throw error;
    }

    return await prisma.product.create({
        data: { name, invoiceName, barcode, clientPrice, deliveryPrice, pcd, quantity: quantity || 0 }
    });
}

export async function updateProduct(productId, { name, invoiceName, barcode,pcode, clientPrice, deliveryPrice, pcd, quantity, active, image }) {
    if (!name || !barcode || clientPrice === undefined || deliveryPrice === undefined) {
        const error = new Error("Name, barcode, client price, and delivery price are required");
        error.status = 400;
        throw error;
    }

    const updateData = { name, invoiceName, barcode,pcode, clientPrice, deliveryPrice, pcd, image };
    if (quantity !== undefined) {
        updateData.quantity = quantity;
    }
    if (active !== undefined) {
        updateData.active = active;
    }

    try {
        return await prisma.product.update({
            where: { id: productId },
            data: updateData
        });
    } catch (error) {
        if (error.code === 'P2025') { // Record to update not found.
            const notFoundError = new Error("Product not found");
            notFoundError.status = 404;
            throw notFoundError;
        }
        if (error.code === 'P2002' && error.meta?.target?.includes('barcode')) { // Unique constraint failed
            const uniqueError = new Error("A product with this barcode already exists");
            uniqueError.status = 409;
            throw uniqueError;
        }
        if (error.code === 'P2002' && error.meta?.target?.includes('code')) { // Unique constraint failed
            const uniqueError = new Error("A product with this code already exists");
            uniqueError.status = 409;
            throw uniqueError;
        }
        throw error;
    }
}

export async function deleteProduct(productId) {
    try {
        await prisma.product.delete({
            where: { id: productId }
        });
    } catch (error) {
        if (error.code === 'P2025') {
            const notFoundError = new Error("Product not found");
            notFoundError.status = 404;
            throw notFoundError;
        }
        throw error;
    }
} 