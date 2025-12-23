"use strict";

/**
 * Updates product minQty based on a hardcoded mapping of pcode -> minQty.
 * Run with: node scripts/update-min-qty.js
 */

const { prisma } = require("../lib/prisma");

const entries = [
  { pcode: "usbdaipnordicc1wsp03", minQty: 20 },
  { pcode: "usbdatypecnordicc1wsp03", minQty: 25 },
  { pcode: "usbd3in1trkxonb173b", minQty: 10 },
  { pcode: "usbd3in1trkxonb173red", minQty: 10 },
  { pcode: "usbdtypecipnordicc1wsp03", minQty: 20 },
  { pcode: "usbdtypec2totypecnordicc1wsp032m", minQty: 12 },
  { pcode: "usbdaipnordicc1wsp03braided", minQty: 12 },
  { pcode: "usbdtypecnordicc1wsp03braided", minQty: 12 },
  { pcode: "12vtrkxomp3chargerxobcc08b", minQty: 10 },
  { pcode: "holdetrkxoc55bb", minQty: 12 },
  { pcode: "holdertrkxoc41b", minQty: 12 },
  { pcode: "holdertrkxoc86b", minQty: 12 },
  { pcode: "usbdtypec2totypecnordicip60w", minQty: 12 },
  { pcode: "usbdaipnordicc1wsp03braided", minQty: 12 },
  { pcode: "usbdtypecnordicc1wsp03braided", minQty: 12 },
  { pcode: "holdertrkxoc120b", minQty: 8 },
  { pcode: "holdertrkxoc8b", minQty: 12 },
  { pcode: "hftrkxoep70ipw", minQty: 5 },
  { pcode: "hftrkxoep57w", minQty: 9 },
  { pcode: "hftrkxoep57b", minQty: 9 },
  { pcode: "atypecch220vtrkxol127w", minQty: 12 },
  { pcode: "aipch220vtrkxol127w", minQty: 12 },
  { pcode: "amicroch220vtrkxol127w", minQty: 12 },
  { pcode: "hftrkxoep81typecb", minQty: 9 },
  { pcode: "hftrkxoep81typecw", minQty: 9 },
  { pcode: "usbdamicrotrkxonb200b", minQty: 8 },
  { pcode: "usbdamicrotrkxonb200w", minQty: 8 },
  { pcode: "typec2ch12vtrkxocc70b", minQty: 6 },
  { pcode: "adaptertypectoauxtrkxonbr279bw", minQty: 10 },
  { pcode: "auxtrkxonbr279cb", minQty: 12 },
  { pcode: "ch12vtrkxocc69w", minQty: 6 },
  { pcode: "holdertrkxoc176gr", minQty: 4 },
  { pcode: "12vtrkxomp3chargerxobcc18b", minQty: 9 },
  { pcode: "powerbanktrkxopb312b", minQty: 6 },
  { pcode: "powerbanktrkxopb309", minQty: 6 },
  { pcode: "ch220vtrkxol158w", minQty: 25 },
  { pcode: "holdertrkxoc120b", minQty: 8 },
  { pcode: "usbdtypec2totypecnordicip60w", minQty: 12 },
  { pcode: "usbdtypec2totypecnordicip60w", minQty: 12 },
  { pcode: "12vtrkxomp3chargerxobcc08b", minQty: 10 },
  { pcode: "usbdtypec2totypecnordicip60w", minQty: 12 },
];

async function main() {
  let updated = 0;
  let missing = [];
  for (const entry of entries) {
    if (!entry.pcode) continue;
    const res = await prisma.product.updateMany({
      where: { pcode: entry.pcode },
      data: { minQty: entry.minQty },
    });
    if (res.count > 0) {
      updated += res.count;
      console.log(`Updated ${res.count} product(s) for pcode ${entry.pcode} -> minQty ${entry.minQty}`);
    } else {
      missing.push(entry.pcode);
    }
  }
  if (missing.length) {
    console.log(`No product found for pcodes: ${missing.join(", ")}`);
  }
  console.log(`Done. Updated ${updated} product records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
