import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

function calculateHeight(products, doc) {
  const headerHeight = 70;
  const footerHeight = 30;
  let productsHeight = 0;
  products.forEach(product => {
    productsHeight += doc.heightOfString(product.name, { width: 50 }) + 4; // Use new width
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
        left: 0, // No software margin
        right: 0, // No software margin
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
    const itemX = 14; // Start at hardware margin
    const qtyX = 70;
    const unitPriceX = 95;
    const totalX = 120;
  
    doc.fontSize(8)
      .text('Продукт', itemX, tableTop, { width: 50 })
      .text('Кол.', qtyX, tableTop, { width: 20, align: 'center' })
      .text('Ед.', unitPriceX, tableTop, { width: 25, align: 'right' })
      .text('Общо', totalX, tableTop, { width: 25, align: 'right' });
  
    doc.moveTo(itemX, doc.y).lineTo(139, doc.y).stroke(); // Use new width
    doc.moveDown(0.5);
  
    let total = 0;
    function addRow(item, qty, unitPrice) {
        const y = doc.y;
        const nameHeight = doc.heightOfString(item, { width: 50, align: 'left' }); // Use new width
        const rowHeight = Math.max(nameHeight, 10);
      
        doc.fontSize(8)
          .text(item, itemX, y, { width: 50, align: 'left' }) // Use new width
          .text(`${qty} бр.`, qtyX, y, { width: 20, align: 'center' })
          .text(`${unitPrice.toFixed(2)} лв.`, unitPriceX, y, { width: 25, align: 'right' })
          .text(`${(qty * unitPrice).toFixed(2)} лв.`, totalX, y, { width: 25, align: 'right' });
      
        doc.y = y + rowHeight + 1;
        total += qty * unitPrice;
    }
  
    for (const product of products) {
      addRow(product.name, product.quantity, product.price);
    }
  
    doc.moveTo(itemX, doc.y).lineTo(139, doc.y).stroke(); // Use new width
    doc.moveDown();
  
    doc.fontSize(10).text(`Общо: ${total.toFixed(2)}лв.`, 0, doc.y, {
      width: 153 - 14, // full width - right margin
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