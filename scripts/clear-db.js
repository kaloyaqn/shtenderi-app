// scripts/clear-db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB cleanup...');

  // Delete in order of dependency
  await prisma.cashMovement.deleteMany();
  console.log('Deleted CashMovements');
  
  await prisma.payment.deleteMany();
  console.log('Deleted Payments');

  await prisma.cashRegister.deleteMany();
  console.log('Deleted CashRegisters');

  await prisma.checkedProduct.deleteMany();
  console.log('Deleted CheckedProducts');

  await prisma.check.deleteMany();
  console.log('Deleted Checks');

  await prisma.missingProduct.deleteMany();
  console.log('Deleted MissingProducts');

  await prisma.revision.deleteMany();
  console.log('Deleted Revisions');

  await prisma.standProduct.deleteMany();
  console.log('Deleted StandProducts');

  await prisma.storageProduct.deleteMany();
  console.log('Deleted StorageProducts');

  await prisma.refundProduct.deleteMany();
  console.log('Deleted RefundProducts');

  await prisma.refund.deleteMany();
  console.log('Deleted Refunds');

  await prisma.creditNote.deleteMany();
  console.log('Deleted CreditNotes');

  await prisma.invoice.deleteMany();
  console.log('Deleted Invoices');

  await prisma.transferProduct.deleteMany();
  console.log('Deleted TransferProducts');

  await prisma.transfer.deleteMany();
  console.log('Deleted Transfers');

  await prisma.importProduct.deleteMany();
  console.log('Deleted ImportProducts');

  await prisma.import.deleteMany();
  console.log('Deleted Imports');

  await prisma.userPartner.deleteMany();
  console.log('Deleted UserPartners');

  await prisma.userStand.deleteMany();
  console.log('Deleted UserStands');

  await prisma.userStorage.deleteMany();
  console.log('Deleted UserStorages');

  await prisma.stand.deleteMany();
  console.log('Deleted Stands');

  await prisma.storage.deleteMany();
  console.log('Deleted Storages');

  await prisma.store.deleteMany();
  console.log('Deleted Stores');

  await prisma.product.deleteMany();
  console.log('Deleted Products');

  console.log('DB cleanup finished. Users and Partners were not deleted.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });