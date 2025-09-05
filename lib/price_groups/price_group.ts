import { prisma } from "../prisma";


export async function createPriceGroup({ name }: { name: string }) {
    if (!name) {
      const error = new Error('Missing required field: name');
      error.name = 'ValidationError';
      throw error;
    }
  
    const priceGroup = await prisma.priceGroup.create({
      data: { name }, // isActive defaults true via schema
    });
  
    return priceGroup;
}

export async function getPriceGroups() {
    const price_groups = await prisma.priceGroup.findMany({
        orderBy: {
            createdAt:"desc"
        }
    });

    return price_groups.map(p => ({...p}));
}

export async function deletePriceGroup(price_group_id: string) {
    try {
        // Use the correct Prisma model name in snake_case to match the Go API and your schema
        await prisma.priceGroup.delete({
            where: { id: price_group_id },
        });
    } catch (err: any) {
        // Prisma error code P2025 means "Record to delete does not exist."
        if (err.code === "P2025") {
            throw new Error("price group not found");
        }
        throw err;
    }
}