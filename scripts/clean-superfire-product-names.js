// scripts/clean-superfire-product-names.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Searching for products starting with "SUPERFIRE" to clean...');

  const productsToUpdate = await prisma.product.findMany({
    where: {
      name: {
        startsWith: 'SUPERFIRE',
        mode: 'insensitive',
      },
    },
  });

  if (productsToUpdate.length === 0) {
    console.log('No SUPERFIRE products found. Nothing to do.');
    return;
  }

  console.log(`Found ${productsToUpdate.length} SUPERFIRE product(s) to update.`);

  // This improved regex matches the target words AND any preceding comma and/or whitespace.
  const wordsToRemoveRegex = /[\s,]+(USB-A|USB-C|USB|UV|Mosquito|\d+lm|Power bank)\b/gi;

  const updatePromises = productsToUpdate.map(product => {
    // Replace the pattern with an empty string and then clean up any resulting double spaces.
    const newName = product.name.replace(wordsToRemoveRegex, '').replace(/\s\s+/g, ' ').trim();
    
    if (product.name !== newName) {
      console.log(`- Updating "${product.name}"\n    to -> "${newName}"`);
    } else {
      console.log(`- No changes needed for "${product.name}"`);
    }

    return prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        name: newName,
      },
    });
  });

  await Promise.all(updatePromises);

  console.log('\nSuccessfully updated all found SUPERFIRE products.');
}

main()
  .catch(e => {
    console.error('An error occurred during the script execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Script finished.');
  });
