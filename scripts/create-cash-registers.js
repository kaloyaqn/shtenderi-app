const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createCashRegisters() {
  console.log('🚀 Creating cash registers for storages...');
  
  const storageIds = [
    'ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4',
    '6b5f66af-bd69-492f-8ee3-5ca726b5b8cc'
  ];
  
  try {
    for (const storageId of storageIds) {
      console.log(`📊 Creating cash register for storage: ${storageId}`);
      
      // Check if storage exists
      const storage = await prisma.storage.findUnique({
        where: { id: storageId }
      });
      
      if (!storage) {
        console.log(`❌ Storage with ID ${storageId} not found, skipping...`);
        continue;
      }
      
      // Check if cash register already exists for this storage
      const existingCashRegister = await prisma.cashRegister.findFirst({
        where: { storageId: storageId }
      });
      
      if (existingCashRegister) {
        console.log(`⚠️ Cash register already exists for storage ${storageId} (${storage.name}), skipping...`);
        continue;
      }
      
      // Create cash register
      const cashRegister = await prisma.cashRegister.create({
        data: {
          storageId: storageId,
          cashBalance: 0
        }
      });
      
      console.log(`✅ Created cash register: ${cashRegister.id} for storage: ${storage.name}`);
    }
    
    console.log('\n📋 Summary:');
    console.log('✅ Cash registers created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating cash registers:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createCashRegisters()
  .then(() => {
    console.log('\n🎉 Cash register creation finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Cash register creation failed:', error);
    process.exit(1);
  }); 