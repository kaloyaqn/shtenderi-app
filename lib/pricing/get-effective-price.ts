import { prisma } from '@/lib/prisma';

export async function getEffectivePrice({ productId, partnerId }) {
  const [product, partner] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId }, select: { clientPrice: true } }),
    prisma.partner.findUnique({ where: { id: partnerId }, select: { percentageDiscount: true, priceGroupId: true } }),
  ]);

  if (!product) return 0;
  const base = product.clientPrice || 0;

  if (partner?.percentageDiscount && partner.percentageDiscount > 0) {
    return +(base * (1 - partner.percentageDiscount / 100)).toFixed(2);
  }

  if (partner?.priceGroupId) {
    const gp = await prisma.priceGroupProduct.findFirst({
      where: { priceGroupId: partner.priceGroupId, productId },
      select: { price: true },
    });
    if (gp?.price != null) return +Number(gp.price).toFixed(2);
  }

  return +base.toFixed(2);
}