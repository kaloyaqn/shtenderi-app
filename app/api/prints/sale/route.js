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
  const { revision, adminName } = await req.json();

  if (!revision) {
    return new Response("Revision data missing", { status: 400 });
  }

  const html = buildHtml(revision, adminName);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
  });

  await browser.close();

  return new Response(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=stock-receipt.pdf",
    },
  });
}

function buildHtml(revision, adminName) {
  // ---- Embed fonts & logo as base64 -----------------------------------
  const onestRegularBase64 = getBase64FromPublic("fonts/Onest-Regular.ttf");
  const onestBoldBase64 = getBase64FromPublic("fonts/Onest-Bold.ttf");
  const logoBase64 = getBase64FromPublic("/logo/logo.png"); // put logo.png in /public

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

  body {
    font-family: "Onest", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    padding: 32px;
    color: #222;
    font-size: 13px;
    line-height: 1.45;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .header img {
    height: 50px;
  }

  h1 {
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 20px 0;
  }

  .section-title {
    font-size: 15px;
    font-weight: 700;
    margin: 24px 0 10px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    gap: 40px;
  }

  .info-block {
    width: 50%;
    font-size: 13px;
  }

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin-top: 12px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #e5e5e5;
    font-size: 13px;
  }

  th {
    background: #f6f6f6;
    font-weight: 700;
    padding: 10px;
    border-bottom: 1px solid #ddd;
    text-align: left;
  }

  td {
    padding: 10px;
    border-bottom: 1px solid #eee;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .total {
    background: #fafafa;
    font-weight: 700;
  }

  .signature {
    margin-top: 40px;
    font-size: 14px;
    font-weight: 700;
  }
  `;

  // ---- Build products rows --------------------------------------------
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
          <td>${price.toFixed(2)}</td>
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

  // ---- Final HTML ------------------------------------------------------
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

  <h1>СТОКОВА РАЗПИСКА <strong>№ ${revision.number}</strong></h1>

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
        <td>Общо:</td>
        <td></td>
        <td>${totalQty}</td>
        <td></td>
        <td>${totalSum}</td>
      </tr>
    </tbody>
  </table>

  <div class="signature">Изготвил: ${revision.user?.name}</div>

</body>
</html>
`;
}
