"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  LucideEdit,
  MoreHorizontal,
  Package,
  Printer,
  Search,
  Send,
  Warehouse,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import RevisionProductsTable from "@/app/dashboard/revisions/[revisionId]/_components/RevisionProductsTable";
import CreatePaymentRevisionForm from "@/components/forms/payments-revision/CreatePaymentRevisionForm";
import MobileProductCard from "./MobileProductCard";
import PaymentsTable from "@/components/tables/revisions/PaymentsTable";
import PaymentsTableMobile from "./PaymentsCardMobile";
import PaymentsCardMobile from "./PaymentsCardMobile";
import BasicHeader from "@/components/BasicHeader";
import PrintStockButton from "@/components/buttons/print-stock-button";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function MobilePageRevisionId({
  revision,
  handlePrintStock,
  filteredProducts,
  contentRef,
  totalPaid,
  totalRevisionPrice,
  fetchPayments,
  revisionId,
  handleSendToClient,
  payments,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllActions, setShowAllActions] = useState(false);

  // Append-after-sale state (mobile)
  const [appendOpen, setAppendOpen] = useState(false);
  const [storages, setStorages] = useState([]);
  const [appendSourceId, setAppendSourceId] = useState("");
  const [appendBarcode, setAppendBarcode] = useState("");
  const [appendItems, setAppendItems] = useState([]); // {productId, name, barcode, quantity}
  const [appendBusy, setAppendBusy] = useState(false);
  const [appendSourceStock, setAppendSourceStock] = useState({});

  const router = useRouter();

  // Load storages when drawer opens
  useEffect(() => {
    if (!appendOpen) return;
    fetch('/api/storages')
      .then(res => res.json())
      .then(setStorages)
      .catch(() => setStorages([]));
  }, [appendOpen]);

  // Load source stock map when a source is selected
  useEffect(() => {
    if (!appendSourceId) { setAppendSourceStock({}); return; }
    fetch(`/api/storages/${appendSourceId}/products`)
      .then(r => r.json())
      .then(list => {
        const map = {}; (list||[]).forEach(sp => { map[String(sp.productId)] = sp.quantity || 0; });
        setAppendSourceStock(map);
      })
      .catch(() => setAppendSourceStock({}));
  }, [appendSourceId]);

  const handleAppendScan = async (e) => {
    if (e.key !== 'Enter') return;
    const code = appendBarcode.trim();
    if (!code) return;
    try {
      const found = await fetch(`/api/products/search?q=${encodeURIComponent(code)}`).then(r => r.json()).catch(() => []);
      const prod = Array.isArray(found) && found.length > 0 ? found[0] : null;
      if (!prod) { toast.error('Продуктът не е намерен'); return; }
      setAppendItems(prev => [{ productId: prod.id, name: prod.name || '', barcode: prod.barcode || code, quantity: 1 }, ...prev]);
      setAppendBarcode("");
    } catch { toast.error('Грешка при търсене на продукт'); }
  };

  const submitAppend = async () => {
    if (!appendSourceId) { toast.error('Моля, изберете източник (склад)'); return; }
    if (appendItems.length === 0) { toast.error('Добавете продукти'); return; }
    setAppendBusy(true);
    try {
      const items = appendItems.map(i => ({ productId: i.productId, quantity: Number(i.quantity || 0) })).filter(i => i.productId && i.quantity > 0);
      const res = await fetch(`/api/revisions/${revisionId}/append-lines`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sourceStorageId: appendSourceId, items }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Грешка при добавяне');
      toast.success('Добавени са продукти към продажбата');
      setAppendOpen(false); setAppendItems([]); setAppendBarcode("");
    } catch (e) { toast.error(e.message); }
    finally { setAppendBusy(false); }
  };

  async function downloadPdf(revision, adminName) {
    const res = await fetch("/api/prints/sale", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ revision, adminName: "Bashta mi" })
    });

    if (!res.ok) {
      alert("Грешка при генериране на PDF");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `stock-${revision.number}.pdf`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}

      <BasicHeader
      title={`Продажба #${revision.number}`}
      subtitle={'Всички данни за тази продажба'}
      hasBackButton
      >
      </BasicHeader>

      {/* Main Content */}
      <div className="p-1 space-y-3">
        {/* Info Card */}
        <Card className="">
          <CardHeader>
            <CardTitle className="text-sm">Информация за поръчката</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 py-0">
            <div>
              <span className="text-xs text-gray-500">Партньор</span>
              <p className="text-base font-medium">{revision.partner?.name}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">Щанд</span>
                <p className="text-base">{revision.stand?.name || "N/A"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Магазин</span>
                <p className="text-base">{revision.store?.name || "N/A"}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Тип</span>
                <p className="text-base">{revision.type || "N/A"}</p>
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500">Ревизор</span>
              <p className="text-base">
                {revision.user?.name || revision.user?.email || "N/A"}
              </p>
            </div>
            {revision.checkId && (
              <div>
                <span className="text-xs text-gray-500">Свързана проверка</span>
                <p className="font-mono text-xs">
                  #{revision.checkId.slice(-8)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Action Buttons */}
        <Card className={"py-0"}>
          <CardContent className="p-3">
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllActions(!showAllActions)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            {showAllActions ? (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Button
                  variant="default"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setAppendOpen(true)}
                >
                  Добави продукти
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-transparent"
                  onClick={handlePrintStock}
                >
                  <Printer className="h-3 w-3 mr-1" />
                  Принтирай
                </Button>
                {/* PRINT STOCK BUTTON */}
                {revision && (
                    <PrintStockButton
                        missingProducts={revision.missingProducts.map(mp => ({
                            ...mp,
                            missingQuantity: mp.givenQuantity ?? mp.missingQuantity
                        }))}
                        revisionNumber={revision.number}
                    />
                )}

                {/* PRINT STOCK BUTTON */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-transparent"
                  onClick={handleSendToClient}
                >
                  <Send className="h-3 w-3 mr-1" />
                  Изпрати
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-transparent"
                  onClick={() => setIsPaymentModalOpen(true)}
                  disabled={!!invoice}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  {invoice ? "Фактура създадена" : "Фактура"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-transparent"
                  onClick={() =>
                    router.push(`/dashboard/revisions/${revisionId}/edit`)
                  }
                >
                  <LucideEdit className="h-3 w-3 mr-1" />
                  Редактирай
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2 mb-3">
                <Button
                  variant="default"
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={() => setAppendOpen(true)}
                >
                  Добави продукти
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs flex-1 bg-transparent"
                  onClick={handlePrintStock}
                >
                  <Printer className="h-3 w-3 mr-1" />
                  Принтирай
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs flex-1 bg-transparent"
                  onClick={() =>
                    router.push(`/dashboard/revisions/${revisionId}/edit`)
                  }
                >
                  <LucideEdit className="h-3 w-3 mr-1" />
                  Редактирай
                </Button>
              </div>
            )}

              <PrintStockButton
                revisionNumber={revision.number}
                  missingProducts={revision.missingProducts}
                />
                <Button
                  size="sm"
                  className="w-full text-xs mt-2"
                  variant={"outline"}
                  type="button"
                  onClick={() => downloadPdf(revision, "Bashta mi")}>
                  Изтегли А4
                </Button>
          </CardContent>
        </Card>

        {/* Products Section */}
        <div className="">
          <div className="pb-2 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text- font-semibold">Продукти от продажбата</span>
              <Badge
                variant="secondary"
                className="bg-gray-200 text-gray-700 text-xs"
              >
                {filteredProducts.length} продукта
              </Badge>
            </div>
          </div>
          <div className="pt-0">
            {/* Warning for unscanned products */}
            {filteredProducts.some(mp => !mp.isSold) && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                  Някои продукти от проверката не са били налични за продажба. Те са показани в червено.
                  </span>
                </div>
              </div>
            )}
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
              <Input
                placeholder="Потърси..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 h-8 text-sm bg-white border-gray-300"
              />
            </div>

            {/* Products List */}
            <div className="space-y-2 p-0">
              {filteredProducts.map((mp) => (
                <div key={mp.id} className={!mp.isSold ? "bg-red-50 border border-red-200 rounded-md" : ""}>
                  <MobileProductCard mp={mp} />
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Няма намерени продукти.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payments Section */}
        <CreatePaymentRevisionForm
          totalPaid={totalPaid}
          totalRevisionPrice={totalRevisionPrice}
          fetchPayments={fetchPayments}
          revisionId={revisionId}
          revision={revision}
        />

        <div>
          <span className="text- font-semibold mb-2">
            Плащания към тази продажба
          </span>

          <div className="flex flex-col gap-1">
            {payments.map((payment) => (
              <PaymentsCardMobile key={payment.id} payment={payment} />
            ))}
          </div>
        </div>

        {/* Printable Stock Table (always rendered, hidden except for print) */}
        <div
          ref={contentRef}
          className="hidden print:block bg-white p-8 text-black"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl font-bold">Стокова № {revision.number}</div>
            <div className="text-md">
              Дата: {new Date(revision.createdAt).toLocaleDateString("bg-BG")}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="mb-2">
              <div className="font-semibold">Доставчик:</div>
              <div>Фирма: Омакс Сълюшънс ЕООД</div>
              <div>ЕИК/ДДС номер: BG200799887</div>
              <div>Седалище: гр. Хасково, ул. Рай №7</div>
            </div>
            <div className="mb-2 text-right">
              <div className="font-semibold">Получател:</div>
              <div>Фирма: {revision.partner?.name || "-"}</div>
              <div>ЕИК/ДДС номер: {revision.partner?.bulstat || "-"}</div>
              <div>Седалище: {revision.partner?.address || "-"}</div>
            </div>
          </div>
          <div className="mb-4">
            <div className="font-semibold">Описание:</div>
          </div>
          <RevisionProductsTable
            missingProducts={revision.missingProducts}
            priceLabel="Единична цена с ДДС"
            totalLabel="Обща стойност"
          />
          <div className="mt-6">
            Изготвил: <b>{revision.user?.name || revision.user?.email || ""}</b>
          </div>
        </div>
      </div>
      {/* Append drawer */}
      <Drawer open={appendOpen} onOpenChange={setAppendOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Добави продукти към продажбата</DrawerTitle>
            <DrawerDescription>
              Сканирай баркодове и задай количества. Задължително избери източник (склад).
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-3 space-y-3">
            <div>
              <span className="text-xs text-gray-600">Източник (склад)</span>
              <Select value={appendSourceId} onValueChange={setAppendSourceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Избери склад" />
                </SelectTrigger>
                <SelectContent>
                  {storages.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="text-xs text-gray-600">Баркод</span>
              <Input value={appendBarcode} onChange={e => setAppendBarcode(e.target.value)} onKeyDown={handleAppendScan} placeholder="Сканирай и натисни Enter" />
            </div>
            <div className="max-h-64 overflow-auto border rounded">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-500">
                    <th className="px-2 py-1">Име</th>
                    <th className="px-2 py-1">Баркод</th>
                    <th className="px-2 py-1">Количество</th>
                    <th className="px-2 py-1">Налично</th>
                    <th className="px-2 py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {appendItems.map((it, i) => (
                    <tr key={i}>
                      <td className="px-2 py-1">{it.name || '-'}</td>
                      <td className="px-2 py-1">{it.barcode || '-'}</td>
                      <td className="px-2 py-1 w-24">
                        <Input value={String(it.quantity ?? '')} onChange={e => {
                          const v = e.target.value;
                          const want = v === '' ? '' : Number(v);
                          if (want === '') { setAppendItems(prev => prev.map((row, idx) => idx === i ? { ...row, quantity: '' } : row)); return; }
                          const pid = String(it.productId || '');
                          const available = appendSourceStock[pid] ?? 0;
                          const capped = Math.max(0, Math.min(available, Number.isFinite(want) ? want : 0));
                          if (Number(want) > available) { toast.error(`Наличност ${available}. Не може ${want}.`); }
                          setAppendItems(prev => prev.map((row, idx) => idx === i ? { ...row, quantity: capped } : row));
                        }} inputMode="numeric" />
                      </td>
                      <td className="px-2 py-1">{(() => { const pid = String(it.productId || ''); return appendSourceStock[pid] ?? 0; })()}</td>
                      <td className="px-2 py-1 text-right">
                        <button className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50" onClick={() => setAppendItems(prev => prev.filter((_, idx) => idx !== i))}>✕</button>
                      </td>
                    </tr>) )}
                  {appendItems.length === 0 && (
                    <tr><td className="px-2 py-2 text-gray-500" colSpan={5}>Няма добавени продукти</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setAppendOpen(false)} disabled={appendBusy}>Затвори</Button>
            <Button onClick={submitAppend} disabled={appendBusy || appendItems.length === 0}>{appendBusy ? 'Добавяне...' : 'Добави'}</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
