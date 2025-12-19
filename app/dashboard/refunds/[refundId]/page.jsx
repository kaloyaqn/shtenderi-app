"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Calendar,
  CheckCircle,
  FileText,
  Loader2,
  Printer,
  X,
  User,
  Warehouse,
} from "lucide-react";
import { IconInvoice } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import TableLink from "@/components/ui/table-link";
import { Input } from "@/components/ui/input";
import BasicHeader from "@/components/BasicHeader";

export default function RefundDetailPage() {
  const { refundId } = useParams();
  const [refund, setRefund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [storages, setStorages] = useState([]);
  const [selectedStorage, setSelectedStorage] = useState("");
  const [returning, setReturning] = useState(false);
  const [returned, setReturned] = useState(false);
  const [returnedStorage, setReturnedStorage] = useState(null);
  const [returnedAt, setReturnedAt] = useState(null);
  const [creatingCreditNote, setCreatingCreditNote] = useState(false);
  const [creditNotesSummary, setCreditNotesSummary] = useState([]);
  const [creditNoteDialogOpen, setCreditNoteDialogOpen] = useState(false);
  const [creditNoteStep, setCreditNoteStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [invoiceSearchResults, setInvoiceSearchResults] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [creditQuantity, setCreditQuantity] = useState(1);
  const [creditProducts, setCreditProducts] = useState([]);
  const [creditNoteError, setCreditNoteError] = useState("");
  const [savingCreditNote, setSavingCreditNote] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [invoiceLookup, setInvoiceLookup] = useState({});
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [invoicesShown, setInvoicesShown] = useState(false);

  const contentRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const displayRefundNumber =
    refund?.refundNumber || refund?.invoiceNumber || refund?.id?.slice(-8);

  const creditedByProductId = useMemo(() => {
    const map = {};
    (creditNotesSummary || []).forEach((cn) => {
      const products = Array.isArray(cn.products) ? cn.products : [];
      products.forEach((p) => {
        const pid = p.productId || p.id || p.product?.id;
        if (!pid) return;
        const qty = Number(p.quantity) || 0;
        if (!map[pid]) map[pid] = { total: 0, notes: [] };
        map[pid].total += qty;
        map[pid].notes.push({
          creditNoteId: cn.id,
          creditNoteNumber: cn.creditNoteNumber,
          quantity: qty,
        });
      });
    });
    return map;
  }, [creditNotesSummary]);

  const pendingCreditByProductId = useMemo(() => {
    const map = {};
    creditProducts.forEach((p) => {
      const pid = p.productId || p.id;
      if (!pid) return;
      map[pid] = (map[pid] || 0) + (Number(p.quantity) || 0);
    });
    return map;
  }, [creditProducts]);

  const getRemainingForProduct = (productId, refundQty) => {
    const credited = creditedByProductId[productId]?.total || 0;
    const pending = pendingCreditByProductId[productId] || 0;
    return Math.max((refundQty || 0) - credited - pending, 0);
  };

  const findInvoiceProduct = (invoice, product) => {
    if (!invoice || !product) return null;
    const list = Array.isArray(invoice.products) ? invoice.products : [];
    const productId = product.productId || product.id || product.product?.id;
    const barcode = product.barcode || product.product?.barcode;
    const pcode = product.pcode || product.product?.pcode;
    return list.find(
      (p) =>
        p.productId === productId ||
        p.id === productId ||
        p.product?.id === productId ||
        (barcode && (p.barcode === barcode || p.product?.barcode === barcode)) ||
        (pcode && (p.pcode === pcode || p.product?.pcode === pcode))
    );
  };

  const getMaxForSelection = (invoice, product) => {
    const remainingQty = getRemainingForProduct(
      product.productId,
      product.refundQuantity
    );
    const invProduct = findInvoiceProduct(invoice, product);
    const invoiceQty = invProduct?.quantity || remainingQty || 1;
    return Math.max(1, Math.min(invoiceQty, remainingQty || invoiceQty));
  };

  const loadInvoicesForProducts = async () => {
    setLoadingInvoices(true);
    setCreditNoteError("");
    try {
      const results = await Promise.all(
        (refund?.refundProducts || []).map(async (rp) => {
          const pid = rp.product?.id || rp.productId;
          if (!pid) return null;
          const params = new URLSearchParams();
          params.set("productId", pid);
          if (refund.partnerName) params.set("partnerName", refund.partnerName);
          if (dateFrom) params.set("dateFrom", dateFrom);
          if (dateTo) params.set("dateTo", dateTo);
          const res = await fetch(`/api/invoices?${params.toString()}`);
          if (!res.ok) return { pid, invoices: [] };
          const data = await res.json();
          return { pid, invoices: data };
        })
      );
      const map = {};
      results.forEach((entry) => {
        if (entry?.pid) {
          map[entry.pid] = entry.invoices || [];
        }
      });
      setInvoiceLookup(map);
      setInvoicesShown(true);
    } catch (err) {
      setCreditNoteError("Грешка при зареждане на фактурите");
    } finally {
      setLoadingInvoices(false);
    }
  };

  const removeCreditProduct = (index) => {
    setCreditProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const resetCreditNoteFlow = () => {
    setCreditNoteStep(1);
    setSelectedProduct(null);
    setSelectedInvoice(null);
    setCreditQuantity(1);
    setProductSearch("");
    setInvoiceSearchResults([]);
    setCreditNoteError("");
  };

  useEffect(() => {
    if (!refundId) return;
    fetch(`/api/refunds`)
      .then((res) => res.json())
      .then((data) => setRefund(data.find((r) => r.id === refundId) || null))
      .finally(() => setLoading(false));
    // Fetch all credit notes for this refund
    fetch(`/api/credit-notes?refundId=${refundId}`)
      .then((res) => res.json())
      .then(setCreditNotesSummary);
  }, [refundId]);

  useEffect(() => {
    if (refund?.returnedToStorageId) {
      setReturned(true);
      setReturnedAt(refund.returnedAt);
      // Fetch storage name
      fetch(`/api/storages/${refund.returnedToStorageId}`)
        .then((res) => res.json())
        .then((storage) => setReturnedStorage(storage));
    }
  }, [refund]);

  if (loading) return <div>Зареждане...</div>;
  if (!refund) return <div>Връщането не е намерено.</div>;

  const columns = [
    {
      id: "name",
      accessorKey: "product.name",
      header: "Име на продукта",
      cell: ({ row }) => row.original.product?.name || "-",
    },
    {
      id: "barcode",
      accessorKey: "product.barcode",
      header: "Баркод",
      cell: ({ row }) => row.original.product?.barcode || "-",
    },
    {
      id: "pcode",
      accessorKey: "product.pcode",
      header: "",
      cell: ({ row }) => <span className="text-[0px]">
        {row.original.product?.pcode || "-"}
      </span>
    },
    {
      accessorKey: "quantity",
      header: "кол.",
      cell: ({ row }) => row.original.quantity,
    },
    {
      accessorKey: "priceAtRefund",
      header: "Ед. цена",
      cell: ({ row }) => {
        const price = row.original.priceAtRefund ?? row.original.product?.clientPrice ?? 0;
        return price ? price.toFixed(2) + ' лв.' : '-';
      },
    },
    {
      id: "total",
      header: "Обща стойност",
      cell: ({ row }) => {
        const price = row.original.priceAtRefund ?? row.original.product?.clientPrice ?? 0;
        return (price * row.original.quantity).toFixed(2) + ' лв.';
      },
    },
  ];

  let sourceHref = "#";
  if (refund.sourceType === "STAND")
    sourceHref = `/dashboard/stands/${refund.sourceId}`;
  else if (refund.sourceType === "STORAGE")
    sourceHref = `/dashboard/storages/${refund.sourceId}`;

  const openReturnDialog = () => {
    setReturnDialogOpen(true);
    if (storages.length === 0) {
      fetch("/api/storages")
        .then((res) => res.json())
        .then(setStorages);
    }
  };

  const handleReturnToStorage = async () => {
    if (!selectedStorage) return;
    setReturning(true);
    try {
      const res = await fetch(`/api/refunds/${refund.id}/return-to-storage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storageId: selectedStorage }),
      });
      if (!res.ok) throw new Error("Грешка при връщане в склад");
      setReturned(true);
      setReturnDialogOpen(false);
      toast.success("Продуктите са върнати в склада!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setReturning(false);
    }
  };

  // Helper: filter refund products by search
  const filteredRefundProducts = refund?.refundProducts?.filter(rp => {
    if (!productSearch) return true;
    const name = rp.product?.name?.toLowerCase() || "";
    const barcode = rp.product?.barcode?.toLowerCase() || "";
    const pcode = rp.product?.pcode?.toLowerCase() || "";
    return (
      name.includes(productSearch.toLowerCase()) ||
      barcode.includes(productSearch.toLowerCase()) ||
      pcode.includes(productSearch.toLowerCase())
    );
  }) || [];

  // Step 2: Search invoices for selected product
  function handleSearchInvoices() {
    setCreditNoteError("");
    if (!invoicesShown) {
      setCreditNoteError("Първо изберете период и натиснете „Покажи“.");
      return;
    }
    if (!selectedProduct) {
      setCreditNoteError("Моля, изберете продукт от връщането.");
      return;
    }
    const productId = selectedProduct.productId || selectedProduct.id;
    if (!productId) {
      setCreditNoteError("Липсва идентификатор за продукта.");
      return;
    }
    const remainingQty = getRemainingForProduct(
      productId,
      selectedProduct.refundQuantity
    );
    if (remainingQty <= 0) {
      setCreditNoteError("Този продукт вече е кредитиран изцяло.");
      return;
    }

    const invoices = invoiceLookup[productId] || [];
    if (invoices.length === 0) {
      setCreditNoteError("Този продукт не фигурира във фактури за избрания период.");
      return;
    }
    setInvoiceSearchResults(invoices);
    setCreditNoteStep(2);
  }

  // Step 3: Select invoice and enter quantity
  function handleSelectInvoice(inv) {
    setSelectedInvoice(inv);
    if (!selectedProduct) return;
    const remainingQty = getRemainingForProduct(
      selectedProduct.productId,
      selectedProduct.refundQuantity
    );
    const invProduct = findInvoiceProduct(inv, selectedProduct);
    const invQty = invProduct?.quantity || remainingQty || 1;
    setCreditQuantity(Math.max(1, Math.min(remainingQty || 1, invQty)));
    setCreditNoteStep(3);
  }

  function handleAddProductToCredit() {
    setCreditNoteError("");
    if (!selectedInvoice || !selectedProduct) {
      setCreditNoteError("Моля, изберете фактура и продукт.");
      return;
    }
    const remainingQty = getRemainingForProduct(
      selectedProduct.productId,
      selectedProduct.refundQuantity
    );
    if (remainingQty <= 0) {
      setCreditNoteError("Този продукт вече е кредитиран изцяло.");
      return;
    }
    // Find product in invoice by barcode or productId
    const invProduct = findInvoiceProduct(selectedInvoice, selectedProduct);
    if (!invProduct) {
      setCreditNoteError("Този продукт не фигурира в избраната фактура или е бил вече кредитиран");
      return;
    }
    const maxQty = getMaxForSelection(selectedInvoice, selectedProduct);
    const qty = Math.max(1, Math.min(creditQuantity, maxQty));
    if (qty < 1 || qty > maxQty) {
      setCreditNoteError(`Бройката не може да бъде повече от наличните (${maxQty})`);
      return;
    }
    setCreditProducts([
      ...creditProducts,
      {
        ...invProduct,
        quantity: qty,
        invoiceId: selectedInvoice.id,
        productId: selectedProduct.productId,
        invoiceNumber: selectedInvoice.invoiceNumber,
      },
    ]);
    // Reset for next product
    setSelectedProduct(null);
    setSelectedInvoice(null);
    setCreditQuantity(1);
    setCreditNoteStep(1);
    setProductSearch("");
    setInvoiceSearchResults([]);
  }

  async function handleSaveCreditNote() {
    setSavingCreditNote(true);
    setCreditNoteError("");
    try {
      const res = await fetch("/api/credit-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refundId: refund.id, products: creditProducts }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Грешка при създаване на кредитно известие");
      }
      setCreditNoteDialogOpen(false);
      setCreditProducts([]);
      resetCreditNoteFlow();
      // Refresh summary
      fetch(`/api/credit-notes?refundId=${refund.id}`)
        .then((res) => res.json())
        .then(setCreditNotesSummary);
      toast.success("Кредитното известие беше създадено успешно.");
    } catch (err) {
      setCreditNoteError(err.message);
    } finally {
      setSavingCreditNote(false);
    }
  }

  return (
    <div className="container mx-auto">
      {/* <h1 className="text-3xl font-bold mb-6">Детайли за връщане</h1>
      <div className="mb-4 flex gap-4 items-center">
        <div>
          <div><b>Дата:</b> {new Date(refund.createdAt).toLocaleString("bg-BG")}</div>
          <div><b>Потребител:</b> {refund.user?.name || refund.user?.email || "-"}</div>
          <div><b>Източник:</b> {refund.sourceType} <Link href={sourceHref} className="text-blue-600 hover:underline ml-2">{refund.sourceName}</Link></div>
          {returned && returnedStorage && (
            <div className="mt-2 text-green-700">
              <b>Върнато в склад:</b> <Link href={`/dashboard/storages/${returnedStorage.id}`} className="text-blue-600 hover:underline">{returnedStorage.name}</Link> <span className="text-gray-600">({new Date(returnedAt).toLocaleString("bg-BG")})</span>
            </div>
          )}
        </div>
        <Button onClick={reactToPrintFn} className="ml-auto">Принтирай върнатите продукти</Button>
        <Button
          onClick={openReturnDialog}
          disabled={returned}
          variant={returned ? "secondary" : "default"}
        >
          {returned ? "Върнато в склад" : "Върни продуктите в склад"}
        </Button>
        <Button
          variant="outline"
          disabled={creatingCreditNote}
          onClick={async () => {
            setCreatingCreditNote(true);
            try {
              const res = await fetch('/api/credit-notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refundId: refund.id }),
              });
              if (!res.ok) throw new Error('Грешка при създаване на кредитно известие');
              // Always refresh the summary after generation
              fetch(`/api/credit-notes?refundId=${refund.id}`)
                .then(res => res.json())
                .then(setCreditNotesSummary);
            } catch (err) {
              toast.error(err.message);
            } finally {
              setCreatingCreditNote(false);
            }
          }}
        >
          {creatingCreditNote && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
          Кредитно известие
        </Button>
      </div> */}

      <BasicHeader
        hasBackButton
        title={`Връщане № ${displayRefundNumber || "-"}`}
        subtitle="Детайли за връщане и кредитни известия"
      >
          <Button onClick={reactToPrintFn} variant="outline">
            {" "}
            <Printer /> Принтирай
          </Button>
          <Button
            variant="outline"
            onClick={() => setCreditNoteDialogOpen(true)}
            disabled={creatingCreditNote}
          >
            <IconInvoice /> Кредитно известие
          </Button>
          <div className="h-6 w-px bg-gray-300"></div>

          <Button
            onClick={openReturnDialog}
            disabled={returned}
            variant={"default"}
          >
            <Warehouse />
            {returned ? "Върнато в склад" : "Върни продуктите в склад"}
          </Button>
      </BasicHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-lg">
              <CardTitle>Информация за връщането</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Номер на връщане
                </label>
                <p className="text-base font-medium">
                  № {displayRefundNumber || refund.id?.slice(-8)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Дата
                </label>
                <p className="text-base font-medium">
                  {new Date(refund.createdAt).toLocaleString("bg-BG")}
                </p>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Потребител
                </label>
                <p className="text-base font-medium">
                  {refund.user?.name || refund.user?.email || "-"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Източник
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {refund.sourceType}
                  </span>
                  <TableLink href={sourceHref}>{refund.sourceName}</TableLink>
                </div>
              </div>

              <div>
              <label className="text-sm font-medium text-gray-500 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Основание
                </label>
                <p className="text-base font-medium">
                  {refund.note ? <>{refund.note}</> : <>Няма Основание</>}
                </p>
              </div>

              {returned && returnedStorage && (
                <>
                  <Separator />
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Върнато в склад
                        </p>
                        <p className="text-xs text-green-600">
                          <span>{returnedStorage.name} </span>• (
                          {new Date(returnedAt).toLocaleString("bg-BG")})
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Върнати продукти</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={refund.refundProducts}
                filterableColumns={[
                  { id: "name", title: "Име на продукт" },
                  { id: "barcode", title: "Баркод на продукт" },
                  { id: "pcode", title: "Код на продукт" },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Избери склад за връщане</DialogTitle>
          </DialogHeader>
          <Select value={selectedStorage} onValueChange={setSelectedStorage}>
            <SelectTrigger>
              <SelectValue placeholder="Избери склад..." />
            </SelectTrigger>
            <SelectContent>
              {storages.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReturnDialogOpen(false)}
            >
              Отказ
            </Button>
            <Button
              onClick={handleReturnToStorage}
              disabled={!selectedStorage || returning}
            >
              {returning ? "Връщане..." : "Върни в склад"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Printable table */}
      <div
        ref={contentRef}
        className="hidden print:block bg-white p-8 text-black"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-bold">Връщане № {displayRefundNumber || refund.id.slice(-8)}</div>
          <div className="text-md">
            Дата: {new Date(refund.createdAt).toLocaleDateString("bg-BG")}
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="mb-2">
            <div className="font-semibold">Източник:</div>
            <div>Тип: {refund.sourceType}</div>
            <div>Име: {refund.sourceName}</div>
          </div>
          <div className="mb-2 text-right">
            <div className="font-semibold">Потребител:</div>
            <div>{refund.user?.name || refund.user?.email || "-"}</div>
            <div>Дата: {new Date(refund.createdAt).toLocaleString("bg-BG")}</div>
          </div>
        </div>
        <div className="mb-4">
          <div className="font-semibold">Основание за връщане:</div>
          <div>{refund.note || "Няма основание"}</div>
        </div>
        <table className="w-full border border-black mb-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black px-2 py-1">Име на продукта</th>
              <th className="border border-black px-2 py-1">EAN код</th>
              <th className="border border-black px-2 py-1">Количество</th>
              <th className="border border-black px-2 py-1">Единична цена с ДДС</th>
              <th className="border border-black px-2 py-1">Обща стойност</th>
            </tr>
          </thead>
          <tbody>
            {refund.refundProducts.map((rp) => {
              const price = rp.priceAtRefund ?? rp.product?.clientPrice ?? 0;
              const total = price * rp.quantity;
              return (
                <tr key={rp.id}>
                  <td className="border border-black px-2 py-1">{rp.product?.invoiceName || rp.product?.name || "-"}</td>
                  <td className="border border-black px-2 py-1">{rp.product?.barcode || "-"}</td>
                  <td className="border border-black px-2 py-1 text-center">{rp.quantity}</td>
                  <td className="border border-black px-2 py-1 text-right">{price.toFixed(2)}</td>
                  <td className="border border-black px-2 py-1 text-right">{total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-gray-100">
              <td className="p-2 border text-right" colSpan={2}>Общо:</td>
              <td className="p-2 border text-center">
                {refund.refundProducts.reduce((sum, rp) => sum + rp.quantity, 0)}
              </td>
              <td className="p-2 border"></td>
              <td className="p-2 border text-right">
                {refund.refundProducts.reduce((sum, rp) => {
                  const price = rp.priceAtRefund ?? rp.product?.clientPrice ?? 0;
                  return sum + (price * rp.quantity);
                }, 0).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
        <div className="mt-6">
          Изготвил: <b>{refund.user?.name || refund.user?.email || "-"}</b>
        </div>
        {returned && returnedStorage && (
          <div className="mt-4 p-3 border border-green-300 bg-green-50 rounded">
            <div className="font-semibold text-green-800">Върнато в склад:</div>
            <div>{returnedStorage.name}</div>
            <div className="text-sm text-green-600">
              Дата: {new Date(returnedAt).toLocaleString("bg-BG")}
            </div>
          </div>
        )}
      </div>
      {creditNotesSummary && creditNotesSummary.length > 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 mr-2 text-gray-700" />
                Кредитни известия към това връщане
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {creditNotesSummary.map((cn) => (
                  <div className="flex items-center space-x-3" key={cn.id}>
                    <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <TableLink href={`/dashboard/credit-notes/${cn.id}`}>
                        Кредитно известие №{cn.creditNoteNumber || cn.id?.slice(-6) || "—"}
                      </TableLink>
                      <div className="text-xs text-gray-500">
                        Дата: {new Date(cn.issuedAt).toLocaleDateString("bg-BG")}
                        {cn.totalValue && (
                          <> • Сума: {Number(cn.totalValue).toFixed(2)} лв.</>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog
        open={creditNoteDialogOpen}
        onOpenChange={(open) => {
          setCreditNoteDialogOpen(open);
          if (!open) resetCreditNoteFlow();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Създай кредитно известие</DialogTitle>
          </DialogHeader>
          {creditNoteStep === 1 && (
            <div>
              <div className="mb-2">Изберете продукт от връщането:</div>
              <div className="flex flex-col gap-2 mb-3">
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    placeholder="От дата"
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    placeholder="До дата"
                  />
                  <Button
                    variant="outline"
                    onClick={loadInvoicesForProducts}
                    disabled={loadingInvoices}
                  >
                    {loadingInvoices ? "Зарежда..." : "Покажи"}
                  </Button>
                </div>
                <Input
                  placeholder="Търси по име, баркод или pcode..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                />
              </div>
              <div className="max-h-40 overflow-y-auto mt-2">
                {filteredRefundProducts.map(rp => {
                  const productId = rp.product?.id || rp.productId;
                  const refundQty = rp.quantity;
                  const creditedQtyFromNotes = creditedByProductId[productId]?.total || 0;
                  const pendingQty = pendingCreditByProductId[productId] || 0;
                  const remainingQty = getRemainingForProduct(productId, refundQty);
                  const invoicesForProduct = invoiceLookup[productId] || [];
                  const hasInvoice = invoicesForProduct.length > 0;
                  const fullyCredited = remainingQty <= 0;
                  const partiallyCredited = !fullyCredited && (creditedQtyFromNotes > 0 || pendingQty > 0);
                  const isSelected = selectedProduct?.productId === productId;
                  const notesForProduct = creditedByProductId[productId]?.notes || [];
                  return (
                    <div
                      key={rp.id}
                      className={`p-2 border-b cursor-pointer flex items-start gap-2
                        ${isSelected ? 'bg-blue-100 border border-blue-500 rounded-sm' : ''}
                        ${fullyCredited ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                        ${invoicesShown && !hasInvoice ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}
                        ${partiallyCredited && !isSelected ? 'bg-yellow-50 border border-yellow-400 rounded-sm' : ''}
                        ${partiallyCredited && isSelected ? 'bg-yellow-100 border-2 border-yellow-500 rounded-sm' : ''}
                      `}
                      onClick={() => {
                        if (remainingQty <= 0) return;
                        if (invoicesShown && !hasInvoice) return;
                        setCreditNoteError("");
                        setSelectedProduct({
                          ...rp.product,
                          productId,
                          barcode: rp.product?.barcode,
                          refundQuantity: rp.quantity,
                        });
                        setCreditNoteStep(1);
                        setCreditQuantity(Math.max(1, Math.min(remainingQty, creditQuantity || 1)));
                        setSelectedInvoice(null);
                        setInvoiceSearchResults([]);
                      }}
                      style={fullyCredited ? { pointerEvents: 'none', opacity: 0.6 } : {}}
                    >
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="font-medium truncate">{rp.product?.name}</div>
                        <div className="text-xs text-gray-500 flex gap-2">
                          <span>{rp.product?.barcode}</span>
                          {rp.product?.pcode && <span>• {rp.product.pcode}</span>}
                        </div>
                        <div className="text-xs text-gray-500">Върнато: {refundQty} бр.</div>
                        <div className="text-xs text-gray-600">
                          Кредитирани: {creditedQtyFromNotes} бр.
                          {notesForProduct.length > 0 && (
                            <span className="ml-2 text-[11px] text-gray-500">
                              {notesForProduct.map((n, idx) => (
                                <span key={n.creditNoteId}>
                                  КИ №{n.creditNoteNumber || "—"} ({n.quantity} бр.){idx < notesForProduct.length - 1 ? ", " : ""}
                                </span>
                              ))}
                            </span>
                          )}
                        </div>
                        {pendingQty > 0 && (
                          <div className="text-xs text-blue-700">Предстои в текущото известие: {pendingQty} бр.</div>
                        )}
                        <div className="text-xs font-semibold text-gray-800">
                          Остава: {remainingQty} бр.
                        </div>
                        {invoicesShown && !hasInvoice && (
                          <div className="text-xs text-red-600 font-semibold">Не е във фактура</div>
                        )}
                      </div>
                      {fullyCredited && (
                        <span className="ml-auto text-green-600 text-xs font-semibold">Кредитирано</span>
                      )}
                      {!fullyCredited && (!invoicesShown || hasInvoice) && (
                        <span className="ml-auto text-xs font-semibold text-blue-700">Избери</span>
                      )}
                      {invoicesShown && !hasInvoice && (
                        <span className="ml-auto text-xs font-semibold text-gray-500">Не е във фактура</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <Button className="mt-2" onClick={handleSearchInvoices} disabled={!selectedProduct}>Търси във фактури</Button>
            </div>
          )}
          {creditNoteStep === 2 && (
            <div>
              <div className="mb-2">Изберете фактура за продукта:</div>
              <div className="max-h-40 overflow-y-auto mt-2">
                {invoiceSearchResults.map(inv => (
                  <div key={inv.id} className={`p-2 border-b cursor-pointer ${selectedInvoice?.id === inv.id ? 'bg-blue-100' : ''}`}
                    onClick={() => handleSelectInvoice(inv)}>
                    <div className="font-medium">Фактура № {inv.invoiceNumber}</div>
                    <div className="text-xs text-gray-500">Дата: {new Date(inv.issuedAt).toLocaleDateString('bg-BG')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {creditNoteStep === 3 && (
            <div>
              <div className="mb-2">Въведете бройка за кредитиране:</div>
              {selectedProduct && (
                <div className="text-xs text-gray-600 mb-1">
                  Оставащи за кредитиране:{" "}
                  {getRemainingForProduct(
                    selectedProduct.productId,
                    selectedProduct.refundQuantity
                  )}{" "}
                  бр.
                </div>
              )}
              {selectedInvoice && (
                <div className="text-xs text-gray-500 mb-1">
                  Фактура № {selectedInvoice.invoiceNumber || "—"}
                </div>
              )}
              {selectedProduct && (
                <div className="text-xs text-gray-500 mb-2">
                  {selectedProduct.barcode} {selectedProduct.name && `• ${selectedProduct.name}`}
                </div>
              )}
              {(() => {
                const maxQty =
                  selectedInvoice && selectedProduct
                    ? getMaxForSelection(selectedInvoice, selectedProduct)
                    : 1;
                return (
                  <Input
                    type="number"
                    min={1}
                    max={maxQty}
                    step={1}
                    value={creditQuantity}
                    onChange={(e) =>
                      setCreditQuantity(
                        Math.min(
                          Math.max(1, Number(e.target.value)),
                          maxQty
                        )
                      )
                    }
                  />
                );
              })()}
              <Button className="mt-2" onClick={handleAddProductToCredit}>Добави</Button>
            </div>
          )}
          {creditProducts.length > 0 && (
            <div className="mt-4">
              <div className="font-medium mb-2">Добавени продукти:</div>
              <ul className="space-y-2">
                {creditProducts.map((p, idx) => (
                  <li
                    key={`${p.productId}-${idx}`}
                    className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">{p.name || p.productName || "Продукт"}</span>
                      <span className="text-xs text-gray-500">{p.barcode}</span>
                      {p.invoiceId && (
                        <span className="text-xs text-gray-600">
                          Фактура № {p.invoiceNumber || p.invoiceId}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{p.quantity} бр.</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCreditProduct(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {creditNoteError && <div className="text-red-600 mt-2">{creditNoteError}</div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditNoteDialogOpen(false)}>Отказ</Button>
            <Button onClick={handleSaveCreditNote} disabled={savingCreditNote || creditProducts.length === 0}>
              {savingCreditNote ? "Запазване..." : "Запази"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
