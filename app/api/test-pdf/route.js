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
  doc.text('Date: ' + new Date().toLocaleDateString());
  doc.text('Time: ' + new Date().toLocaleTimeString());
  doc.moveDown();
  doc.text('--------------------------');
  doc.text('Продукт         Кол.  Цена');
  doc.text('--------------------------');
  doc.text('Лилав гумен инструмент     1  10.00');
  doc.text('Sample Item 2     2  25.50');
  doc.text('--------------------------');
  doc.moveDown();
  doc.fontSize(10).text('Total: 35.50', { align: 'right' });
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