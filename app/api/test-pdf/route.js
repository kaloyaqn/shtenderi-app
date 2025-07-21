
import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

function calculateHeight(products, doc) {
  const headerHeight = 65; // Adjusted for smaller fonts
  const footerHeight = 25; // Adjusted for smaller fonts
  let productsHeight = 0;
  doc.fontSize(7); // Set font size for measurement
  products.forEach(product => {
    productsHeight += doc.heightOfString(product.name, { width: 55 }) + 3; // +3 for spacing
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
    tempDoc.fontSize(7); // Set font size for measurement before calculating
    const pageHeight = calculateHeight(products, tempDoc);
  
    const doc = new PDFDocument({
      size: [153, pageHeight],
      margins: {
        top: 5,
        bottom: 5,
        left: 2, // Minimal gutter
        right: 2, // Minimal gutter
      },
    });
  
    doc.font(fontBuffer);
  
    const chunks = [];
    doc.on('data', chunks.push.bind(chunks));
  
    // --- PDF Content ---
    doc.fontSize(9).text('Omax Solutions EOOD', { align: 'left' }); // Was 10
    doc.moveDown(0.5);
    if (revisionNumber) {
      doc.moveDown(0.2);
      doc.fontSize(8).text(`Стокова разписка #0035900${revisionNumber}`, { align: 'left' }); // Was 9
    }
    doc.moveDown();

    doc.moveDown();
  
    const tableTop = doc.y;
    const itemX = 2;
    const qtyX = 57;
    const unitPriceX = 82;
    const totalX = 117;
  
    doc.fontSize(7) // Was 8
      .text('Продукт', itemX, tableTop, { width: 55 })
      .text('Кол.', qtyX, tableTop, { width: 25, align: 'center' })
      .text('Ед.', unitPriceX, tableTop, { width: 35, align: 'right' })
      .text('Общо', totalX, tableTop, { width: 35, align: 'right' });
  
    doc.moveTo(itemX, doc.y).lineTo(151, doc.y).stroke(); // Use new width
    doc.moveDown(0.5);
  
    let total = 0;
    function addRow(item, qty, unitPrice) {
        const y = doc.y;
        doc.fontSize(7); // Set font size before measuring
        const nameHeight = doc.heightOfString(item, { width: 55, align: 'left' });
        const rowHeight = Math.max(nameHeight, 9); // Adjusted minimum height
      
        doc.fontSize(7) // Was 8
          .text(item, itemX, y, { width: 55, align: 'left' }) 
          .text(`${qty} бр.`, qtyX, y, { width: 25, align: 'center' })
          .text(`${unitPrice.toFixed(2)} лв.`, unitPriceX, y, { width: 35, align: 'right' })
          .text(`${(qty * unitPrice).toFixed(2)} лв.`, totalX, y, { width: 35, align: 'right' });
      
        doc.y = y + rowHeight + 1;
        total += qty * unitPrice;
    }
  
    for (const product of products) {
      addRow(product.name, product.quantity, product.price);
    }
  
    doc.moveTo(itemX, doc.y).lineTo(151, doc.y).stroke(); // Use new width
    doc.moveDown();
  
    doc.fontSize(9).text(`Общо: ${total.toFixed(2)}лв.`, 0, doc.y, { // Was 10
      width: 153 - 2, 
      align: 'right'
    });

    doc.fontSize(7).text('Това е СТОКОВА разписка, не е касов бон!'); // Was 8
    doc.fontSize(7).text('Дата: ' + new Date().toLocaleDateString());
    doc.fontSize(7).text('Време: ' + new Date().toLocaleTimeString());

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