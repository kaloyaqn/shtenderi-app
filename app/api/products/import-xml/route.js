import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { products, updateQuantities } = await req.json();

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: 'Invalid products data' }, { status: 400 });
    }

    const updatedProducts = [];
    const createdProducts = [];

    for (const product of products) {
      if (!product.barcode) continue;

      const barcodeAsString = String(product.barcode);

      // Use 'price' from XML as deliveryPrice, fallback to clientPrice, then deliveryPrice, then 0
      const deliveryPrice =
        typeof product.price === 'number'
          ? product.price
          : typeof product.clientPrice === 'number'
            ? product.clientPrice
            : (parseFloat(product.deliveryPrice) || 0);
      console.log('[IMPORT-XML][PRODUCTS] Incoming product:', product);
      console.log('[IMPORT-XML][PRODUCTS] Computed deliveryPrice:', deliveryPrice);

      try {
        const existingProduct = await prisma.product.findUnique({
          where: { barcode: barcodeAsString },
        });

        if (existingProduct) {
          const updateData = {
            deliveryPrice: deliveryPrice,
            // Do NOT update name or clientPrice if product already exists
          };
          if (updateQuantities) {
            updateData.quantity = { increment: parseInt(product.quantity, 10) || 0 };
          }
          if (product.shouldActivate) {
            updateData.active = true;
          }
          console.log('[IMPORT-XML][PRODUCTS] Updating product with:', updateData);
          const updatedProduct = await prisma.product.update({
            where: { id: existingProduct.id },
            data: updateData,
          });
          updatedProducts.push(updatedProduct);
        } else {
          const newProductData = {
            name: product.name || 'Unnamed Product',
            barcode: barcodeAsString,
            clientPrice: 0, // Always 0 on create
            deliveryPrice: deliveryPrice,
            quantity: parseInt(product.quantity, 10) || 0,
            active: true,
          };
          console.log('[IMPORT-XML][PRODUCTS] Creating product with:', newProductData);
          const newProduct = await prisma.product.create({
            data: newProductData,
          });
          createdProducts.push(newProduct);
        }
      } catch (error) {
        console.error(`Error processing product ${barcodeAsString}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      updatedProducts,
      createdProducts,
    });
  } catch (error) {
    console.error('Import XML error:', error);
    return NextResponse.json({ error: 'Failed to import products' }, { status: 500 });
  }
} 