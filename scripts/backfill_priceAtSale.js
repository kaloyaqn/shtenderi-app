// scripts/backfill_priceAtSale.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const today = new Date();

  // Find all stores where schedule is null
  const storesToUpdate = await prisma.store.findMany({
    where: {
      schedule: {
        equals: null
      }
    },
    select: {
      id: true
    }
  });

  let updated = 0;
  for (const store of storesToUpdate) {
    await prisma.store.update({
      where: { id: store.id },
      data: { schedule: today },
    });
    updated++;
  }
  console.log(`Updated schedule to today for ${updated} stores.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });