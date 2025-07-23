const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const productsToUpdate = [
    { barcode: '6975837583184', quantity: 16},
  ];

async function main() {
  for (const { barcode, quantity } of productsToUpdate) {
    const updated = await prisma.product.updateMany({
      where: { barcode },
      data: { quantity },
    });

    if (updated.count === 0) {
      console.warn(`⚠️ No product found with barcode ${barcode}`);
    } else {
      console.log(`✅ Updated product ${barcode} to quantity ${quantity}`);
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});