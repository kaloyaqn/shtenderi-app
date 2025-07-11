// Usage: node scripts/backfill_revision_status.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const revisions = await prisma.revision.findMany({
    select: { id: true },
  });
  let updated = 0;
  for (const rev of revisions) {
    // Calculate total payments
    const payments = await prisma.payment.aggregate({
      where: { revisionId: rev.id },
      _sum: { amount: true },
    });
    const totalPaid = payments._sum.amount || 0;
    // Calculate total due
    const missing = await prisma.missingProduct.findMany({
      where: { revisionId: rev.id },
      select: { missingQuantity: true, priceAtSale: true },
    });
    const totalDue = missing.reduce((sum, mp) => sum + mp.missingQuantity * (mp.priceAtSale || 0), 0);
    // Determine status
    const status = (totalPaid >= totalDue && totalDue > 0) ? 'PAID' : 'NOT_PAID';
    await prisma.revision.update({
      where: { id: rev.id },
      data: { status },
    });
    updated++;
  }
  console.log(`Updated status for ${updated} revisions.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect()); 



//   TODO PITAI MIRA DALI DA SA PLATENI ILI NE PLATENI