// This script copies clientPrice to deliveryPrice for all products
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  for (const product of products) {
    await prisma.product.update({
      where: { id: product.id },
      data: { deliveryPrice: product.clientPrice },
    });
    console.log(`Updated product ${product.id}: deliveryPrice = ${product.clientPrice}`);
  }
  console.log('All products updated.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 