export function getMissingProductUnitPrice(missingProduct) {
  if (!missingProduct) return 0;
  if (typeof missingProduct.priceAtSale === "number") return missingProduct.priceAtSale;
  if (typeof missingProduct.product?.clientPrice === "number") {
    return missingProduct.product.clientPrice;
  }
  return 0;
}

export function getMissingProductQuantity(missingProduct) {
  if (!missingProduct) return 0;
  if (missingProduct.givenQuantity !== null && missingProduct.givenQuantity !== undefined) {
    return missingProduct.givenQuantity;
  }
  return missingProduct.missingQuantity ?? 0;
}

export function getRevisionMissingProductsTotal(missingProducts = []) {
  return missingProducts.reduce((sum, mp) => {
    const unitPrice = getMissingProductUnitPrice(mp);
    const quantity = getMissingProductQuantity(mp);
    return sum + unitPrice * quantity;
  }, 0);
}
