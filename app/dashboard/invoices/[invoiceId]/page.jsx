"use client";
import { useReactToPrint } from "react-to-print";
import { useRef, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function InvoicePage() {
  const originalRef = useRef(null);
  const copyRef = useRef(null);
  
  const params = useParams();
  const { invoiceId } = params;
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingCreditNote, setIsCreatingCreditNote] = useState(false);
  const router = useRouter();

  const printOriginal = useReactToPrint({ 
    contentRef: originalRef,
    documentTitle: `Фактура-${invoice?.invoiceNumber}-Оригинал`
  });
  
  const printCopy = useReactToPrint({ 
    contentRef: copyRef,
    documentTitle: `Фактура-${invoice?.invoiceNumber}-Копие`
  });

  useEffect(() => {
    if (!invoiceId) return;
    setLoading(true);
    fetch(`/api/invoices?id=${invoiceId}`)
      .then((res) => res.json())
      .then((data) => setInvoice(data))
      .catch(() => toast.error("Failed to load invoice data."))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const handleCreateCreditNote = async () => {
    setIsCreatingCreditNote(true);
    const promise = () => new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('/api/credit-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        router.push(`/dashboard/credit-notes/${data.id}`);
        resolve(data);
      } catch (error) {
        console.error("Credit note creation failed", error);
        reject(error);
      }
    });

    toast.promise(promise(), {
        loading: 'Създаване на кредитно известие...',
        success: (data) => `Кредитно известие ${data.creditNoteNumber} беше създадено успешно.`,
        error: (err) => `Грешка: ${err.message}`,
        finally: () => setIsCreatingCreditNote(false)
    });
  };

  const handlePrint = (type) => {
    if (type === 'original') {
      printOriginal();
    } else if (type === 'copy') {
      printCopy();
    }
  };

  if (loading) return <div>Зареждане...</div>;
  if (!invoice) return <div>Фактурата не е намерена.</div>;

  const products = Array.isArray(invoice.products) ? invoice.products : [];
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  const dueDate = new Date(invoice.issuedAt);
  dueDate.setDate(dueDate.getDate() + 20);

  const InvoiceContent = ({ type, ref }) => (
    <div ref={ref} className="p-8 border rounded-lg bg-white shadow-sm text-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          ФАКТУРА ({type === 'original' ? 'ОРИГИНАЛ' : 'КОПИЕ'})
        </h2>
        <div className="text-right text-gray-600">
          № {String(invoice.invoiceNumber).padStart(10, "0")} /{" "}
          {new Date(invoice.issuedAt).toLocaleDateString("bg-BG")}
        </div>
      </div>

      {/* Recipient and Executor */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Получател */}
        <div className="border border-gray-300 p-4 rounded">
          <div className="font-bold bg-gray-200 -m-4 p-2 mb-4 rounded-t">
            Получател
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <span className="font-semibold">Получател</span>
            <span>{invoice.partnerName || "-"}</span>
            <span className="font-semibold">Ид. номер</span>
            <span>{invoice.partnerBulstat || "-"}</span>
            <span className="font-semibold">МОЛ</span>
            <span>{invoice.partnerMol || "-"}</span>
            <span className="font-semibold">Държава</span>
            <span>{invoice.partnerCountry || "-"}</span>
            <span className="font-semibold">Град</span>
            <span>{invoice.partnerCity || "-"}</span>
            <span className="font-semibold">Адрес</span>
            <span>{invoice.partnerAddress || "-"}</span>
          </div>
        </div>

        {/* Изпълнител */}
        <div className="border border-gray-300 p-4 rounded">
          <div className="font-bold bg-gray-200 -m-4 p-2 mb-4 rounded-t">
            Изпълнител
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <span className="font-semibold">Доставчик</span>
            <span>Омакс Сълюшънс ЕООД</span>
            <span className="font-semibold">Ид. номер</span>
            <span>200799887</span>
            <span className="font-semibold">ДДС номер</span>
            <span>BG200799887</span>
            <span className="font-semibold">МОЛ</span>
            <span>Димитър Ангелов</span>
            <span className="font-semibold">Банка</span>
            <span>ПРОКРЕДИТ БАНК</span>
            <span className="font-semibold">BIC/SWIFT</span>
            <span>PRCBGSF</span>
            <span className="font-semibold">IBAN - BGN</span>
            <span>BG27PRCB92301035316119</span>
            <span className="font-semibold">IBAN - EUR</span>
            <span>BG10PRCB92301435316101</span>
            <span className="font-semibold">Държава</span>
            <span>България</span>
            <span className="font-semibold">Град</span>
            <span>Хасково</span>
            <span className="font-semibold">Адрес</span>
            <span>ул. Рай 7</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        Дата на данъчно събитие:{" "}
        {new Date(invoice.issuedAt).toLocaleDateString("bg-BG")}
      </div>

      {/* Products Table */}
      <table className="w-full text-left border-collapse mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Име на продукта</th>
            <th className="p-2 border">EAN код</th>
            <th className="p-2 border text-center">Количество</th>
            <th className="p-2 border text-right">Единична цена без ДДС</th>
            <th className="p-2 border text-right">Общо (без ДДС)</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, idx) => (
            <tr key={idx}>
              <td className="p-2 border">{p.name}</td>
              <td className="p-2 border">{p.barcode}</td>
              <td className="p-2 border text-center">{p.quantity}</td>
              <td className="p-2 border text-right">
                {((p.clientPrice || 0) / 1.2).toLocaleString("bg-BG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(',', '.')} лв.
              </td>
              <td className="p-2 border text-right">
                {((p.quantity * (p.clientPrice || 0)) / 1.2).toLocaleString("bg-BG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(',', '.')} лв.
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold bg-gray-50">
            <td colSpan="2" className="p-2 border text-right">
              Общо:
            </td>
            <td className="p-2 border text-center">{totalQuantity}</td>
            <td className="p-2 border"></td>
            <td className="p-2 border text-right">
              {(invoice.totalValue / 1.2).toLocaleString("bg-BG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(',', '.')} лв.
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Footer */}
      <div className="grid grid-cols-2 gap-8 items-start">
        <div>
          <div>
            <span className="font-semibold">Начин на плащане:</span>{" "}
            {invoice.paymentMethod === "CASH" ? "в брой" : "банка"}
          </div>
          <div>
            <span className="font-semibold">Падеж:</span>{" "}
            {dueDate.toLocaleDateString("bg-BG")}
          </div>
        </div>
        <div className="border border-gray-300 p-4 rounded">
          <div className="flex justify-between">
            <span>Данъчна основа</span>
            <span>{invoice.vatBase.toFixed(2)} лв.</span>
          </div>
          <div className="flex justify-between">
            <span>ДДС 20%</span>
            <span>{invoice.vatAmount.toFixed(2)} лв.</span>
          </div>
          <div className="flex justify-between font-bold mt-2 border-t pt-2">
            <span>Обща стойност</span>
            <span>{invoice.totalValue.toFixed(2)} лв.</span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t">
        <div className="mb-4">
          <span className="font-semibold">Изготвил:</span>{" "}
          {invoice.preparedBy}
        </div>
        <div className="text-xs text-gray-500 text-left">
          Съгласно чл.7, ал.1 от Закона за счетоводството, чл.114 от ЗДДС и
          чл.78 от ППЗДДС печатът и подписът не са задължителни реквизити на
          фактурата
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">
          Фактура № {invoice.invoiceNumber}
        </h1>
        <div className="flex items-center gap-4">
          <Button onClick={() => handlePrint("original")}>
            Принтирай оригинал
          </Button>
          <Button onClick={() => handlePrint("copy")} variant="secondary">
            Принтирай копие
          </Button>
          <Button 
            onClick={handleCreateCreditNote} 
            disabled={isCreatingCreditNote || invoice?.creditNotes?.length > 0}
            variant="destructive"
          >
            {invoice?.creditNotes?.length > 0 ? 'Има издадено КИ' : 'Кредитно известие'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/invoices")}
          >
            Назад
          </Button>
        </div>
      </div>

      {/* Credit Notes Link */}
      {invoice.creditNotes && invoice.creditNotes.length > 0 && (
        <div className="my-8 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
          <h3 className="font-bold text-lg text-yellow-800 mb-2">Свързани кредитни известия</h3>
          <ul>
            {invoice.creditNotes.map(cn => (
              <li key={cn.id} className="list-disc list-inside">
                <Button 
                  variant="link" 
                  className="p-0 h-auto"
                  onClick={() => router.push(`/dashboard/credit-notes/${cn.id}`)}
                >
                  Кредитно известие № {cn.creditNoteNumber}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ORIGINAL INVOICE */}
      <div className="mb-8">
        <InvoiceContent type="original" ref={originalRef} />
      </div>

      {/* COPY INVOICE */}
      <InvoiceContent type="copy" ref={copyRef} />
    </div>
  );
}