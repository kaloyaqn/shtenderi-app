"use client";
import { useReactToPrint } from "react-to-print";
import { useRef, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CreditNotePage() {
  const originalRef = useRef(null);
  const copyRef = useRef(null);
  
  const params = useParams();
  const { creditNoteId } = params;
  const [creditNote, setCreditNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const printOriginal = useReactToPrint({ 
    contentRef: originalRef,
    documentTitle: `Кредитно-известие-${creditNote?.creditNoteNumber}-Оригинал`
  });
  
  const printCopy = useReactToPrint({ 
    contentRef: copyRef,
    documentTitle: `Кредитно-известие-${creditNote?.creditNoteNumber}-Копие`
  });

  useEffect(() => {
    if (!creditNoteId) return;
    setLoading(true);
    fetch(`/api/credit-notes?id=${creditNoteId}`)
      .then((res) => res.json())
      .then((data) => setCreditNote(data))
      .catch(() => toast.error("Failed to load credit note data."))
      .finally(() => setLoading(false));
  }, [creditNoteId]);

  const handlePrint = (type) => {
    if (type === 'original') {
      printOriginal();
    } else if (type === 'copy') {
      printCopy();
    }
  };

  if (loading) return <div>Зареждане...</div>;
  if (!creditNote) return <div>Кредитното известие не е намерено.</div>;

  const products = Array.isArray(creditNote.products) ? creditNote.products : [];
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  const dueDate = new Date(creditNote.issuedAt);
  dueDate.setDate(dueDate.getDate() + 20);

  const CreditNoteContent = ({ type, ref }) => (
    <div ref={ref} className="p-8 border rounded-lg bg-white shadow-sm text-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          КРЕДИТНО ИЗВЕСТИЕ ({type === 'original' ? 'ОРИГИНАЛ' : 'КОПИЕ'})
        </h2>
        <div className="text-right text-gray-600">
          № {String(creditNote.creditNoteNumber).padStart(10, "0")} /{" "}
          {new Date(creditNote.issuedAt).toLocaleDateString("bg-BG")}
        </div>
      </div>
       {/* Link to original invoice */}
       {creditNote.invoice && (
        <div className="mb-4 text-lg">
            Към фактура №{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-lg"
              onClick={() => router.push(`/dashboard/invoices/${creditNote.invoiceId}`)}
            >
              {creditNote.invoice.invoiceNumber}
            </Button>
        </div>
      )}

      {/* Recipient and Executor */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Получател */}
        <div className="border border-gray-300 p-4 rounded">
          <div className="font-bold bg-gray-200 -m-4 p-2 mb-4 rounded-t">
            Получател
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <span className="font-semibold">Получател</span>
            <span>{creditNote.partnerName || "-"}</span>
            <span className="font-semibold">Ид. номер</span>
            <span>{creditNote.partnerBulstat || "-"}</span>
            <span className="font-semibold">МОЛ</span>
            <span>{creditNote.partnerMol || "-"}</span>
            <span className="font-semibold">Държава</span>
            <span>{creditNote.partnerCountry || "-"}</span>
            <span className="font-semibold">Град</span>
            <span>{creditNote.partnerCity || "-"}</span>
            <span className="font-semibold">Адрес</span>
            <span>{creditNote.partnerAddress || "-"}</span>
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
        Дата на данъчно събитие: {new Date(creditNote.issuedAt).toLocaleDateString("bg-BG")}
      </div>

      {/* Products Table */}
      <table className="w-full text-left border-collapse mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Име на продукта</th>
            <th className="p-2 border">EAN код</th>
            <th className="p-2 border text-center">Количество</th>
            <th className="p-2 border text-right">Единична цена без ДДС</th>
            <th className="p-2 border text-right">Стойност</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, idx) => (
            <tr key={idx}>
              <td className="p-2 border">{p.name}</td>
              <td className="p-2 border">{p.barcode}</td>
              <td className="p-2 border text-center">{p.quantity}</td>
              <td className="p-2 border text-right">
                {(p.clientPrice || 0).toFixed(2)} лв.
              </td>
              <td className="p-2 border text-right">
                {(p.quantity * (p.clientPrice || 0)).toFixed(2)} лв.
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold bg-gray-50">
            <td colSpan="2" className="p-2 border text-right">
              Общо (без ДДС):
            </td>
            <td className="p-2 border text-center">{totalQuantity}</td>
            <td className="p-2 border"></td>
            <td className="p-2 border text-right">
              {creditNote.totalValue.toFixed(2)} лв.
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Footer */}
      <div className="grid grid-cols-2 gap-8 items-start">
        <div>
          <div>
            <span className="font-semibold">Начин на плащане:</span>{" "}
            {creditNote.paymentMethod === "CASH" ? "в брой" : "банка"}
          </div>
          <div>
            <span className="font-semibold">Падеж:</span>{" "}
            {dueDate.toLocaleDateString("bg-BG")}
          </div>
        </div>
        <div className="border border-gray-300 p-4 rounded">
          <div className="flex justify-between">
            <span>Данъчна основа</span>
            <span>{creditNote.vatBase.toFixed(2)} лв.</span>
          </div>
          <div className="flex justify-between">
            <span>ДДС 20%</span>
            <span>{creditNote.vatAmount.toFixed(2)} лв.</span>
          </div>
          <div className="flex justify-between font-bold mt-2 border-t pt-2">
            <span>Обща стойност</span>
            <span>{creditNote.totalValue.toFixed(2)} лв.</span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t">
        <div className="mb-4">
          <span className="font-semibold">Изготвил:</span>{" "}
          {creditNote.preparedBy}
        </div>
        <div className="text-xs text-gray-500 text-left">
          Съгласно чл.7, ал.1 от Закона за счетоводството, чл.114 от ЗДДС и
          чл.78 от ППЗДДС печатът и подписът не са задължителни реквизити на
          кредитното известие
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">
          Кредитно известие № {creditNote.creditNoteNumber}
        </h1>
        <div className="flex items-center gap-4">
          <Button onClick={() => handlePrint("original")}>Принтирай оригинал</Button>
          <Button onClick={() => handlePrint("copy")} variant="secondary">Принтирай копие</Button>
          <Button variant="ghost" onClick={() => router.push("/dashboard/credit-notes")}>Назад</Button>
        </div>
      </div>

      {/* ORIGINAL CREDIT NOTE */}
      <div className="mb-8">
        <CreditNoteContent type="original" ref={originalRef} />
      </div>

      {/* COPY CREDIT NOTE */}
      <CreditNoteContent type="copy" ref={copyRef} />
    </div>
  );
} 