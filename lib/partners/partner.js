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