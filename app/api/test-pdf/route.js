import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

function calculateHeight(products, doc) {
  const headerHeight = 70;
  const footerHeight = 30;
  let productsHeight = 0;
  products.forEach(product => {
    productsHeight += doc.heightOfString(product.name, { width: 55 }) + 4; // +4 for spacing
  });
  return headerHeight + productsHeight + footerHeight;
}

export async function POST(request) {
    const body = await request.json();
    const { products, revisionNumber } = body;
  
    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: 'Products data is missing or invalid' }, { status: 400 });
    }
  
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'DejaVuLGCSans.ttf');
    const fontBuffer = fs.readFileSync(fontPath);
  
    // Create a temporary doc to calculate height accurately
    const tempDoc = new PDFDocument({ size: [153, 1000] });
    tempDoc.font(fontBuffer);
    const pageHeight = calculateHeight(products, tempDoc);
  
    const doc = new PDFDocument({
      size: [153, pageHeight],
      margins: {
        top: 5,
        bottom: 5,
        left: 5,
        right: 5,
      },
    });
  
    doc.font(fontBuffer);
  
    const chunks = [];
    doc.on('data', chunks.push.bind(chunks));
  
    // --- PDF Content ---
    doc.fontSize(10).text('Omax Solutions EOOD', { align: 'left' });
    doc.moveDown(0.5);
    if (revisionNumber) {
      doc.moveDown(0.2);
      doc.fontSize(9).text(`Стокова разписка #0035900${revisionNumber}`, { align: 'left' });
    }
    doc.moveDown();

    doc.moveDown();
  
    const tableTop = doc.y;
    const itemX = 5;
    const qtyX = 60;
    const unitPriceX = 85;
    const totalX = 115;
  
    doc.fontSize(8)
      .text('Продукт', itemX, tableTop, { width: 55 })
      .text('Кол.', qtyX, tableTop, { width: 18, align: 'center' })
      .text('Ед.', unitPriceX, tableTop, { width: 28, align: 'right' })
      .text('Общо', totalX, tableTop, { width: 28, align: 'right' });
  
    doc.moveTo(itemX, doc.y).lineTo(148, doc.y).stroke();
    doc.moveDown(0.5);
  
    let total = 0;
    function addRow(item, qty, unitPrice) {
      const y = doc.y;
      const nameHeight = doc.heightOfString(item, { width: 55, align: 'left' });
      const rowHeight = Math.max(nameHeight, 10);
  
      doc.fontSize(8)
        .text(item, itemX, y, { width: 55, align: 'left' })
        .text(qty, qtyX, y, { width: 18, align: 'center' })
        .text(unitPrice.toFixed(2), unitPriceX, y, { width: 28, align: 'right' })
        .text((qty * unitPrice).toFixed(2), totalX, y, { width: 28, align: 'right' });
  
      doc.y = y + rowHeight + 1;
      total += qty * unitPrice;
    }
  
    for (const product of products) {
      addRow(product.name, product.quantity+"", product.price);
    }
  
    doc.moveTo(itemX, doc.y).lineTo(148, doc.y).stroke();
    doc.moveDown();
  
    doc.fontSize(8).text(`Общо: ${total.toFixed(2)}лв.`, itemX, doc.y, {
      width: 143,
      align: 'right'
    });

    doc.fontSize(8).text('Това е СТОКОВА разписка, не е касов бон!');
    doc.text('Дата: ' + new Date().toLocaleDateString());
    doc.text('Време: ' + new Date().toLocaleTimeString());

    // --- End PDF Content ---
  
    doc.end();
  
    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBytes = Buffer.concat(chunks);
        const filename = revisionNumber ? `receipt-${revisionNumber}.pdf` : 'receipt.pdf';
        const response = new Response(pdfBytes, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
        resolve(response);
      });
    });
  }