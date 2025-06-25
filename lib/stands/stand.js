// lib/stand.js

import { prisma } from '@/lib/prisma'

export async function getAllStands() {
  const stands = await prisma.stand.findMany({
    orderBy: {
      name: 'asc'
    }
  })
  return stands
}

export async function createStand({ name, storeId }) {
    if (!name || !storeId) {
        const error = new Error("Missing required fields");
        error.status = 400;
        throw error;
    }

    const storeExists = await prisma.store.findUnique({
        where: {
            id: storeId
        }
    });

    if (!storeExists) {
        const error = new Error("Store not found");
        error.status = 404;
        throw error;
    }

    const stand = await prisma.stand.create({
        data: {
            name,
            store: {
                connect: {
                    id: storeId
                }
            }
        }
    })
    return stand
}

export async function getStandById(standId) {
    const stand = await prisma.stand.findUnique({
        where: {
            id: standId
        }
    });

    if (!stand) {
        const error = new Error("Stand not found");
        error.status = 404;
        throw error;
    }

    return stand;
}

export async function updateStand(standId, { name, storeId }) {
    if (!name || !storeId) {
        const error = new Error("Missing required fields");
        error.status = 400;
        throw error;
    }
    
    const storeExists = await prisma.store.findUnique({
        where: {
            id: storeId
        }
    });

    if (!storeExists) {
        const error = new Error("Store not found");
        error.status = 404;
        throw error;
    }

    const updatedStand = await prisma.stand.update({
        where: {
            id: standId
        },
        data: {
            name,
            store: {
                connect: {
                    id: storeId
                }
            }
        }
    });

    return updatedStand;
}

export async function deleteStand(standId) {
    try {
        await prisma.stand.delete({
            where: { id: standId },
        })
    } catch (error) {
        if (error.code === 'P2025') { // Prisma code for record not found
            const notFoundError = new Error("Stand not found");
            notFoundError.status = 404;
            throw notFoundError;
        }
        throw error;
    }
}
