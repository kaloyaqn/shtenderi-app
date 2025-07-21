// scripts/delete-products-from-stand.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const standIdToDeleteFrom = '73e62de1-16b3-4025-aa1c-d08eb91e0b54';

async function main() {
  console.log(`Preparing to delete all products from stand with ID: ${standIdToDeleteFrom}`);

  const result = await prisma.standProduct.deleteMany({
    where: {
      standId: standIdToDeleteFrom,
    },
  });

  console.log(`Successfully deleted ${result.count} product(s) from the stand.`);
}

main()
  .catch(e => {
    console.error('An error occurred while deleting stand products:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Script finished.');
  }); 