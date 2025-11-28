import { prisma } from '@/lib/prisma';

// Original store functions
export async function getAllStores() {
    const stores = await prisma.store.findMany({
        include: { partner: true, stands: true , city:true, channel:true}, // include stands
        orderBy: { createdAt: 'desc' },
    })
    return stores
}

export async function createStore({ name, address, contact, phone, partnerId, cityId, channelId }) {
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
        data: { name, address, contact, phone, partnerId, cityId, channelId },
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
            },
            schedules: {
                orderBy: { date: 'asc' },
            },
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

// New schedule functions
export async function getStoreSchedules(storeId) {
  return await prisma.storeSchedule.findMany({
    where: { storeId },
    orderBy: { date: 'asc' },
  });
}

export async function addStoreSchedule(storeId, date, type = null, notes = null) {
  return await prisma.storeSchedule.create({
    data: {
      storeId,
      date: new Date(date),
      type,
      notes,
    },
  });
}

export async function updateStoreScheduleItem(scheduleId, data) {
  return await prisma.storeSchedule.update({
    where: { id: scheduleId },
    data: {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
    },
  });
}

export async function deleteStoreSchedule(scheduleId) {
  return await prisma.storeSchedule.delete({
    where: { id: scheduleId },
  });
}

export async function getStoresWithSchedules() {
  return await prisma.store.findMany({
    include: {
      schedules: {
        orderBy: { date: 'asc' },
      },
      partner: true,
      stands: true,
    },
  });
}

export async function getStoresByScheduleDate(date) {
  const targetDate = new Date(date);
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

  return await prisma.storeSchedule.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      store: {
        include: {
          partner: true,
          stands: true,
        },
      },
    },
  });
}

export async function getUpcomingSchedules(storeId, days = 30) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

  return await prisma.storeSchedule.findMany({
    where: {
      storeId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'asc' },
  });
}
