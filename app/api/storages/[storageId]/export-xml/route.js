import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  const { storageId } = params;
  if (!storageId) {
    return NextResponse.json({ error: 'Missing storageId' }, { status: 400 });
  }

  // Fetch products in the storage
  const storageProducts = await prisma.storageProduct.findMany({
    where: { storageId },
    include: { product: true },
  });

  // Build XML structure
  const goods = storageProducts.map(sp => ({
    barcode: sp.product.barcode,
    name: sp.product.name,
    quantity: sp.quantity,
    price: sp.product.clientPrice, // or deliveryPrice if you prefer
  }));

  // Build XML string
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<info>\n  <goods>\n';
  for (const good of goods) {
    xml += `    <good>\n`;
    xml += `      <barcode>${good.barcode}</barcode>\n`;
    xml += `      <name>${good.name}</name>\n`;
    xml += `      <quantity>${good.quantity}</quantity>\n`;
    xml += `      <price>${good.price}</price>\n`;
    xml += `    </good>\n`;
  }
  xml += '  </goods>\n</info>';

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Content-Disposition': `attachment; filename=storage-${storageId}.xml`,
    },
  });
} 