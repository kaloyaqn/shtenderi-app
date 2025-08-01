const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDatabase() {
  console.log('🚀 Starting database cleanup...');
  
  try {
    // Start a transaction with increased timeout
    await prisma.$transaction(async (tx) => {
      // Delete dependent tables first (those that reference other tables)
      console.log('📊 Deleting all missing products (sales data)...');
      await tx.missingProduct.deleteMany({});
      
      console.log('📊 Deleting all checked products...');
      await tx.checkedProduct.deleteMany({});
      
      console.log('📊 Deleting all storage products...');
      await tx.storageProduct.deleteMany({});
      
      console.log('📊 Deleting all stand products...');
      await tx.standProduct.deleteMany({});
      
      console.log('📊 Deleting all import products...');
      await tx.importProduct.deleteMany({});
      
      console.log('📊 Deleting all transfer products...');
      await tx.transferProduct.deleteMany({});
      
      console.log('📊 Deleting all refund products...');
      await tx.refundProduct.deleteMany({});
      
      console.log('📊 Deleting all imports...');
      await tx.import.deleteMany({});
      
      console.log('📊 Deleting all transfers...');
      await tx.transfer.deleteMany({});
      
      console.log('📊 Deleting all refunds...');
      await tx.refund.deleteMany({});
      
      console.log('📊 Deleting all credit notes...');
      await tx.creditNote.deleteMany({});
      
      console.log('📊 Deleting all invoices...');
      await tx.invoice.deleteMany({});
      
      console.log('📊 Deleting all payments...');
      await tx.payment.deleteMany({});
      
      console.log('📊 Deleting all cash movements...');
      await tx.cashMovement.deleteMany({});
      
      console.log('📊 Deleting all cash registers...');
      await tx.cashRegister.deleteMany({});
      
      console.log('📊 Deleting all store schedules...');
      await tx.storeSchedule.deleteMany({});
      
      console.log('📊 Deleting all user stands...');
      await tx.userStand.deleteMany({});
      
      console.log('📊 Deleting all user storages...');
      await tx.userStorage.deleteMany({});
      
      console.log('📊 Deleting all user partners...');
      await tx.userPartner.deleteMany({});
      
      // Now delete the main tables (after their dependents are gone)
      console.log('📊 Deleting all checks...');
      await tx.check.deleteMany({});
      
      console.log('📊 Deleting all revisions (sales)...');
      await tx.revision.deleteMany({});
      
      console.log('✅ Database cleanup transaction completed successfully!');
    }, {
      timeout: 30000 // 30 seconds timeout
    });
    
    // Reset product quantities separately after transaction
    console.log('📊 Resetting all product quantities to 0...');
    await prisma.product.updateMany({
      data: {
        quantity: 0
      }
    });
    
    console.log('\n📋 Summary of what was kept:');
    console.log('✅ Users');
    console.log('✅ Stands');
    console.log('✅ Products (with quantity = 0)');
    console.log('✅ Storages');
    console.log('✅ Partners');
    console.log('✅ Stores');
    
    console.log('\n🗑️ Summary of what was deleted:');
    console.log('❌ All missing products (sales data)');
    console.log('❌ All checked products');
    console.log('❌ All storage products');
    console.log('❌ All stand products');
    console.log('❌ All import products');
    console.log('❌ All transfer products');
    console.log('❌ All refund products');
    console.log('❌ All imports');
    console.log('❌ All transfers');
    console.log('❌ All refunds');
    console.log('❌ All credit notes');
    console.log('❌ All invoices');
    console.log('❌ All payments');
    console.log('❌ All cash movements');
    console.log('❌ All cash registers');
    console.log('❌ All store schedules');
    console.log('❌ All user stands');
    console.log('❌ All user storages');
    console.log('❌ All user partners');
    console.log('❌ All checks');
    console.log('❌ All revisions (sales)');
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupDatabase()
  .then(() => {
    console.log('\n🎉 Database cleanup finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Database cleanup failed:', error);
    process.exit(1);
  }); 