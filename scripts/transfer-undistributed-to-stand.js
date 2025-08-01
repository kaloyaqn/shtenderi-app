const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const TARGET_STAND_ID = '158bf47a-1079-4ecb-b58d-0e5c88e05588';

async function transferUndistributedToStand() {
  try {
    console.log('Starting transfer of undistributed products to stand...');
    
    // First, verify the target stand exists
    const targetStand = await prisma.stand.findUnique({
      where: { id: TARGET_STAND_ID },
      include: { store: true }
    });
    
    if (!targetStand) {
      console.error(`Stand with ID ${TARGET_STAND_ID} not found!`);
      return;
    }
    
    console.log(`Target stand: ${targetStand.name} (Store: ${targetStand.store.name})`);
    
    // Get all BASEUS products and their current distribution
    const products = await prisma.product.findMany({
      where: {
        name: {
          startsWith: 'BASEUS'
        }
      },
      include: {
        standProducts: {
          include: {
            stand: true
          }
        }
      }
    });
    
    console.log(`Found ${products.length} BASEUS products`);
    
    if (products.length === 0) {
      console.log('No BASEUS products found.');
      return;
    }
    
    // Calculate undistributed quantities for each product
    const undistributedProducts = [];
    products.forEach(product => {
      const assignedQuantity = product.standProducts.reduce(
        (sum, sp) => sum + sp.quantity,
        0
      );
      const undistributedQuantity = product.quantity - assignedQuantity;
      
      if (undistributedQuantity > 0) {
        undistributedProducts.push({
          product: product,
          undistributedQuantity: undistributedQuantity,
          totalQuantity: product.quantity,
          assignedQuantity: assignedQuantity,
          currentStands: product.standProducts.map(sp => ({
            standName: sp.stand.name,
            quantity: sp.quantity
          }))
        });
      }
    });
    
    console.log(`Found ${undistributedProducts.length} BASEUS products with undistributed quantities`);
    
    if (undistributedProducts.length === 0) {
      console.log('No BASEUS products with undistributed quantities found.');
      return;
    }
    
    console.log(`Found ${undistributedProducts.length} BASEUS products with undistributed quantities to transfer`);
    
    // Check which products are already on the target stand
    const existingStandProducts = await prisma.standProduct.findMany({
      where: { standId: TARGET_STAND_ID },
      select: { productId: true, quantity: true }
    });
    
    const existingProductMap = new Map();
    existingStandProducts.forEach(sp => {
      existingProductMap.set(sp.productId, sp.quantity);
    });
    
    // Start transaction with increased timeout
    const result = await prisma.$transaction(async (tx) => {
      const transfers = [];
      
      // Prepare all updates in batches
      const standProductUpdates = [];
      
      for (const data of undistributedProducts) {
        const existingQuantity = existingProductMap.get(data.product.id) || 0;
        const newQuantity = existingQuantity + data.undistributedQuantity;
        
        // Prepare StandProduct update/insert
        standProductUpdates.push({
          where: {
            standId_productId: {
              standId: TARGET_STAND_ID,
              productId: data.product.id
            }
          },
          update: {
            quantity: newQuantity
          },
          create: {
            standId: TARGET_STAND_ID,
            productId: data.product.id,
            quantity: data.undistributedQuantity
          }
        });
        
        transfers.push({
          productName: data.product.name,
          productBarcode: data.product.barcode,
          undistributedQuantity: data.undistributedQuantity,
          totalQuantity: data.totalQuantity,
          assignedQuantity: data.assignedQuantity,
          existingOnStand: existingQuantity,
          newTotalOnStand: newQuantity,
          currentStands: data.currentStands
        });
      }
      
      // Execute all StandProduct updates
      console.log(`Updating ${standProductUpdates.length} stand products...`);
      for (const update of standProductUpdates) {
        await tx.standProduct.upsert(update);
      }
      
      return transfers;
    }, {
      timeout: 30000 // 30 seconds timeout
    });
    
    console.log('\n=== TRANSFER COMPLETED ===');
    console.log(`Successfully transferred ${result.length} BASEUS products to stand "${targetStand.name}"`);
    
    console.log('\n=== TRANSFER DETAILS ===');
    result.forEach((transfer, index) => {
      console.log(`\n${index + 1}. ${transfer.productName} (${transfer.productBarcode})`);
      console.log(`   Total product quantity: ${transfer.totalQuantity}`);
      console.log(`   Previously assigned to stands: ${transfer.assignedQuantity}`);
      console.log(`   Undistributed quantity transferred: ${transfer.undistributedQuantity}`);
      console.log(`   Previously on target stand: ${transfer.existingOnStand}`);
      console.log(`   New total on target stand: ${transfer.newTotalOnStand}`);
      console.log(`   Currently on other stands:`);
      transfer.currentStands.forEach(stand => {
        console.log(`     - ${stand.standName}: ${stand.quantity}`);
      });
    });
    
    const totalProductsTransferred = result.reduce((sum, t) => sum + t.undistributedQuantity, 0);
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total BASEUS products transferred: ${totalProductsTransferred}`);
    console.log(`Unique BASEUS products: ${result.length}`);
    
  } catch (error) {
    console.error('Error during transfer:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
transferUndistributedToStand(); 