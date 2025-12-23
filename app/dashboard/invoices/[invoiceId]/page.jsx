"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LoadingScreen from "@/components/LoadingScreen";
import BasicHeader from "@/components/BasicHeader";
import { CopyIcon, PrinterIcon, Send } from "lucide-react";
import { IconInvoice } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";

export default function InvoicePage() {
  const params = useParams();
  const { invoiceId } = params;
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingCreditNote, setIsCreatingCreditNote] = useState(false);
  const [hasCreditNote, setHasCreditNote] = useState(false);
  const [hasRefund, setHasRefund] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethodForm, setPaymentMethodForm] = useState("CASH");
  const [storages, setStorages] = useState([]);
  const [selectedStorage, setSelectedStorage] = useState("");
  const [creatingPayment, setCreatingPayment] = useState(false);
  const emailForInvoice =
    invoice?.partnerEmail ||
    invoice?.partner?.email ||
    invoice?.revision?.partner?.email ||
    invoice?.revision?.stand?.email ||
    null;
  const router = useRouter();

  useEffect(() => {
    if (!invoiceId) return;
    setLoading(true);
    fetch(`/api/invoices?id=${invoiceId}`)
      .then((res) => res.json())
      .then((data) => {
        setInvoice(data);
        const remaining = Math.max(
          Number(data?.totalValue || 0) - Number(data?.paidAmount || 0),
          0
        ).toFixed(2);
        setPaymentAmount(remaining);
      })
      .catch(() => toast.error("Failed to load invoice data."))
      .finally(() => setLoading(false));
    // Check if a credit note exists for this invoice
    fetch(`/api/credit-notes?invoiceId=${invoiceId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setHasCreditNote(true);
        else if (data && data.invoiceId === invoiceId) setHasCreditNote(true);
        else setHasCreditNote(false);
      })
      .catch(() => setHasCreditNote(false));
    // Check if a refund exists for this invoice
    fetch(`/api/refunds?invoiceId=${invoiceId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setHasRefund(true);
        else setHasRefund(false);
      })
      .catch(() => setHasRefund(false));

    // Load storages for payment form
    fetch("/api/storages")
      .then((res) => res.json())
      .then((data) => {
        const opts = Array.isArray(data)
          ? data.map((s) => ({ value: s.id, label: s.name || s.id }))
          : [];
        setStorages(opts);
        if (opts.length > 0) setSelectedStorage(opts[0].value);
      })
      .catch(() => {});
  }, [invoiceId]);

  const handleCreateCreditNote = async () => {
    setIsCreatingCreditNote(true);
    const promise = () =>
      new Promise(async (resolve, reject) => {
        try {
          const response = await fetch("/api/credit-notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
      loading: "Създаване на кредитно известие...",
      success: (data) =>
        `Кредитно известие ${data.creditNoteNumber} беше създадено успешно.`,
      error: (err) => `Грешка: ${err.message}`,
      finally: () => setIsCreatingCreditNote(false),
    });
  };

  const downloadPdf = async (variant) => {
    if (!invoiceId) return;
    setDownloadingPdf(true);
    try {
      const res = await fetch(
        `/api/prints/invoice?variant=${variant || "original"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId }),
        }
      );
      if (!res.ok) {
        throw new Error("Неуспешно генериране на PDF");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice?.invoiceNumber || invoiceId}-${
        variant || "original"
      }.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e?.message || "Грешка при изтегляне на PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!invoice) return <div>Фактурата не е намерена.</div>;

  const products = Array.isArray(invoice.products) ? invoice.products : [];
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  const issuedAt = new Date(invoice.issuedAt);
  const dueDate = new Date(issuedAt);
  if (invoice.paymentMethod === "CASH") {
    // cash: same day
    dueDate.setDate(issuedAt.getDate());
  } else {
    // bank: +30 days
    dueDate.setDate(issuedAt.getDate() + 30);
  }

  const paymentStatus = invoice.paymentStatus || "UNPAID";
  const paymentBadge = (() => {
    switch (paymentStatus) {
      case "PAID":
        return <Badge variant="success">Платена</Badge>;
      case "PARTIALLY_PAID":
        return <Badge variant="outline">Частично платена</Badge>;
      default:
        return <Badge variant="destructive">Неплатена</Badge>;
    }
  })();

  const payments = Array.isArray(invoice.payments) ? invoice.payments : [];
  const remainingAmount = Math.max(
    Number(invoice.totalValue || 0) - Number(invoice.paidAmount || 0),
    0
  );

  const invoiceCss = `
    .inv-root {
      font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #111827;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.04);
    }
    .inv-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .inv-logo {
      height: 42px;
      margin-bottom: 6px;
    }
    .inv-title {
      font-size: 20px;
      font-weight: 700;
      margin: 0;
      letter-spacing: 0.2px;
    }
    .inv-meta {
      text-align: right;
      color: #6b7280;
      font-size: 13px;
    }
    .inv-info {
      display: flex;
      gap: 16px;
      margin: 16px 0 8px;
    }
    .inv-card {
      flex: 1;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
      background: #f9fafb;
    }
    .inv-card h3 {
      margin: 0;
      padding: 10px 14px;
      background: #111827;
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.2px;
    }
    .inv-card .inv-body {
      padding: 12px 14px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 12px;
      font-size: 13px;
    }
    .inv-card .inv-label {
      color: #6b7280;
      font-weight: 600;
      font-size: 12px;
    }
    table.inv-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      font-size: 12px;
    }
    table.inv-table th {
      text-align: left;
      padding: 8px 6px;
      border-bottom: 2px solid #111827;
      background: #f3f4f6;
      font-weight: 700;
      letter-spacing: 0.1px;
    }
    table.inv-table td {
      padding: 8px 6px;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: top;
    }
    table.inv-table tr:last-child td { border-bottom: none; }
    .inv-total-row td {
      font-weight: 700;
      border-top: 2px solid #111827;
    }
    .inv-footer {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 16px;
      margin-top: 16px;
      align-items: start;
    }
    .inv-summary {
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 12px 14px;
      background: #f9fafb;
      font-size: 13px;
    }
    .inv-summary .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .inv-summary .row:last-child { margin-bottom: 0; }
    .inv-summary .total {
      font-weight: 700;
      border-top: 1px solid #e5e7eb;
      padding-top: 8px;
      margin-top: 8px;
    }
    .inv-sign {
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
    }
    .inv-small {
      color: #6b7280;
      font-size: 11px;
      margin-top: 4px;
      line-height: 1.45;
    }
  `;

  const InvoiceContent = function InvoiceContent({ type }) {
    const isOriginal = type === "original";

    return (
      <div className="inv-root">
        <style>{invoiceCss}</style>

        <div className="inv-header">
          <div>
            <img src="/logo/logo.png" alt="Stendo" className="inv-logo" />
            <h2 className="inv-title">
              Фактура {isOriginal ? "(Оригинал)" : "(Копие)"}
            </h2>
            <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
              Издадена на{" "}
              {new Date(invoice.issuedAt).toLocaleDateString("bg-BG")}
            </div>
          </div>
          <div className="inv-meta">
            № {String(invoice.invoiceNumber).padStart(10, "0")}
            <div>
              Данъчно събитие:{" "}
              {new Date(invoice.issuedAt).toLocaleDateString("bg-BG")}
            </div>
          </div>
        </div>

        <div className="inv-info">
          <div className="inv-card">
            <h3>Получател</h3>
            <div className="inv-body">
              <span className="inv-label">Име</span>
              <span>{invoice.partnerName || "-"}</span>
              <span className="inv-label">Ид. номер</span>
              <span>{invoice.partnerBulstat || "-"}</span>
              <span className="inv-label">МОЛ</span>
              <span>{invoice.partnerMol || "-"}</span>
              <span className="inv-label">Държава</span>
              <span>{invoice.partnerCountry || "-"}</span>
              <span className="inv-label">Град</span>
              <span>{invoice.partnerCity || "-"}</span>
              <span className="inv-label">Адрес</span>
              <span>{invoice.partnerAddress || "-"}</span>
            </div>
          </div>

          <div className="inv-card">
            <h3>Изпълнител</h3>
            <div className="inv-body">
              <span className="inv-label">Доставчик</span>
              <span>Омакс Сълюшънс ЕООД</span>
              <span className="inv-label">Ид. номер</span>
              <span>200799887</span>
              <span className="inv-label">ДДС номер</span>
              <span>BG200799887</span>
              <span className="inv-label">МОЛ</span>
              <span>Димитър Ангелов</span>
              <span className="inv-label">Банка</span>
              <span>ПРОКРЕДИТ БАНК</span>
              <span className="inv-label">BIC/SWIFT</span>
              <span>PRCBGSF</span>
              <span className="inv-label">IBAN - BGN</span>
              <span>BG27PRCB92301035316119</span>
              <span className="inv-label">IBAN - EUR</span>
              <span>BG10PRCB92301435316101</span>
              <span className="inv-label">Град</span>
              <span>Хасково</span>
              <span className="inv-label">Адрес</span>
              <span>ул. Рай 7</span>
            </div>
          </div>
        </div>

        <table className="inv-table">
          <thead>
            <tr>
              <th>EAN</th>
              <th>Име на продукта</th>
              <th style={{ textAlign: "right" }}>Кол.</th>
              <th style={{ textAlign: "right" }}>Ед. цена (с ДДС)</th>
              <th style={{ textAlign: "right" }}>Общо</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => {
              const price = p.clientPrice || 0;
              const total = price * (p.quantity || 0);
              return (
                <tr key={idx}>
                  <td style={{ whiteSpace: "nowrap" }}>{p.barcode || "-"}</td>
                  <td>{p.name}</td>
                  <td style={{ textAlign: "right" }}>{p.quantity}</td>
                  <td style={{ textAlign: "right" }}>{price.toFixed(2)} лв.</td>
                  <td style={{ textAlign: "right" }}>{total.toFixed(2)} лв.</td>
                </tr>
              );
            })}
            <tr className="inv-total-row">
              <td>ОБЩО</td>
              <td></td>
              <td style={{ textAlign: "right" }}>{totalQuantity}</td>
              <td></td>
              <td style={{ textAlign: "right" }}>
                {invoice.totalValue.toFixed(2)} лв.
              </td>
            </tr>
          </tbody>
        </table>

        <div className="inv-footer">
          <div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>
              Начин на плащане:{" "}
              <strong>
                {invoice.paymentMethod === "CASH" ? "В брой" : "Банка"}
              </strong>
            </div>
            <div style={{ fontSize: 13, marginBottom: 12 }}>
              Падеж: <strong>{dueDate.toLocaleDateString("bg-BG")}</strong>
            </div>
            <div className="inv-small">
              Съгласно чл.7, ал.1 от Закона за счетоводството, чл.114 от ЗДДС и
              чл.78 от ППЗДДС печатът и подписът не са задължителни реквизити на
              фактурата.
            </div>
          </div>

          <div className="inv-summary">
            <div className="row">
              <span>Данъчна основа</span>
              <span>{invoice.vatBase.toFixed(2)} лв.</span>
            </div>
            <div className="row">
              <span>ДДС 20%</span>
              <span>{invoice.vatAmount.toFixed(2)} лв.</span>
            </div>
            <div className="row total">
              <span>Обща стойност</span>
              <span>{invoice.totalValue.toFixed(2)} лв.</span>
            </div>
          </div>
        </div>

        <div className="inv-sign">
          <div style={{ fontWeight: 600 }}>Изготвил: {invoice.preparedBy}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="">
      {/* <div className="flex justify-between items-center mb-4">
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
      </div> */}

      <BasicHeader
        hasBackButton
        title={`
          Фактура № ${invoice.invoiceNumber}
        
        `}
      >
        {paymentBadge}

        <Button
          onClick={handleCreateCreditNote}
          disabled={hasCreditNote || isCreatingCreditNote || !hasRefund}
          variant="outline"
          className="ml-2"
          title={
            !hasRefund
              ? "Не може да се издаде кредитно известие без връщане по тази фактура."
              : undefined
          }
        >
          <IconInvoice /> Кредитиране
        </Button>

        <Button
          variant={"outline"}
          onClick={() => downloadPdf("original")}
          disabled={downloadingPdf}
        >
          <PrinterIcon />{" "}
          {downloadingPdf ? "Генериране..." : "Принтирай оригинал"}
        </Button>

        <Button
          onClick={() => downloadPdf("copy")}
          variant="outline"
          disabled={downloadingPdf}
        >
          <CopyIcon /> {downloadingPdf ? "Генериране..." : "Принтирай копие"}
        </Button>

        <Button
          onClick={async () => {
            setSendingEmail(true);
            setEmailSent(false);
            try {
              const res = await fetch(
                `/api/prints/invoice?variant=original&send_email=1`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ invoiceId }),
                }
              );
              const data = await res.json().catch(() => ({}));
              if (!res.ok)
                throw new Error(data?.error || "Грешка при изпращане на имейл");
              setEmailSent(true);
              toast.success("Фактурата беше изпратена по имейл.");
              setTimeout(() => setEmailSent(false), 2000);
            } catch (err) {
              toast.error(err?.message || "Грешка при изпращане на имейл");
            } finally {
              setSendingEmail(false);
            }
          }}
          variant={emailSent ? "secondary" : "default"}
          disabled={sendingEmail || downloadingPdf}
        >
          <Send />{" "}
          {sendingEmail
            ? "Изпращане..."
            : emailSent
            ? "Изпратено"
            : "Изпрати по имейл"}
        </Button>
      </BasicHeader>

      {/* Credit Notes Link */}
      {invoice.creditNotes && invoice.creditNotes.length > 0 && (
        <div className="my-8 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
          <h3 className="font-bold text-lg text-yellow-800 mb-2">
            Свързани кредитни известия
          </h3>
          <ul>
            {invoice.creditNotes.map((cn) => (
              <li key={cn.id} className="list-disc list-inside">
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() =>
                    router.push(`/dashboard/credit-notes/${cn.id}`)
                  }
                >
                  Кредитно известие № {cn.creditNoteNumber}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
        <div className="border rounded-lg p-4 bg-white ">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Добави плащане</p>
              <h3 className="text-lg font-semibold">
                Метод: {invoice.paymentMethod === "CASH" ? "В брой" : "Банка"}
              </h3>
            </div>
            {paymentBadge}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="paymentAmount">Сума</Label>
              <Input
                id="paymentAmount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={remainingAmount.toFixed(2)}
              />
            </div>
            <div className="space-y-1">
              <Label>Метод</Label>
              <Input
                disabled
                value={invoice.paymentMethod === "CASH" ? "В брой" : "Банка"}
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Каса / Склад</Label>
              <Combobox
                options={storages}
                value={selectedStorage}
                onValueChange={(val) => setSelectedStorage(val)}
                placeholder="Избери каса"
                searchPlaceholder="Търси каса..."
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button
                onClick={async () => {
                  if (!paymentAmount || Number(paymentAmount) <= 0) {
                    toast.error("Въведете сума.");
                    return;
                  }
                  if (Number(paymentAmount) - remainingAmount > 0.01) {
                    toast.error("Сумата надвишава оставащата по фактурата.");
                    return;
                  }
                  if (!selectedStorage) {
                    toast.error("Изберете каса/склад.");
                    return;
                  }
                  setCreatingPayment(true);
                  try {
                    const res = await fetch(
                      `/api/invoices/${invoiceId}/payments`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          amount: Number(paymentAmount),
                          method: invoice.paymentMethod || "CASH",
                          storageId: selectedStorage,
                        }),
                      }
                    );
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok)
                      throw new Error(
                        data?.error || "Грешка при добавяне на плащане"
                      );
                    setInvoice(data.invoice);
                    setPaymentAmount("");
                    toast.success("Плащането е добавено.");
                  } catch (err) {
                    toast.error(
                      err?.message || "Грешка при добавяне на плащане"
                    );
                  } finally {
                    setCreatingPayment(false);
                  }
                }}
                disabled={creatingPayment}
              >
                {creatingPayment ? "Добавяне..." : "Добави"}
              </Button>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-white ">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold">Плащания</h3>
              <p className="text-sm text-gray-500">
                Проследи всички плащания към тази фактура.
              </p>
            </div>
            <div className="text-sm text-gray-700 text-right">
              Получено:{" "}
              <strong>{Number(invoice.paidAmount || 0).toFixed(2)} лв.</strong>
              <br />
              Общо:{" "}
              <strong>{Number(invoice.totalValue || 0).toFixed(2)} лв.</strong>
            </div>
          </div>
          {payments.length === 0 ? (
            <div className="text-sm text-gray-500">Няма въведени плащания.</div>
          ) : (
            <div className="overflow-x-auto border rounded-md">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Дата</th>
                    <th className="px-3 py-2 text-left">Метод</th>
                    <th className="px-3 py-2 text-right">Сума</th>
                    <th className="px-3 py-2 text-left">Потребител</th>
                    <th className="px-3 py-2 text-left">Каса/Склад</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-3 py-2">
                        {new Date(p.createdAt).toLocaleString("bg-BG")}
                      </td>
                      <td className="px-3 py-2">
                        {p.method === "CASH" ? "В брой" : "Банка"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {Number(p.amount || 0).toFixed(2)} лв.
                      </td>
                      <td className="px-3 py-2">
                        {p.user?.name || p.user?.email || "-"}
                      </td>
                      <td className="px-3 py-2">
                        {p.cashRegister?.storage?.name || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ORIGINAL INVOICE */}
      <div className="mb-8">
        <InvoiceContent type="original" />
      </div>

      {/* COPY INVOICE */}
      <InvoiceContent type="copy" />

      {/* Payments & Form */}
    </div>
  );
}
