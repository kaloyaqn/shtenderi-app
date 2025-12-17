import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

// Helper to load file from /public and base64-encode it
function getBase64FromPublic(relPath) {
  const absPath = path.join(process.cwd(), "public", relPath);
  const file = fs.readFileSync(absPath);
  return file.toString("base64");
}

export async function POST(req) {
  const { searchParams } = new URL(req.url);
  const method = (searchParams.get("method") || "roll").toLowerCase(); // default roll

  const { revision, adminName } = await req.json();
  if (!revision) {
    return new Response("Revision data missing", { status: 400 });
  }

  // Keep roll exactly as you have it
  if (method === "roll") {
    const html = buildHtmlRoll(revision, adminName);
    return await generatePdfViaPuppeteerAutoHeight(html);
  }

  // Separate A4 HTML/CSS so it won't break
  if (method === "a4") {
    const html = buildHtmlA4(revision, adminName);
    return await generatePdfViaPuppeteerA4(html);
  }

  return new Response("Invalid method. Use ?method=roll or ?method=a4", {
    status: 400,
  });
}

/* ===========================
   ROLL: your exact working generator
=========================== */
async function generatePdfViaPuppeteerAutoHeight(html) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // 210mm at 96dpi ≈ 794px. Setting viewport prevents reflow surprises.
  await page.setViewport({ width: 794, height: 1000, deviceScaleFactor: 1 });

  await page.setContent(html, { waitUntil: "networkidle0" });

  // Wait for fonts (important since you embed base64 fonts)
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  });

  // Measure the real rendered height
  const contentHeightPx = await page.evaluate(() => {
    const el = document.documentElement;
    const body = document.body;
    return Math.max(
      el.scrollHeight,
      body.scrollHeight,
      el.offsetHeight,
      body.offsetHeight,
      el.clientHeight
    );
  });

  // Add a little extra for printer cutter spacing (tweak if needed)
  const finalHeightPx = contentHeightPx + 40;

  const pdf = await page.pdf({
    printBackground: true,
    width: "210mm",
    height: `${finalHeightPx}px`,
    margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    pageRanges: "1",
  });

  await browser.close();

  return new Response(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=stock-receipt-roll.pdf",
    },
  });
}

/* ===========================
   A4: separate generator (proper pagination)
=========================== */
async function generatePdfViaPuppeteerA4(html) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Normal viewport for A4-like rendering
  await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 1 });

  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "15mm", right: "12mm", bottom: "15mm", left: "12mm" },
  });

  await browser.close();

  return new Response(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=stock-receipt-a4.pdf",
    },
  });
}

/* ===========================
   ROLL HTML: unchanged (your working CSS)
=========================== */
function buildHtmlRoll(revision, adminName) {
  // ---- Embed fonts & logo as base64 -----------------------------------
  const onestRegularBase64 = getBase64FromPublic("fonts/Onest-Regular.ttf");
  const onestBoldBase64 = getBase64FromPublic("fonts/Onest-Bold.ttf");
  const logoBase64 = getBase64FromPublic("logo/logo.png");

  const css = `
  @font-face {
    font-family: "Onest";
    src: url("data:font/ttf;base64,${onestRegularBase64}") format("truetype");
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: "Onest";
    src: url("data:font/ttf;base64,${onestBoldBase64}") format("truetype");
    font-weight: 700;
    font-style: normal;
  }

  /* Roll print styling */
  html, body {
    margin: 0;
    padding: 0;
  }

  body {
    font-family: "Onest", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    width: 210mm;
    box-sizing: border-box;
    padding: 12mm;
    color: #000;
    font-size: 12px;
    line-height: 1.4;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .header img {
    height: 42px;
    /* Make logo black for thermal/mono printing */
    filter: grayscale(1) brightness(0);
  }

  h1 {
    font-size: 18px;
    font-weight: 700;
    margin: 10px 0 12px 0;
  }

  .section-title {
    font-size: 14px;
    font-weight: 700;
    margin: 16px 0 6px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    gap: 20px;
  }

  .info-block {
    width: 50%;
    font-size: 12px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 11px;
  }

  th {
    font-weight: 700;
    padding: 6px 4px;
    border-bottom: 1px solid #000;
    text-align: left;
  }

  td {
    padding: 6px 4px;
    border-bottom: 1px solid #ccc;
    vertical-align: top;
  }

  /* Avoid breaking rows */
  table, thead, tbody, tr, td, th {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .total td {
    font-weight: 700;
    border-top: 1px solid #000;
    border-bottom: none;
  }

  .signature {
    margin-top: 18px;
    font-size: 12px;
    font-weight: 700;
  }
  `;

  return buildHtmlDocument(revision, adminName, css, logoBase64);
}

