"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import BasicHeader from "@/components/BasicHeader";
import { CopyIcon, PrinterIcon, Send } from "lucide-react";

export default function CreditNotePage() {
  const params = useParams();
  const { creditNoteId } = params;
  const [creditNote, setCreditNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!creditNoteId) return;
    setLoading(true);
    fetch(`/api/credit-notes?id=${creditNoteId}`)
      .then((res) => res.json())
      .then((data) => setCreditNote(data))
      .catch(() => toast.error("Failed to load credit note data."))
      .finally(() => setLoading(false));
  }, [creditNoteId]);

  const downloadPdf = async (variant) => {
    if (!creditNoteId) return;
    setDownloadingPdf(true);
    try {
      const res = await fetch(`/api/prints/credit-note?variant=${variant || "original"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creditNoteId }),
      });
      if (!res.ok) throw new Error("Неуспешно генериране на PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `credit-note-${creditNote?.creditNoteNumber || creditNoteId}-${variant || "original"}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err?.message || "Грешка при изтегляне на PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) return <div>Зареждане...</div>;
  if (!creditNote) return <div>Кредитното известие не е намерено.</div>;

  const emailForCreditNote =
    [
      creditNote?.partnerEmail,
      creditNote?.partner?.email,
      creditNote?.invoice?.partnerEmail,
      creditNote?.invoice?.partner?.email,
    ]
      .map((e) => (typeof e === "string" ? e.trim() : e))
      .find(Boolean) || null;

  const products = Array.isArray(creditNote.products) ? creditNote.products : [];
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  const issuedAt = new Date(creditNote.issuedAt);

  const creditNoteCss = `
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

  const CreditNoteContent = ({ type }) => {
    const isOriginal = type === "original";
    return (
      <div className="inv-root">
        <style>{creditNoteCss}</style>

        <div className="inv-header">
          <div>
            <img src="/logo/logo.png" alt="Stendo" className="inv-logo" />
            <h2 className="inv-title">
              Кредитно известие {isOriginal ? "(Оригинал)" : "(Копие)"}
            </h2>
            <div style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
              Издадено на {issuedAt.toLocaleDateString("bg-BG")}
            </div>
            {creditNote.invoice && (
              <div style={{ marginTop: 4, fontSize: 13 }}>
                Към фактура №{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => router.push(`/dashboard/invoices/${creditNote.invoiceId}`)}
                >
                  {creditNote.invoice.invoiceNumber}
                </Button>
              </div>
            )}
          </div>
          <div className="inv-meta">
            № {String(creditNote.creditNoteNumber).padStart(10, "0")}
            <div>Данъчно събитие: {issuedAt.toLocaleDateString("bg-BG")}</div>
          </div>
        </div>

        <div className="inv-info">
          <div className="inv-card">
            <h3>Получател</h3>
            <div className="inv-body">
              <span className="inv-label">Име</span>
              <span>{creditNote.partnerName || "-"}</span>
              <span className="inv-label">Ид. номер</span>
              <span>{creditNote.partnerBulstat || "-"}</span>
              <span className="inv-label">МОЛ</span>
              <span>{creditNote.partnerMol || "-"}</span>
              <span className="inv-label">Държава</span>
              <span>{creditNote.partnerCountry || "-"}</span>
              <span className="inv-label">Град</span>
              <span>{creditNote.partnerCity || "-"}</span>
              <span className="inv-label">Адрес</span>
              <span>{creditNote.partnerAddress || "-"}</span>
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
              <td style={{ textAlign: "right" }}>{creditNote.totalValue.toFixed(2)} лв.</td>
            </tr>
          </tbody>
        </table>

        <div className="inv-footer">
          <div>
            <div style={{ fontSize: 13, marginBottom: 12 }}>
              Това кредитно известие коригира стойности по свързаната фактура.
            </div>
            <div className="inv-small">
              Съгласно чл.7, ал.1 от Закона за счетоводството, чл.114 от ЗДДС и чл.78 от ППЗДДС печатът и подписът не са задължителни реквизити на документа.
            </div>
          </div>

          <div className="inv-summary">
            <div className="row">
              <span>Данъчна основа</span>
              <span>{creditNote.vatBase.toFixed(2)} лв.</span>
            </div>
            <div className="row">
              <span>ДДС 20%</span>
              <span>{creditNote.vatAmount.toFixed(2)} лв.</span>
            </div>
            <div className="row total">
              <span>Обща стойност</span>
              <span>{creditNote.totalValue.toFixed(2)} лв.</span>
            </div>
          </div>
        </div>

        <div className="inv-sign">
          <div style={{ fontWeight: 600 }}>Изготвил: {creditNote.preparedBy}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto">
      {/* <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">
          Кредитно известие № {creditNote.creditNoteNumber}
        </h1>
        <div className="flex items-center gap-4">
          <Button onClick={() => handlePrint("original")}>Принтирай оригинал</Button>
          <Button onClick={() => handlePrint("copy")} variant="secondary">Принтирай копие</Button>
          <Button variant="ghost" onClick={() => router.push(\"/dashboard/credit-notes\")}>Назад</Button>
        </div>
      </div> */}

      <BasicHeader
      hasBackButton
      title={`
          Кредитно известие № ${creditNote.creditNoteNumber}
        `}
      >
          <Button onClick={() => downloadPdf("copy")} variant="outline" disabled={downloadingPdf}>
            <CopyIcon /> {downloadingPdf ? "Генериране..." : "Принтирай копие"}
          </Button>
          <Button onClick={() => downloadPdf("original")} disabled={downloadingPdf}>
            <PrinterIcon /> {downloadingPdf ? "Генериране..." : "Принтирай оригинал"}
          </Button>
          <Button
            onClick={async () => {
              if (!emailForCreditNote) return;
              setSendingEmail(true);
              setEmailSent(false);
              try {
                const emailParam = emailForCreditNote ? `&email=${encodeURIComponent(emailForCreditNote)}` : "";
                const res = await fetch(`/api/prints/credit-note?variant=original&send_email=1${emailParam}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ creditNoteId }),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data?.error || "Грешка при изпращане на имейл");
                setEmailSent(true);
                toast.success("Кредитното известие беше изпратено по имейл.");
                setTimeout(() => setEmailSent(false), 2000);
              } catch (err) {
                toast.error(err?.message || "Грешка при изпращане на имейл");
              } finally {
                setSendingEmail(false);
              }
            }}
            variant={emailSent ? "secondary" : "outline"}
            disabled={sendingEmail || downloadingPdf || !emailForCreditNote}
            title={!emailForCreditNote ? "Няма имейл за този партньор" : undefined}
          >
            <Send />{" "}
            {emailForCreditNote
              ? sendingEmail
                ? "Изпращане..."
                : emailSent
                ? "Изпратено"
                : "Изпрати по имейл"
              : "Няма имейл"}
          </Button>
      </BasicHeader>

      {/* ORIGINAL CREDIT NOTE */}
      <div className="mb-8">
        <CreditNoteContent type="original" />
      </div>

      {/* COPY CREDIT NOTE */}
      <CreditNoteContent type="copy" />
    </div>
  );
} 
