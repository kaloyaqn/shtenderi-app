// Usage: node scripts/backfill_given_quantity.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting backfill of givenQuantity field...');
  
  // Get all missing products that don't have givenQuantity set
  const missingProducts = await prisma.missingProduct.findMany({
    where: {
      givenQuantity: null
    },
    select: {
      id: true,
      missingQuantity: true
    }
  });

  console.log(`Found ${missingProducts.length} missing products to update`);

  let updated = 0;
  for (const mp of missingProducts) {
    await prisma.missingProduct.update({
      where: { id: mp.id },
      data: { 
        givenQuantity: mp.missingQuantity // Set givenQuantity = missingQuantity for existing records
      }
    });
    updated++;
  }

  console.log(`Updated ${updated} missing products with givenQuantity = missingQuantity`);
  console.log('Backfill completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during backfill:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 