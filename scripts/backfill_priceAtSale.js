// scripts/backfill_priceAtSale.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


async function main() {
  const missingProducts = await prisma.missingProduct.findMany({
    where: {
      OR: [
        { priceAtSale: null },
        { priceAtSale: 0 },
      ],
    },
    include: {
      product: true,
      revision: true,
    },
  });

  let updated = 0;
  for (const mp of missingProducts) {
    // Fallback to product's clientPrice
    const price = mp.product?.clientPrice || 0;
    if (price > 0) {
      await prisma.missingProduct.update({
        where: { id: mp.id },
        data: { priceAtSale: price },
      });
      updated++;
    }
  }
  console.log(`Updated priceAtSale for ${updated} missingProducts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 