import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  const doc = new PDFDocument({
    size: [153, 800],
    margins: {
      top: 5,
      bottom: 5,
      left: 5,
      right: 5,
    },
  });

  // Register the font
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

  // Table Header
  doc.fontSize(8)
    .text('Продукт', itemX, tableTop)
    .text('Кол.', qtyX, tableTop, { width: 30, align: 'center' })
    .text('Цена', priceX, tableTop, { width: 30, align: 'right' });

  // Draw a line under the header
  doc.moveTo(itemX, doc.y).lineTo(148, doc.y).stroke();
  doc.moveDown(0.5);

  // Table Rows
  function addRow(item, qty, price) {
    const y = doc.y;
    doc.fontSize(8)
       .text(item, itemX, y)
       .text(qty, qtyX, y, { width: 30, align: 'center' })
       .text(price, priceX, y, { width: 30, align: 'right' });
    doc.moveDown(0.5);
  }

  addRow('Гумент елемент', '1', '10.00');
  addRow('Хо кабел', '2', '25.50');

  // Draw a line after the rows
  doc.moveTo(itemX, doc.y).lineTo(148, doc.y).stroke();
  doc.moveDown();

  // Total
  doc.fontSize(8).text('Общо: 35.50лв.', itemX, doc.y, {
    width: 143, // Usable width (153 total - 5 left margin - 5 right margin)
    align: 'right'
  });
  // --- End PDF Content ---

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfBytes = Buffer.concat(chunks);
      const response = new NextResponse(pdfBytes);
      response.headers.set('Content-Type', 'application/pdf');
      response.headers.set('Content-Disposition', 'attachment; filename="test-receipt.pdf"');
      resolve(response);
    });
    doc.end();
  });
}