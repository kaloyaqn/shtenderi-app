// scripts/clear-db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Delete child/related tables first to avoid foreign key constraint errors

  // Revision-related
  await prisma.missingProduct.deleteMany();
  await prisma.revision.deleteMany();

  // Stand-related
  await prisma.standProduct.deleteMany();
  await prisma.check.deleteMany();
  await prisma.checkedProduct.deleteMany();

  // Storage-related
  await prisma.storageProduct.deleteMany();

  // Refund-related
  await prisma.refundProduct.deleteMany();
  await prisma.refund.deleteMany();

  // Credit notes and invoices
  await prisma.creditNote.deleteMany();
  await prisma.invoice.deleteMany();

  // Transfers
  await prisma.transferProduct.deleteMany();
  await prisma.transfer.deleteMany();

  // Imports
  await prisma.importProduct.deleteMany();
  await prisma.import.deleteMany();

  // User relations
  await prisma.userPartner.deleteMany();
  await prisma.userStand.deleteMany();
  await prisma.userStorage.deleteMany();

  // Stand, Storage, Store
  await prisma.stand.deleteMany();
  await prisma.storage.deleteMany();
  await prisma.store.deleteMany();

  // Products
  await prisma.product.deleteMany();

  // Users
  await prisma.user.deleteMany();

  // Do NOT delete partners!
  // await prisma.partner.deleteMany();
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });