import { prisma } from '@/lib/prisma'

export async function getAllStores() {
    const stores = await prisma.store.findMany({
        include: { partner: true },
        orderBy: { createdAt: 'desc' },
    })
    return stores
}

export async function createStore({ name, address, contact, phone, partnerId }) {
    if (!name || !address || !partnerId) {
        const error = new Error("Name, address, and partner are required");
        error.status = 400;
        throw error;
    }

    // Optional: Check if partner exists
    const partnerExists = await prisma.partner.findUnique({ where: { id: partnerId }});
    if (!partnerExists) {
        const error = new Error("Partner not found");
        error.status = 404;
        throw error;
    }

    const store = await prisma.store.create({
        data: { name, address, contact, phone, partnerId },
        include: { partner: true },
    })
    return store
}

export async function getStoreById(storeId) {
    const store = await prisma.store.findUnique({
        where: { id: storeId },
        include: {
            partner: true,
            stands: {
                include: {
                    _count: {
                        select: { standProducts: true }
                    }
                }
            }
        },
    })

    if (!store) {
        const error = new Error("Store not found");
        error.status = 404;
        throw error;
    }

    return store;
}

export async function updateStore(storeId, { name, address, contact, phone, partnerId }) {
    if (!name || !address || !partnerId) {
        const error = new Error("Name, address, and partner are required");
        error.status = 400;
        throw error;
    }

    try {
        const store = await prisma.store.update({
            where: { id: storeId },
            data: { name, address, contact, phone, partnerId },
            include: { partner: true },
        })
        return store;
    } catch (error) {
        if (error.code === 'P2025') {
            const notFoundError = new Error("Store not found");
            notFoundError.status = 404;
            throw notFoundError;
        }
        throw error;
    }
}

export async function deleteStore(storeId) {
    try {
        await prisma.store.delete({
            where: { id: storeId },
        })
    } catch (error) {
        if (error.code === 'P2025') {
            const notFoundError = new Error("Store not found");
            notFoundError.status = 404;
            throw notFoundError;
        }
        throw error;
    }
} 