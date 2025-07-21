import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(request) {
  const body = await request.json();
  const { products } = body;

  if (!products || !Array.isArray(products)) {
    return NextResponse.json({ error: 'Products data is missing or invalid' }, { status: 400 });
  }

  const doc = new PDFDocument({
    size: [153, 800],
    margins: {
      top: 5,
      bottom: 5,
      left: 5,
      right: 5,
    },
  });

  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'DejaVuLGCSans.ttf');
  const fontBuffer = fs.readFileSync(fontPath);
  doc.font(fontBuffer);

  const chunks = [];
  doc.on('data', chunks.push.bind(chunks));

  // --- PDF Content ---
  doc.fontSize(10).text('Stendo.bg', { align: 'left' });
  doc.moveDown(0.5);
  doc.fontSize(8).text('Щендери, които работят за теб.');
  doc.moveDown();
  doc.text('Дата: ' + new Date().toLocaleDateString());
  doc.text('Време: ' + new Date().toLocaleTimeString());
  doc.moveDown();

  const tableTop = doc.y;
  const itemX = 5;
  const qtyX = 95;
  const priceX = 120;

  doc.fontSize(8)
    .text('Продукт', itemX, tableTop)
    .text('Кол.', qtyX, tableTop, { width: 30, align: 'center' })
    .text('Цена', priceX, tableTop, { width: 30, align: 'right' });

  doc.moveTo(itemX, doc.y).lineTo(148, doc.y).stroke();
  doc.moveDown(0.5);

  let total = 0;
  function addRow(item, qty, price) {
    const y = doc.y;
    // Render product name and get height
    const nameOptions = { width: 85, continued: false };
    doc.fontSize(8).text(item, itemX, y, nameOptions);
    // Find the new y after product name (handles wrapping)
    const afterNameY = doc.y;
    // Render qty and price at the same y as the product name
    doc.fontSize(8)
      .text(qty, qtyX, y, { width: 30, align: 'center' })
      .text(price, priceX, y, { width: 30, align: 'right' });
    // Move down to after the product name
    doc.y = afterNameY;
    doc.moveDown(0.2);
    total += qty * price;
  }

  for (const product of products) {
    addRow(product.name, product.quantity, product.price);
    doc.moveDown(0.5); // Add a blank row for better spacing
  }
  
  doc.moveDown(2); // Add extra space in case of long product names
  doc.moveTo(itemX, doc.y).lineTo(148, doc.y).stroke();
  doc.moveDown();

  doc.fontSize(8).text(`Общо: ${total.toFixed(2)}лв.`, itemX, doc.y, {
    width: 143,
    align: 'right'
  });
  // --- End PDF Content ---

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfBytes = Buffer.concat(chunks);
      const response = new Response(pdfBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="receipt.pdf"',
        },
      });
      resolve(response);
    });
  });
}