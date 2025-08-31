import PDFDocument from 'pdfkit/js/pdfkit.standalone.js';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Define document dimensions for 2-inch thermal printer
const DOCUMENT_WIDTH = 144;
const DOCUMENT_HEIGHT = 400; // Increased height for the ASCII art

export async function POST(request) {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'DejaVuLGCSans.ttf');
  let fontBuffer;
  try {
    fontBuffer = fs.readFileSync(fontPath);
  } catch (error) {
    console.error("Error loading font file:", error);
    return NextResponse.json({ error: 'Failed to load font file.' }, { status: 500 });
  }

  // Initialize PDFDocument with 2-inch width
  const doc = new PDFDocument({
    size: [DOCUMENT_WIDTH, DOCUMENT_HEIGHT],
    margins: {
      top: 5,
      bottom: 5,
      left: 2,   // Even smaller margins for this masterpiece
      right: 2,
    },
  });

  doc.font(fontBuffer);

  const chunks = [];
  doc.on('data', chunks.push.bind(chunks));

  // --- THE MASTERPIECE ASCII ART ---
  
  // Optimal font size for 2-inch width with this art
  const fontSize = 4;
  doc.fontSize(fontSize);

  // The exceptional ASCII art of the decade
  const artLines = [
    '⠀⠀⠀⠀⠀⠀⠀⠀⣠⣶⣿⣿⣿⣷⣤⡀⠀⠀⠀⠀⠀⠀⠀',
    '⠀⠀⠀⠀⠀⠀⢀⣾⡿⠋⠀⠿⠇⠉⠻⣿⣄⠀⠀⠀⠀⠀⠀',
    '⠀⠀⠀⠀⠀⢠⣿⠏⠀⠀⠀⠀⠀⠀⠀⠙⣿⣆⠀⠀⠀⠀⠀',
    '⠀⠀⠀⠀⢠⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⣆⠀⠀⠀⠀',
    '⠀⠀⠀⠀⢸⣿⡄⠀⠀⠀⢀⣤⣀⠀⠀⠀⠀⣿⡿⠀⠀⠀⠀',
    '⠀⠀⠀⠀⠀⠻⣿⣶⣶⣾⡿⠟⢿⣷⣶⣶⣿⡟⠁⠀⠀⠀⠀',
    '⠀⠀⠀⠀⠀⠀⣿⡏⠉⠁⠀⠀⠀⠀⠉⠉⣿⡇⠀⠀⠀⠀⠀',
    '⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀',
    '⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀',
    '⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀',
    '⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀',
    '⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀',
    '⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀',
    '⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⣸⣿⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀',
    '⠀⠀⠀⠀⠀⠀⣿⡇⢀⣴⣿⠇⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀',
    '⠀⠀⠀⢀⣠⣴⣿⣷⣿⠟⠁⠀⠀⠀⠀⠀⣿⣧⣄⡀⠀⠀⠀',
    '⠀⢀⣴⡿⠛⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠙⢿⣷⣄⠀',
    '⢠⣿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⣆',
    '⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣿',
    '⣿⣇⠀⠀⠀⠀⠀⠀⢸⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿',
    '⢹⣿⡄⠀⠀⠀⠀⠀⠀⢿⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⡿',
    '⠀⠻⣿⣦⣀⠀⠀⠀⠀⠈⣿⣷⣄⡀⠀⠀⠀⠀⣀⣤⣾⡟⠁',
    '⠀⠀⠈⠛⠿⣿⣷⣶⣾⡿⠿⠛⠻⢿⣿⣶⣾⣿⠿⠛⠉⠀⠀'
  ];

  // Add a title at the top
  doc.fontSize(6);
  doc.text('', doc.page.margins.left, doc.page.margins.top + 5, {
    width: DOCUMENT_WIDTH - doc.page.margins.left - doc.page.margins.right,
    align: 'center'
  });
  
  // Add some space after title
  doc.moveDown(0.5);
  
  // Reset to art font size
  doc.fontSize(fontSize);

  // Calculate positioning for the art
  let widestLineLength = 0;
  artLines.forEach(line => {
    const lineWidth = doc.widthOfString(line);
    if (isNaN(lineWidth)) { 
      console.warn(`doc.widthOfString returned NaN for line. Using fallback.`);
      widestLineLength = Math.max(widestLineLength, line.length * (fontSize * 0.5));
    } else if (lineWidth > widestLineLength) {
      widestLineLength = lineWidth;
    }
  });

  // Ensure valid measurements
  if (isNaN(widestLineLength) || widestLineLength === 0) {
      console.error("Critical Error: widestLineLength is NaN or 0.");
      doc.text("Error: Cannot render masterpiece", 2, 30);
      doc.end();
      return new Promise((resolve) => {
        doc.on('end', () => {
          const pdfBytes = Buffer.concat(chunks);
          const response = new Response(pdfBytes, {
            headers: { 'Content-Type': 'application/pdf' },
          });
          resolve(response);
        });
      });
  }

  const contentWidth = DOCUMENT_WIDTH - doc.page.margins.left - doc.page.margins.right;
  const artXStart = doc.page.margins.left + (contentWidth / 2) - (widestLineLength / 2);

  // Ensure centered positioning
  const validArtXStart = Math.max(doc.page.margins.left, artXStart);

  // Get line height with fallback
  let artLineHeight = doc.currentLineHeight();
  if (isNaN(artLineHeight) || artLineHeight === 0) {
    artLineHeight = fontSize * 1.1; // Tight spacing for Braille characters
  }

  // --- DEBUG LOGGING ---
  console.log('--- ASCII ART OF THE DECADE PRINT DEBUG ---');
  console.log(`DOCUMENT_WIDTH: ${DOCUMENT_WIDTH} (2 inches)`);
  console.log(`Font size: ${fontSize}pt`);
  console.log(`Art lines: ${artLines.length}`);
  console.log(`widestLineLength: ${widestLineLength}`);
  console.log(`artXStart: ${validArtXStart}`);
  console.log(`artLineHeight: ${artLineHeight}`);
  console.log('-------------------------------------------');

  // Render the masterpiece
  const startY = doc.y;
  artLines.forEach((line, index) => {
    if (isNaN(validArtXStart) || isNaN(doc.y)) {
        console.error(`NaN detected: artXStart=${validArtXStart}, doc.y=${doc.y}`);
        doc.text("Error: NaN coordinates", 2, doc.y || 30);
        return;
    }
    
    // Use fixed positioning for precise control
    const yPosition = startY + (index * artLineHeight);
    doc.text(line, validArtXStart, yPosition);
  });

  // Add a footer
  doc.y = startY + (artLines.length * artLineHeight) + 10;
  doc.fontSize(5);
  doc.text('', doc.page.margins.left, doc.y, {
    width: contentWidth,
    align: 'center'
  });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfBytes = Buffer.concat(chunks);
      const filename = 'ascii_art_masterpiece.pdf';
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