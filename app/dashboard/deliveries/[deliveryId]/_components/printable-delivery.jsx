"use client";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { PrinterIcon } from "lucide-react";
import DeliveryPrintTable from "@/components/print/DeliveryPrintTable";

export default function PrintableDelivery({ delivery }) {
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
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
            <h1 className="text-2xl font-bold mb-2">Доставка № {delivery.number}</h1>
            <p className="text-lg"></p>
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
            <DeliveryPrintTable delivery={delivery} />
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