/* ===========================
   A4 HTML: separate CSS (fixes broken pagination)
   Key changes vs roll:
   - NO fixed 210mm width
   - Allow table to split across pages
   - Avoid breaking INSIDE a row only
=========================== */
function buildHtmlA4(revision, adminName) {
  const onestRegularBase64 = getBase64FromPublic("fonts/Onest-Regular.ttf");
  const onestBoldBase64 = getBase64FromPublic("fonts/Onest-Bold.ttf");
  const logoBase64 = getBase64FromPublic("logo/logo.png");

  const css = `
  @font-face {
    font-family: "Onest";
    src: url("data:font/ttf;base64,${onestRegularBase64}") format("truetype");
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: "Onest";
    src: url("data:font/ttf;base64,${onestBoldBase64}") format("truetype");
    font-weight: 700;
    font-style: normal;
  }

  @page {
    size: A4;
    margin: 15mm 12mm;
  }

  html, body {
    margin: 0;
    padding: 0;
  }

  body {
    font-family: "Onest", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    color: #000;
    font-size: 13px;
    line-height: 1.45;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .header img {
    height: 46px;
    filter: grayscale(1) brightness(0);
  }

  h1 {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 14px 0;
  }

  .section-title {
    font-size: 14px;
    font-weight: 700;
    margin: 16px 0 8px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    gap: 24px;
  }

  .info-block {
    width: 50%;
    font-size: 13px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 12px;
  }

  thead { display: table-header-group; } /* repeat header on new pages */
  tfoot { display: table-footer-group; }

  th {
    font-weight: 700;
    padding: 8px 6px;
    border-bottom: 1px solid #000;
    text-align: left;
    background: #f5f5f5;
  }

  td {
    padding: 8px 6px;
    border-bottom: 1px solid #ddd;
    vertical-align: top;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  /* IMPORTANT: allow page breaks between rows, but not inside a row */
  tr { break-inside: avoid; page-break-inside: avoid; }

  .total td {
    font-weight: 700;
    border-top: 1px solid #000;
    border-bottom: none;
  }

  .signature {
    margin-top: 18px;
    font-size: 13px;
    font-weight: 700;
  }
  `;

  return buildHtmlDocument(revision, adminName, css, logoBase64);
}

/* ===========================
   Shared HTML markup (same data)
=========================== */
function buildHtmlDocument(revision, adminName, css, logoBase64) {
  const productsHtml = (revision.missingProducts || [])
    .map((mp) => {
      const name = mp.product?.invoiceName || mp.product?.name || "-";
      const ean = mp.product?.barcode || "-";
      const qty = mp.givenQuantity ?? mp.missingQuantity;
      const price = mp.priceAtSale ?? mp.product?.clientPrice ?? 0;
      const total = (qty * price).toFixed(2);

      return `
        <tr>
          <td>${ean}</td>
          <td>${name}</td>
          <td>${qty}</td>
          <td>${Number(price).toFixed(2)}</td>
          <td>${total}</td>
        </tr>
      `;
    })
    .join("");

  const totalQty = (revision.missingProducts || []).reduce(
    (s, mp) => s + (mp.givenQuantity ?? mp.missingQuantity),
    0
  );

  const totalSum = (revision.missingProducts || [])
    .reduce((s, mp) => {
      const qty = mp.givenQuantity ?? mp.missingQuantity;
      const price = mp.priceAtSale ?? mp.product?.clientPrice ?? 0;
      return s + qty * price;
    }, 0)
    .toFixed(2);

  return `
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8" />
  <style>${css}</style>
</head>

<body>
  <div class="header">
    <img src="data:image/png;base64,${logoBase64}" alt="Logo" />
    <div style="text-align:right;">
      <div>Дата: ${new Date(revision.createdAt).toLocaleDateString("bg-BG")} г.</div>
    </div>
  </div>

  <h1>СТОКОВА РАЗПИСКА № ${revision.number}</h1>

  <div class="info-row">
    <div class="info-block">
      <div class="section-title">Доставчик:</div>
      Омакс Сълюшънс ЕООД<br />
      ЕИК: BG200799887<br />
      Адрес: гр. Хасково, ул. Рай №7
    </div>

    <div class="info-block">
      <div class="section-title">Получател:</div>
      Фирма: ${revision.partner?.name || "-"}<br />
      ЕИК: ${revision.partner?.bulstat || "-"}<br />
      Адрес: ${revision.partner?.address || "-"}
    </div>
  </div>

  <div class="section-title">Описание:</div>

  <table>
    <thead>
      <tr>
        <th>EAN</th>
        <th>Име на продукта</th>
        <th>Кол.</th>
        <th>Ед. цена</th>
        <th>Общо</th>
      </tr>
    </thead>
    <tbody>
      ${productsHtml}
      <tr class="total">
        <td>ОБЩО</td>
        <td></td>
        <td>${totalQty}</td>
        <td></td>
        <td>${totalSum}</td>
      </tr>
    </tbody>
  </table>

  <div class="signature">Изготвил: ${revision.user?.name || adminName || ""}</div>
</body>
</html>
`;
}
