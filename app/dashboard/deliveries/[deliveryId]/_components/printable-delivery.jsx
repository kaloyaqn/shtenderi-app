"use client";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { PrinterIcon } from "lucide-react";

export default function PrintableDelivery({ delivery }) {
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Доставка-${delivery?.number || 'N/A'}`,
  });

  if (!delivery) return null;

  const totalDeliveryValue = delivery.products?.reduce(
    (sum, p) => sum + (p.quantity * p.unitPrice), 
    0
  ) || 0;

  return (
    <>
      <Button variant="outline" onClick={handlePrint}>
        <PrinterIcon className="w-4 h-4 mr-2" />
        Печат
      </Button>

      <div className="hidden">
        <div ref={printRef} className="p-8 bg-white text-black">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">ДОСТАВКА</h1>
            <p className="text-lg">№ {delivery.number}</p>
          </div>

          {/* Delivery Info */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Доставчик:</strong> {delivery.supplier?.name || '-'}</p>
                <p><strong>Склад:</strong> {delivery.storage?.name || '-'}</p>
              </div>
              <div>
                <p><strong>Дата на създаване:</strong> {new Date(delivery.createdAt).toLocaleDateString('bg-BG')}</p>
                <p><strong>Дата на приемане:</strong> {delivery.acceptedAt ? new Date(delivery.acceptedAt).toLocaleDateString('bg-BG') : '-'}</p>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="mb-6">
            <table className="w-full border-collapse border border-gray-400 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 text-left">Код/EAN</th>
                  <th className="border border-gray-400 p-2 text-left">Продукт</th>
                  <th className="border border-gray-400 p-2 text-center">Бройки</th>
                  <th className="border border-gray-400 p-2 text-right">Дост. цена</th>
                  <th className="border border-gray-400 p-2 text-right">Клиентска цена</th>
                  <th className="border border-gray-400 p-2 text-right">Стойност</th>
                </tr>
              </thead>
              <tbody>
                {delivery.products?.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-400 p-2">{item.product?.barcode || item.product?.pcode || '-'}</td>
                    <td className="border border-gray-400 p-2">{item.product?.name || '-'}</td>
                    <td className="border border-gray-400 p-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-400 p-2 text-right">{item.unitPrice.toFixed(2)} лв.</td>
                    <td className="border border-gray-400 p-2 text-right">{item.clientPrice?.toFixed(2) || '0.00'} лв.</td>
                    <td className="border border-gray-400 p-2 text-right">{(item.quantity * item.unitPrice).toFixed(2)} лв.</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td className="border border-gray-400 p-2" colSpan="2">ОБЩО:</td>
                  <td className="border border-gray-400 p-2 text-center">
                    {delivery.products?.reduce((sum, p) => sum + p.quantity, 0) || 0}
                  </td>
                  <td className="border border-gray-400 p-2"></td>
                  <td className="border border-gray-400 p-2"></td>
                  <td className="border border-gray-400 p-2 text-right">
                    {totalDeliveryValue.toFixed(2)} лв.
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Summary */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Обща стойност на доставката:</strong> {totalDeliveryValue.toFixed(2)} лв.</p>
              </div>
              <div>
                <p><strong>Приел:</strong> {delivery.acceptedBy?.name || '-'}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-600 mt-8">
            <p>Документът е генериран автоматично на {new Date().toLocaleString('bg-BG')}</p>
          </div>
        </div>
      </div>
    </>
  );
}
