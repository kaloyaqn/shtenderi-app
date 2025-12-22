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

export async function generateInvoicePdf({ invoice, variant = "original" }) {
  const html = buildInvoiceHtml(invoice, variant);
  return await generatePdfBufferViaPuppeteerA4(html);
}

export async function generateCreditNotePdf({ creditNote, variant = "original" }) {
  const html = buildCreditNoteHtml(creditNote, variant);
  return await generatePdfBufferViaPuppeteerA4(html);
}

export async function sendInvoiceEmail({ invoice, variant = "original", to }) {
  if (!to) throw new Error("Missing recipient email");
  const pdf = await generateInvoicePdf({ invoice, variant });

  const htmlEmail = buildInvoiceEmailHtml(invoice, variant);

  await sendEmailWithAttachment({
    to,
    subject: `Фактура № ${invoice.invoiceNumber}${variant === "copy" ? " (копие)" : ""}`,
    html: htmlEmail,
    attachments: [
      {
        filename: `invoice-${invoice.invoiceNumber || invoice.id}-${variant}.pdf`,
        content: pdf,
        contentType: "application/pdf",
      },
    ],
  });

  return pdf;
}

export async function sendCreditNoteEmail({ creditNote, variant = "original", to }) {
  if (!to) throw new Error("Missing recipient email");
  const pdf = await generateCreditNotePdf({ creditNote, variant });

  const htmlEmail = buildCreditNoteEmailHtml(creditNote, variant);

  await sendEmailWithAttachment({
    to,
    subject: `Кредитно известие № ${creditNote.creditNoteNumber}${variant === "copy" ? " (копие)" : ""}`,
    html: htmlEmail,
    attachments: [
      {
        filename: `credit-note-${creditNote.creditNoteNumber || creditNote.id}-${variant}.pdf`,
        content: pdf,
        contentType: "application/pdf",
      },
    ],
  });

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

function buildInvoiceHtml(invoice, variant = "original") {
  const onestRegularBase64 = getBase64FromPublic("fonts/Onest-Regular.ttf");
  const onestBoldBase64 = getBase64FromPublic("fonts/Onest-Bold.ttf");
  const logoBase64 = getBase64FromPublic("logo/logo.png");

  const issuedAt = new Date(invoice.issuedAt);
  const dueDate = new Date(issuedAt);
  dueDate.setDate(dueDate.getDate() + 20);

  const products = Array.isArray(invoice.products) ? invoice.products : [];
  const totalQuantity = products.reduce((s, p) => s + (p.quantity || 0), 0);

  const rows = products
    .map((p) => {
      const price = Number(p.clientPrice || 0);
      const total = price * (p.quantity || 0);
      return `
        <tr>
          <td style="white-space:nowrap">${p.barcode || "-"}</td>
          <td>${p.name || "-"}</td>
          <td style="text-align:right">${p.quantity || 0}</td>
          <td style="text-align:right">${price.toFixed(2)} лв.</td>
          <td style="text-align:right">${total.toFixed(2)} лв.</td>
        </tr>
      `;
    })
    .join("");

  const css = `
@font-face {
  font-family: "Onest";
  src: url("data:font/ttf;base64,${onestRegularBase64}") format("truetype");
  font-weight: 400;
}
@font-face {
  font-family: "Onest";
  src: url("data:font/ttf;base64,${onestBoldBase64}") format("truetype");
  font-weight: 700;
}

@page { margin: 0; }

html, body {
  margin: 0;
  padding: 0;
}

body {
  font-family: "Onest", system-ui, sans-serif;
  width: 210mm;
  color: #111827;
  font-size: 12px;
}

.inv-root {
    padding:6mm;
}

.inv-header {
  display: flex;
  justify-content: space-between;
  align-items:end;
  margin-bottom: 16px;
}

.inv-logo {
  height: 42px;
}

.inv-title {
  font-size: 20px;
  font-weight: 700;
  margin: 6px 0 0;
}

.inv-meta {
  text-align: right;
  font-size: 13px;
  color: #6b7280;
}

.inv-info {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.inv-card {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
}

.inv-card h3 {
  margin: 0;
  padding: 6px 10px;
  background: #111827;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.inv-card span {
    font-size:10px;
}

.inv-body {
  padding: 8px 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px 6px;
  font-size: 11px;
}

.inv-label {
  color: #6b7280;
  font-weight: 600;
  font-size: 12px;
}

.inv-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  font-size: 10px;
}

.inv-table th {
  background: #f3f4f6;
  border-bottom: 2px solid #111827;
  padding: 4px 2px;
  text-align: left;
  font-weight: 700;
}

.inv-table td {
  padding: 2px 4px;
  border-bottom: 1px solid #e5e7eb;
}

.inv-table tr {
    padding:2px;
}

.inv-total-row td {
  font-weight: 700;
  border-top: 2px solid #111827;
}

.inv-footer {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
  margin-top: 16px;
  padding-bottom:12px;
}

.summary-space {
    display:flex;
    justify-content:space-between;
    flex-direction:column;
}

.inv-summary {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 8px 6px;
  background: #f9fafb;
  font-size: 11px;
}

.inv-summary .row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.inv-summary .total {
  font-weight: 700;
  border-top: 1px solid #e5e7eb;
  padding-top: 8px;
}

.inv-small {
  font-size: 9px;
  color: #6b7280;
  line-height: 1.45;
}

.inv-sign {
  padding-top:12px;
  border-top: 1px solid #e5e7eb;
  font-size: 12px;
  font-weight: 600;
}

.summary-details {
    font-size:10px;
    display: flex;
    flex-direction: column;
    gap:8px;
}

.summary-details strong {
    padding:2px 4px;
    background: #f9fafb;
    border-radius:4px;
    border: 1px solid #e5e7eb;

}

`;

  return `
<!DOCTYPE html>
<html lang="bg">
<head>
<meta charset="UTF-8" />
<style>${css}</style>
</head>
<body>
  <div class="inv-root">

    <div class="inv-header">
      <div>
        <img class="inv-logo" src="data:image/png;base64,${logoBase64}" />
        <h2 class="inv-title">Фактура ${variant === "copy" ? "(Копие)" : "(Оригинал)"}  № ${String(invoice.invoiceNumber).padStart(10,  "0")}</h2>
        <div style="font-size:12px;color:#6b7280">
          Издадена на ${issuedAt.toLocaleDateString("bg-BG")}
        </div>
      </div>
      <div class="inv-meta">
        № ${String(invoice.invoiceNumber).padStart(10, "0")}
        <div>Данъчно събитие: ${issuedAt.toLocaleDateString("bg-BG")}</div>
      </div>
    </div>

    <div class="inv-info">

      <div class="inv-card">
        <h3>Получател</h3>
        <div class="inv-body">
          <span class="inv-label">Име</span><span>${invoice.partnerName || "-"}</span>
          <span class="inv-label">Ид. номер</span><span>${invoice.partnerBulstat || "-"}</span>
          <span class="inv-label">МОЛ</span><span>${invoice.partnerMol || "-"}</span>
          <span class="inv-label">Държава</span><span>${invoice.partnerCountry || "-"}</span>
          <span class="inv-label">Град</span><span>${invoice.partnerCity || "-"}</span>
          <span class="inv-label">Адрес</span><span>${invoice.partnerAddress || "-"}</span>
        </div>
      </div>

      <div class="inv-card">
        <h3>Изпълнител</h3>
        <div class="inv-body">
          <span class="inv-label">Доставчик</span><span>Омакс Сълюшънс ЕООД</span>
          <span class="inv-label">Ид. номер</span><span>200799887</span>
          <span class="inv-label">ДДС номер</span><span>BG200799887</span>
          <span class="inv-label">МОЛ</span><span>Димитър Ангелов</span>
          <span class="inv-label">Банка</span><span>ПРОКРЕДИТ БАНК</span>
          <span class="inv-label">BIC/SWIFT</span><span>PRCBGSF</span>
          <span class="inv-label">IBAN - BGN</span><span>BG27PRCB92301035316119</span>
          <span class="inv-label">IBAN - EUR</span><span>BG10PRCB92301435316101</span>
          <span class="inv-label">Град</span><span>Хасково</span>
          <span class="inv-label">Адрес</span><span>ул. Рай 7</span>
        </div>
      </div>

    </div>

    <table class="inv-table">
      <thead>
        <tr>
          <th>EAN</th>
          <th>Име на продукта</th>
          <th style="text-align:right">Кол.</th>
          <th style="text-align:right">Ед. цена (с ДДС)</th>
          <th style="text-align:right">Общо</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="inv-total-row">
          <td>ОБЩО</td>
          <td></td>
          <td style="text-align:right">${totalQuantity}</td>
          <td></td>
          <td style="text-align:right">${Number(invoice.totalValue).toFixed(2)} лв.</td>
        </tr>
      </tbody>
    </table>

    <div class="inv-footer">
      <div class="summary-space">
        <div class="summary-details">
                <div>Начин на плащане: <strong>${invoice.paymentMethod === "CASH" ? "В брой" : "Банка"}</strong></div>
        <div>Падеж: <strong>${dueDate.toLocaleDateString("bg-BG")}</strong></div>
        </div>
        <div class="inv-small">
          Съгласно чл.7, ал.1 от Закона за счетоводството, чл.114 от ЗДДС и чл.78 от ППЗДДС печатът и подписът не са задължителни реквизити.
        </div>
      </div>

      <div class="inv-summary">
        <div class="row"><span>Данъчна основа</span><span>${Number(invoice.vatBase).toFixed(2)} лв.</span></div>
        <div class="row"><span>ДДС 20%</span><span>${Number(invoice.vatAmount).toFixed(2)} лв.</span></div>
        <div class="row total"><span>Обща стойност</span><span>${Number(invoice.totalValue).toFixed(2)} лв.</span></div>
      </div>
    </div>

    <div class="inv-sign">Изготвил: ${invoice.preparedBy || ""}</div>

  </div>
</body>
</html>
  `;
}

function buildCreditNoteHtml(creditNote, variant = "original") {
  const onestRegularBase64 = getBase64FromPublic("fonts/Onest-Regular.ttf");
  const onestBoldBase64 = getBase64FromPublic("fonts/Onest-Bold.ttf");
  const logoBase64 = getBase64FromPublic("logo/logo.png");

  const issuedAt = new Date(creditNote.issuedAt);
  const products = Array.isArray(creditNote.products) ? creditNote.products : [];
  const totalQuantity = products.reduce((s, p) => s + (p.quantity || 0), 0);

  const rows = products
    .map((p) => {
      const price = Number(p.clientPrice || 0);
      const total = price * (p.quantity || 0);
      return `
        <tr>
          <td style="white-space:nowrap">${p.barcode || "-"}</td>
          <td>${p.name || "-"}</td>
          <td style="text-align:right">${p.quantity || 0}</td>
          <td style="text-align:right">${price.toFixed(2)} лв.</td>
          <td style="text-align:right">${total.toFixed(2)} лв.</td>
        </tr>
      `;
    })
    .join("");

  const css = `
@font-face {
  font-family: "Onest";
  src: url("data:font/ttf;base64,${onestRegularBase64}") format("truetype");
  font-weight: 400;
}
@font-face {
  font-family: "Onest";
  src: url("data:font/ttf;base64,${onestBoldBase64}") format("truetype");
  font-weight: 700;
}

@page { margin: 0; }

html, body {
  margin: 0;
  padding: 0;
}

body {
  font-family: "Onest", system-ui, sans-serif;
  width: 210mm;
  color: #111827;
  font-size: 12px;
}

.inv-root { padding:6mm; }
.inv-header { display:flex; justify-content:space-between; align-items:end; margin-bottom:16px; }
.inv-logo { height:42px; }
.inv-title { font-size:20px; font-weight:700; margin:6px 0 0; }
.inv-meta { text-align:right; font-size:13px; color:#6b7280; }
.inv-info { display:flex; gap:8px; margin-top:16px; }
.inv-card { flex:1; border:1px solid #e5e7eb; border-radius:10px; background:#f9fafb; }
.inv-card h3 { margin:0; padding:6px 10px; background:#111827; color:#fff; font-size:12px; font-weight:700; }
.inv-card span { font-size:10px; }
.inv-body { padding:8px 8px; display:grid; grid-template-columns:1fr 1fr; gap:2px 6px; font-size:11px; }
.inv-label { color:#6b7280; font-weight:600; font-size:12px; }
.inv-table { width:100%; border-collapse:collapse; margin-top:12px; font-size:10px; }
.inv-table th { background:#f3f4f6; border-bottom:2px solid #111827; padding:4px 2px; text-align:left; font-weight:700; }
.inv-table td { padding:2px 4px; border-bottom:1px solid #e5e7eb; }
.inv-table tr { padding:2px; }
.inv-total-row td { font-weight:700; border-top:2px solid #111827; }
.inv-footer { display:grid; grid-template-columns:1.2fr 1fr; gap:16px; margin-top:16px; padding-bottom:12px; }
.summary-space { display:flex; justify-content:space-between; flex-direction:column; }
.inv-summary { border:1px solid #e5e7eb; border-radius:10px; padding:8px 6px; background:#f9fafb; font-size:11px; }
.inv-summary .row { display:flex; justify-content:space-between; margin-bottom:6px; }
.inv-summary .total { font-weight:700; border-top:1px solid #e5e7eb; padding-top:8px; }
.inv-small { font-size:9px; color:#6b7280; line-height:1.45; }
.inv-sign { padding-top:12px; border-top:1px solid #e5e7eb; font-size:12px; font-weight:600; }
`;

  return `
<!DOCTYPE html>
<html lang="bg">
<head>
<meta charset="UTF-8" />
<style>${css}</style>
</head>
<body>
  <div class="inv-root">
    <div class="inv-header">
      <div>
        <img class="inv-logo" src="data:image/png;base64,${logoBase64}" />
        <h2 class="inv-title">Кредитно известие (${variant === "copy" ? "Копие" : "Оригинал"}) № ${String(creditNote.creditNoteNumber).padStart(10, "0")}</h2>
        <div style="font-size:12px;color:#6b7280">Издадено на ${issuedAt.toLocaleDateString("bg-BG")}</div>
      </div>
      <div class="inv-meta">
        № ${String(creditNote.creditNoteNumber).padStart(10, "0")}
        <div>Данъчно събитие: ${issuedAt.toLocaleDateString("bg-BG")}</div>
      </div>
    </div>

    <div class="inv-info">
      <div class="inv-card">
        <h3>Получател</h3>
        <div class="inv-body">
          <span class="inv-label">Име</span><span>${creditNote.partnerName || "-"}</span>
          <span class="inv-label">Ид. номер</span><span>${creditNote.partnerBulstat || "-"}</span>
          <span class="inv-label">МОЛ</span><span>${creditNote.partnerMol || "-"}</span>
          <span class="inv-label">Държава</span><span>${creditNote.partnerCountry || "-"}</span>
          <span class="inv-label">Град</span><span>${creditNote.partnerCity || "-"}</span>
          <span class="inv-label">Адрес</span><span>${creditNote.partnerAddress || "-"}</span>
        </div>
      </div>

      <div class="inv-card">
        <h3>Изпълнител</h3>
        <div class="inv-body">
          <span class="inv-label">Доставчик</span><span>Омакс Сълюшънс ЕООД</span>
          <span class="inv-label">Ид. номер</span><span>200799887</span>
          <span class="inv-label">ДДС номер</span><span>BG200799887</span>
          <span class="inv-label">МОЛ</span><span>Димитър Ангелов</span>
          <span class="inv-label">Банка</span><span>ПРОКРЕДИТ БАНК</span>
          <span class="inv-label">BIC/SWIFT</span><span>PRCBGSF</span>
          <span class="inv-label">IBAN - BGN</span><span>BG27PRCB92301035316119</span>
          <span class="inv-label">IBAN - EUR</span><span>BG10PRCB92301435316101</span>
          <span class="inv-label">Град</span><span>Хасково</span>
          <span class="inv-label">Адрес</span><span>ул. Рай 7</span>
        </div>
      </div>
    </div>

    <table class="inv-table">
      <thead>
        <tr>
          <th>EAN</th>
          <th>Име на продукта</th>
          <th style="text-align:right">Кол.</th>
          <th style="text-align:right">Ед. цена (с ДДС)</th>
          <th style="text-align:right">Общо</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="inv-total-row">
          <td>ОБЩО</td>
          <td></td>
          <td style="text-align:right">${totalQuantity}</td>
          <td></td>
          <td style="text-align:right">${Number(creditNote.totalValue).toFixed(2)} лв.</td>
        </tr>
      </tbody>
    </table>

    <div class="inv-footer">
      <div class="summary-space">
        <div class="inv-small">Документът отразява корекция по фактура.</div>
      </div>

      <div class="inv-summary">
        <div class="row"><span>Данъчна основа</span><span>${Number(creditNote.vatBase).toFixed(2)} лв.</span></div>
        <div class="row"><span>ДДС 20%</span><span>${Number(creditNote.vatAmount).toFixed(2)} лв.</span></div>
        <div class="row total"><span>Обща стойност</span><span>${Number(creditNote.totalValue).toFixed(2)} лв.</span></div>
      </div>
    </div>

    <div class="inv-sign">Изготвил: ${creditNote.preparedBy || ""}</div>
  </div>
</body>
</html>
`;
}

function buildInvoiceEmailHtml(invoice, variant = "original") {
  const products = Array.isArray(invoice.products) ? invoice.products : [];
  const rows = products
    .slice(0, 100)
    .map((p) => {
      const price = Number(p.clientPrice || 0);
      const qty = p.quantity || 0;
      const total = price * qty;
      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-size:12px;">${p.barcode || "-"}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-size:12px;">${p.name || "-"}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;">${qty}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;">${price.toFixed(2)} лв.</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;">${total.toFixed(2)} лв.</td>
        </tr>
      `;
    })
    .join("");

  const totalQty = products.reduce((s, p) => s + (p.quantity || 0), 0);
  const totalValue = Number(invoice.totalValue || 0).toFixed(2);

  return `
  <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;color:#111827;background:#f3f4f6;padding:16px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="780" style="max-width:780px;width:100%;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:10px;">
      <tr>
        <td style="padding:16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:12px;">
            <tr>
              <td align="left" style="vertical-align:middle;">
                <img src="https://stendo.bg/logo/logo.png" alt="Stendo" style="height:32px;display:block;" />
              </td>
              <td align="right" style="vertical-align:middle;color:#6b7280;font-size:12px;">
                № ${String(invoice.invoiceNumber || "").padStart(10, "0")} ${variant === "copy" ? "(копие)" : "(оригинал)"}<br/>
                Дата: ${new Date(invoice.issuedAt).toLocaleDateString("bg-BG")}
              </td>
            </tr>
          </table>

          <h2 style="margin:0 0 10px 0;font-size:18px;">Фактура</h2>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:12px;">
            <tr>
              <td width="50%" style="padding-right:8px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;">
                  <tr><td style="padding:10px;font-weight:700;">Доставчик</td></tr>
                  <tr><td style="padding:0 10px 10px 10px;font-size:12px;line-height:1.5;">
                    Омакс Сълюшънс ЕООД<br/>
                    ЕИК: BG200799887<br/>
                    МОЛ: Димитър Ангелов<br/>
                    Град: Хасково<br/>
                    Адрес: ул. Рай 7
                  </td></tr>
                </table>
              </td>
              <td width="50%" style="padding-left:8px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;">
                  <tr><td style="padding:10px;font-weight:700;">Получател</td></tr>
                  <tr><td style="padding:0 10px 10px 10px;font-size:12px;line-height:1.5;">
                    ${invoice.partnerName || "-"}<br/>
                    ЕИК: ${invoice.partnerBulstat || "-"}<br/>
                    МОЛ: ${invoice.partnerMol || "-"}<br/>
                    Град: ${invoice.partnerCity || "-"}<br/>
                    Адрес: ${invoice.partnerAddress || "-"}
                  </td></tr>
                </table>
              </td>
            </tr>
          </table>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;font-size:13px;">
            <thead>
              <tr>
                <th style="text-align:left;padding:8px;border-bottom:2px solid #111827;">EAN</th>
                <th style="text-align:left;padding:8px;border-bottom:2px solid #111827;">Продукт</th>
                <th style="text-align:right;padding:8px;border-bottom:2px solid #111827;">Кол.</th>
                <th style="text-align:right;padding:8px;border-bottom:2px solid #111827;">Ед. цена</th>
                <th style="text-align:right;padding:8px;border-bottom:2px solid #111827;">Общо</th>
              </tr>
            </thead>
            <tbody>
              ${rows || `<tr><td colspan="5" style="padding:10px;color:#6b7280;">Няма редове</td></tr>`}
              <tr>
                <td colspan="2" style="padding:10px;border-top:2px solid #111827;"><strong>ОБЩО</strong></td>
                <td style="padding:10px;border-top:2px solid #111827;text-align:right;"><strong>${totalQty}</strong></td>
                <td style="padding:10px;border-top:2px solid #111827;"></td>
                <td style="padding:10px;border-top:2px solid #111827;text-align:right;"><strong>${totalValue} лв.</strong></td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top:12px;font-size:11px;color:#6b7280;">
            PDF файлът е прикачен към този имейл.
          </div>
          <div style="margin-top:6px;font-size:12px;color:#111827;">
            Ако имате въпроси или нужда от съдействие, отговорете на този имейл.
          </div>
        </td>
      </tr>
    </table>
  </div>
  `;
}

function buildCreditNoteEmailHtml(creditNote, variant = "original") {
  const products = Array.isArray(creditNote.products) ? creditNote.products : [];
  const rows = products
    .slice(0, 100)
    .map((p) => {
      const price = Number(p.clientPrice || 0);
      const qty = p.quantity || 0;
      const total = price * qty;
      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-size:12px;">${p.barcode || "-"}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-size:12px;">${p.name || "-"}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;">${qty}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;">${price.toFixed(2)} лв.</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:12px;">${total.toFixed(2)} лв.</td>
        </tr>
      `;
    })
    .join("");

  const totalQty = products.reduce((s, p) => s + (p.quantity || 0), 0);
  const totalValue = Number(creditNote.totalValue || 0).toFixed(2);

  return `
  <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;color:#111827;background:#f3f4f6;padding:16px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="820" style="max-width:820px;width:100%;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:10px;">
      <tr>
        <td style="padding:16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:12px;">
            <tr>
              <td align="left" style="vertical-align:middle;">
                <img src="https://stendo.bg/logo/logo.png" alt="Stendo" style="height:32px;display:block;" />
              </td>
              <td align="right" style="vertical-align:middle;color:#6b7280;font-size:12px;">
               
                Дата: ${new Date(creditNote.issuedAt).toLocaleDateString("bg-BG")}
              </td>
            </tr>
          </table>

          <h2 style="margin:0 0 10px 0;font-size:18px;">Кредитно известие  № ${String(creditNote.creditNoteNumber || "").padStart(10, "0")} ${variant === "copy" ? "(копие)" : "(оригинал)"}<br/></h2>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:12px;">
            <tr>
              <td width="50%" style="padding-right:8px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;">
                  <tr><td style="padding:10px;font-weight:700;">Доставчик</td></tr>
                  <tr><td style="padding:0 10px 10px 10px;font-size:12px;line-height:1.5;">
                    Омакс Сълюшънс ЕООД<br/>
                    ЕИК: BG200799887<br/>
                    МОЛ: Димитър Ангелов<br/>
                    Град: Хасково<br/>
                    Адрес: ул. Рай 7
                  </td></tr>
                </table>
              </td>
              <td width="50%" style="padding-left:8px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;">
                  <tr><td style="padding:10px;font-weight:700;">Получател</td></tr>
                  <tr><td style="padding:0 10px 10px 10px;font-size:12px;line-height:1.5;">
                    ${creditNote.partnerName || "-"}<br/>
                    ЕИК: ${creditNote.partnerBulstat || "-"}<br/>
                    МОЛ: ${creditNote.partnerMol || "-"}<br/>
                    Град: ${creditNote.partnerCity || "-"}<br/>
                    Адрес: ${creditNote.partnerAddress || "-"}
                  </td></tr>
                </table>
              </td>
            </tr>
          </table>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;font-size:13px;">
            <thead>
              <tr>
                <th style="text-align:left;padding:8px;border-bottom:2px solid #111827;">EAN</th>
                <th style="text-align:left;padding:8px;border-bottom:2px solid #111827;">Продукт</th>
                <th style="text-align:right;padding:8px;border-bottom:2px solid #111827;">Кол.</th>
                <th style="text-align:right;padding:8px;border-bottom:2px solid #111827;">Ед. цена</th>
                <th style="text-align:right;padding:8px;border-bottom:2px solid #111827;">Общо</th>
              </tr>
            </thead>
            <tbody>
              ${rows || `<tr><td colspan="5" style="padding:10px;color:#6b7280;">Няма редове</td></tr>`}
              <tr>
                <td colspan="2" style="padding:10px;border-top:2px solid #111827;"><strong>ОБЩО</strong></td>
                <td style="padding:10px;border-top:2px solid #111827;text-align:right;"><strong>${totalQty}</strong></td>
                <td style="padding:10px;border-top:2px solid #111827;"></td>
                <td style="padding:10px;border-top:2px solid #111827;text-align:right;"><strong>${totalValue} лв.</strong></td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top:12px;font-size:12px;color:#111827;">Кредитното известие е прикачено като PDF.</div>
          <div style="margin-top:6px;font-size:12px;color:#111827;">Ако имате въпроси или нужда от съдействие, отговорете на този имейл.</div>
        </td>
      </tr>
    </table>
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
    font-family: "Onest", system-ui, sans-serif;
    width: 210mm;
    color: #111827;
    font-size: 12px;
    line-height: 1.4;
    padding: 6mm;
  }

  .inv-root { padding: 0; }

  .inv-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 16px;
  }

  .inv-logo { height: 42px; }

  .inv-title {
    font-size: 20px;
    font-weight: 700;
    margin: 6px 0 0;
  }

  .inv-meta {
    text-align: right;
    font-size: 13px;
    color: #6b7280;
  }

  .inv-info {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }

  .inv-card {
    flex: 1;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #f9fafb;
  }

  .inv-card h3 {
    margin: 0;
    padding: 6px 10px;
    background: #111827;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
  }

  .inv-card span { font-size: 10px; }

  .inv-body {
    padding: 8px 8px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px 6px;
    font-size: 11px;
  }

  .inv-label {
    color: #6b7280;
    font-weight: 600;
    font-size: 12px;
  }

  .inv-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
    font-size: 10px;
  }

  .inv-table th {
    background: #f3f4f6;
    border-bottom: 2px solid #111827;
    padding: 4px 2px;
    text-align: left;
    font-weight: 700;
  }

  .inv-table td {
    padding: 2px 4px;
    border-bottom: 1px solid #e5e7eb;
  }

  .inv-table tr { padding: 2px; }

  .inv-total-row td {
    font-weight: 700;
    border-top: 2px solid #111827;
  }

  .inv-sign {
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
    font-size: 12px;
    font-weight: 600;
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

  @page { margin: 0; }

  html, body { margin: 0; padding: 0; }

  body {
    font-family: "Onest", system-ui, sans-serif;
    width: 210mm;
    color: #111827;
    font-size: 12px;
    line-height: 1.4;
    padding: 6mm;
  }

  .inv-root { padding: 0; }

  .inv-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 16px;
  }

  .inv-logo { height: 42px; }

  .inv-title {
    font-size: 20px;
    font-weight: 700;
    margin: 6px 0 0;
  }

  .inv-meta {
    text-align: right;
    font-size: 13px;
    color: #6b7280;
  }

  .inv-info {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }

  .inv-card {
    flex: 1;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #f9fafb;
  }

  .inv-card h3 {
    margin: 0;
    padding: 6px 10px;
    background: #111827;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
  }

  .inv-card span { font-size: 10px; }

  .inv-body {
    padding: 8px 8px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px 6px;
    font-size: 11px;
  }

  .inv-label {
    color: #6b7280;
    font-weight: 600;
    font-size: 12px;
  }

  .inv-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
    font-size: 10px;
  }

  .inv-table th {
    background: #f3f4f6;
    border-bottom: 2px solid #111827;
    padding: 4px 2px;
    text-align: left;
    font-weight: 700;
  }

  .inv-table td {
    padding: 2px 4px;
    border-bottom: 1px solid #e5e7eb;
  }

  .inv-table tr { padding: 2px; }

  .inv-total-row td {
    font-weight: 700;
    border-top: 2px solid #111827;
  }

  .inv-sign {
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
    font-size: 12px;
    font-weight: 600;
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
          <td style="white-space:nowrap">${ean}</td>
          <td>${name}</td>
          <td style="text-align:right">${qty}</td>
          <td style="text-align:right">${Number(price).toFixed(2)} лв.</td>
          <td style="text-align:right">${total} лв.</td>
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
  <div class="inv-root">
    <div class="inv-header">
      <div>
        <img class="inv-logo" src="data:image/png;base64,${logoBase64}" />
        <h2 class="inv-title">Стокова разписка № ${revision.number}</h2>
        <div style="font-size:12px;color:#6b7280">
          Дата: ${new Date(revision.createdAt).toLocaleDateString("bg-BG")}
        </div>
      </div>
      <div class="inv-meta">
        № ${String(revision.number).padStart(10, "0")}
        <div>Издадено: ${new Date(revision.createdAt).toLocaleDateString("bg-BG")}</div>
      </div>
    </div>

    <div class="inv-info">
      <div class="inv-card">
        <h3>Доставчик</h3>
        <div class="inv-body">
          <span class="inv-label">Име</span><span>Омакс Сълюшънс ЕООД</span>
          <span class="inv-label">ЕИК</span><span>BG200799887</span>
          <span class="inv-label">Град</span><span>Хасково</span>
          <span class="inv-label">Адрес</span><span>ул. Рай 7</span>
        </div>
      </div>

      <div class="inv-card">
        <h3>Получател</h3>
        <div class="inv-body">
          <span class="inv-label">Име</span><span>${revision.partner?.name || "-"}</span>
          <span class="inv-label">ЕИК</span><span>${revision.partner?.bulstat || "-"}</span>
          <span class="inv-label">Град</span><span>${revision.partner?.city || revision.partner?.city || "-"}</span>
          <span class="inv-label">Адрес</span><span>${revision.partner?.address || "-"}</span>
        </div>
      </div>
    </div>

    <table class="inv-table">
      <thead>
        <tr>
          <th>EAN</th>
          <th>Име на продукта</th>
          <th style="text-align:right">Кол.</th>
          <th style="text-align:right">Ед. цена (с ДДС)</th>
          <th style="text-align:right">Общо</th>
        </tr>
      </thead>
      <tbody>
        ${productsHtml}
        <tr class="inv-total-row">
          <td>ОБЩО</td>
          <td></td>
          <td style="text-align:right">${totalQty}</td>
          <td></td>
          <td style="text-align:right">${totalSum} лв.</td>
        </tr>
      </tbody>
    </table>

    <div class="inv-sign">Изготвил: ${revision.user?.name || adminName || ""}</div>
  </div>
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
