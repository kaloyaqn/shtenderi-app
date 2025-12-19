"use server";

import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import nodemailer from "nodemailer";

const VAT_RATE = 0.2;

// ---------- Public API ----------
export async function generateSalePdf({ revision, adminName, method = "roll" }) {
  const html =
    method === "a4"
      ? buildHtmlA4(revision, adminName)
      : buildHtmlRoll(revision, adminName);

  const pdf =
    method === "a4"
      ? await generatePdfBufferViaPuppeteerA4(html)
      : await generatePdfBufferViaPuppeteerAutoHeight(html);

  return pdf;
}

export async function sendSaleEmail({ revision, adminName, method = "a4", to }) {
  if (!to) throw new Error("Missing recipient email");

  const pdf = await generateSalePdf({ revision, adminName, method });
  const html = buildEmailHtml(revision, adminName);

  await sendEmailWithAttachment({
    to,
    subject: `Стокова разписка № ${revision.number}`,
    html,
    attachments: [
      {
        filename: `stock-${revision.number}.pdf`,
        content: pdf,
        contentType: "application/pdf",
      },
    ],
  });

  return pdf;
}

// ---------- Helpers ----------
function getBase64FromPublic(relPath) {
  const absPath = path.join(process.cwd(), "public", relPath);
  const file = fs.readFileSync(absPath);
  return file.toString("base64");
}

function buildEmailHtml(revision, adminName) {
  const rows = (revision.missingProducts || [])
    .slice(0, 50)
    .map((mp) => {
      const name = mp.product?.invoiceName || mp.product?.name || "-";
      const ean = mp.product?.barcode || "-";
      const qty = mp.givenQuantity ?? mp.missingQuantity;
      const price = mp.priceAtSale ?? mp.product?.clientPrice ?? 0;
      const total = (qty * price).toFixed(2);

      return `
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;white-space:nowrap;font-size:12px;">${ean}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${name}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;white-space:nowrap;">${qty}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;white-space:nowrap;">${Number(
            price
          ).toFixed(2)} лв.</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;white-space:nowrap;">${total} лв.</td>
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
  <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;color:#111827;">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;">
      <img src="https://stendo.bg/logo/logo.png" alt="Stendo" style="height:34px;display:block;" />
      <div style="text-align:right;color:#6b7280;font-size:12px;">
        ${new Date(revision.createdAt).toLocaleDateString("bg-BG")} г.
      </div>
    </div>
    <h2 style="margin:0 0 8px 0;">Стокова разписка № ${revision.number}</h2>
    <div style="margin-bottom:16px;font-size:14px;">
      <div><strong>Получател:</strong> ${revision.partner?.name || "-"}</div>
      <div><strong>Изготвил:</strong> ${revision.user?.name || adminName || "-"}</div>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr>
          <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #111827;">EAN</th>
          <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #111827;">Продукт</th>
          <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #111827;">Кол.</th>
          <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #111827;">Ед. цена</th>
          <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #111827;">Общо</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="5" style="padding:10px 8px;color:#6b7280;">Няма редове</td></tr>`}
        <tr>
          <td colspan="2" style="padding:10px 8px;border-top:2px solid #111827;"><strong>ОБЩО</strong></td>
          <td style="padding:10px 8px;border-top:2px solid #111827;text-align:right;"><strong>${totalQty}</strong></td>
          <td style="padding:10px 8px;border-top:2px solid #111827;"></td>
          <td style="padding:10px 8px;border-top:2px solid #111827;text-align:right;"><strong>${totalSum} лв.</strong></td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top:14px;color:#6b7280;font-size:12px;">
      PDF файлът е прикачен към този имейл.
    </div>
  </div>
  `;
}

function buildHtmlRoll(revision, adminName) {
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

  th:first-child,
  td:first-child {
    white-space: nowrap;
    font-size: 10px;
  }

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

  thead { display: table-header-group; }
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

  th:first-child,
  td:first-child {
    white-space: nowrap;
    font-size: 11px;
    word-break: normal;
    overflow-wrap: normal;
  }

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

function getMailerConfig() {
  const host = process.env.SMTP_HOST || "smtp.fastmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure =
    typeof process.env.SMTP_SECURE !== "undefined"
      ? process.env.SMTP_SECURE === "true"
      : port === 465;

  const user = process.env.SMTP_USER || process.env.FASTMAIL_USER;
  const pass =
    process.env.SMTP_PASS ||
    process.env.FASTMAIL_PASS ||
    process.env.FASTMAIL_API_TOKEN ||
    process.env.FASTMAIL_TOKEN;
  const from =
    process.env.SMTP_FROM ||
    process.env.FASTMAIL_FROM ||
    "invoices@stendo.bg";

  if (!user || !pass) {
    throw new Error(
      "Missing SMTP credentials: set SMTP_USER/SMTP_PASS (or FASTMAIL_USER/FASTMAIL_PASS)."
    );
  }

  return { host, port, secure, auth: { user, pass }, from };
}

async function sendEmailWithAttachment({ to, subject, html, attachments }) {
  const { host, port, secure, auth, from } = getMailerConfig();

  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth,
  });

  await transport.sendMail({
    from,
    to,
    subject,
    html,
    text: `Стокова разписка № ${subject?.match(/\d+/)?.[0] || ""} (виж прикачения PDF).`,
    attachments,
  });
}

async function generatePdfBufferViaPuppeteerAutoHeight(html) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1000, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  });

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

  const finalHeightPx = contentHeightPx + 40;

  const pdf = await page.pdf({
    printBackground: true,
    width: "210mm",
    height: `${finalHeightPx}px`,
    margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    pageRanges: "1",
  });

  await browser.close();
  return pdf;
}

async function generatePdfBufferViaPuppeteerA4(html) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
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
  return pdf;
}
