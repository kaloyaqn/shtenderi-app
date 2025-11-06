"use client";

import BarcodeVisualization from "@/components/ui/BarcodeVisualization";

export default function DeliveryPrintTable({ delivery }) {
  if (!delivery) return null;
  const rows = Array.isArray(delivery.products) ? delivery.products : [];
  const totalDeliveryValue = rows.reduce((s, p) => s + Number(p.quantity || 0) * Number(p.unitPrice || 0), 0);
  const totalQty = rows.reduce((s, p) => s + Number(p.quantity || 0), 0);

  return (
    <table className="w-full border-collapse border border-gray-400 text-sm">
      <thead>
        <tr className="bg-gray-100">
          <th className="border border-gray-400 p-2 text-left">Продукт</th>
          <th className="border border-gray-400 p-2 text-center">Бройки</th>
          <th className="border border-gray-400 p-2 text-right">Дост. цена</th>
          <th className="border border-gray-400 p-2 text-right">Клиентска цена</th>
          <th className="border border-gray-400 p-2 text-right">Стойност</th>
          <th className="border border-gray-400 p-2 text-left">Код/EAN</th>

        </tr>
      </thead>
      <tbody>
        {rows.map((item, idx) => {
          const barcode = item.product?.barcode || item.barcode || item.product?.pcode || "-";
          return (
            <tr key={idx}>

              <td className="border border-gray-400 p-2">{item.product?.name || item.name || '-'}</td>
              <td className="border border-gray-400 p-2 text-center">{Number(item.quantity || 0)}</td>
              <td className="border border-gray-400 p-2 text-right">{Number(item.unitPrice || 0).toFixed(2)} лв.</td>
              <td className="border border-gray-400 p-2 text-right">{Number(item.clientPrice || 0).toFixed(2)} лв.</td>
              <td className="border border-gray-400 p-2 text-right">{(Number(item.quantity || 0) * Number(item.unitPrice || 0)).toFixed(2)} лв.</td>
              <td className="border border-gray-400 p-2 align-top">
                <div className="flex flex-col gap-1">
                  {/* <span className="text-xs">{barcode}</span> */}
                  {barcode && barcode !== '-' && (
                    <div className="pt-1">
                      <BarcodeVisualization barcode={String(barcode)} height={24} width={120} />
                    </div>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr className="bg-gray-100 font-bold">
          <td className="border border-gray-400 p-2" colSpan="2">ОБЩО:</td>
          <td className="border border-gray-400 p-2 text-center">{totalQty}</td>
          <td className="border border-gray-400 p-2"></td>
          <td className="border border-gray-400 p-2"></td>
          <td className="border border-gray-400 p-2 text-right">{totalDeliveryValue.toFixed(2)} лв.</td>
        </tr>
      </tfoot>
    </table>
  );
}


