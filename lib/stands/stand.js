// lib/stand.js

import { prisma } from '@/lib/prisma'

export async function getAllStands(user) {
  const whereClause = {};
  whereClause.isActive = true;
  if (user && user.role === 'USER') {
    whereClause.userStands = {
      some: {
        userId: user.id,
      },
    };
  }

  const stands = await prisma.stand.findMany({
    where: whereClause,
    include: {
        _count: {
            select: { standProducts: true }
        },
        store: {
          select: {
            id: true,
            name: true,
            partnerId: true,
            partner: { select: { id: true, name: true, percentageDiscount: true } }, // include partner and its name
          }
        },
        userStands: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        },
    },
    orderBy: {
      name: 'asc'
    }
  })
  return stands.map(s => ({ ...s, partnerId: s.store?.partnerId }));
}

export async function createStand({ name, storeId, regionId }) {
  if (!name || !storeId) {
    const error = new Error("Missing required fields");
    error.status = 400;
    throw error;
  }

  const storeExists = await prisma.store.findUnique({
    where: { id: storeId }
  });

  if (!storeExists) {
    const error = new Error("Store not found");
    error.status = 404;
    throw error;
  }

  const existingStand = await prisma.stand.findFirst({
    where: {
      name,
      isActive: true,
    }
  });

  if (existingStand) {
    const error = new Error("Щендер с такова име вече съществува.");
    error.status = 409;
    throw error;
  }

  // Build region relation object
  const regionRelation =
    regionId && regionId !== ""
      ? { connect: { id: regionId } }
      : undefined; // don't add anything

  const stand = await prisma.stand.create({
    data: {
      name,
      store: {
        connect: { id: storeId }
      },
      ...(regionRelation && { region: regionRelation })
    }
  });

  return stand;
}


export async function getStandById(standId) {
    const stand = await prisma.stand.findUnique({
        where: {
            id: standId
        },
        include: {
            store: { select: { partnerId: true } },
            region: {select: {id: true, name:true}}
        },
    });

    if (!stand) {
        const error = new Error("Stand not found");
        error.status = 404;
        throw error;
    }

    return { ...stand, partnerId: stand.partnerId || stand.store?.partnerId };
}

export async function updateStand(standId, { name, storeId, regionId }) {
  if (!name || !storeId) {
    const error = new Error("Missing required fields");
    error.status = 400;
    throw error;
  }

  const storeExists = await prisma.store.findUnique({
    where: { id: storeId }
  });

  if (!storeExists) {
    const error = new Error("Store not found");
    error.status = 404;
    throw error;
  }

  const regionUpdate =
    regionId && regionId !== ""
      ? { connect: { id: regionId } }
      : { disconnect: true };

  const updatedStand = await prisma.stand.update({
    where: {
      id: standId,
    },
    data: {
      name,
      store: {
        connect: { id: storeId }
      },
      region: regionUpdate,
    },
  });

  return updatedStand;
}


export async function deleteStand(standId) {
    try {
        const stand = await prisma.stand.findUnique({ where: { id: standId } });
        if (!stand) {
            const notFoundError = new Error("Stand not found");
            notFoundError.status = 404;
            throw notFoundError;
        }

        if (!stand.isActive) {
            return;
        }

        await prisma.stand.update({
            where: { id: standId },
            data: {
                isActive: false,
                deactivatedAt: new Date(),
            },
        });
    } catch (error) {
        if (error.code === 'P2025') {
            const notFoundError = new Error("Stand not found");
            notFoundError.status = 404;
            throw notFoundError;
        }
        throw error;
    }
}
