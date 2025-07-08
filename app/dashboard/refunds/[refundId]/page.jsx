"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Send,
  User,
  Warehouse,
} from "lucide-react";
import { IconInvoice } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import TableLink from "@/components/ui/table-link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function RefundDetailPage() {
  const { refundId } = useParams();
  const router = useRouter();
  const [refund, setRefund] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();
  const handlePrint = useReactToPrint({ content: () => printRef.current });
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
      accessorKey: "product.name",
      header: "Име на продукта",
      cell: ({ row }) => row.original.product?.name || "-",
    },
    {
      accessorKey: "product.barcode",
      header: "Баркод",
      cell: ({ row }) => row.original.product?.barcode || "-",
    },
    {
      accessorKey: "quantity",
      header: "Количество",
      cell: ({ row }) => row.original.quantity,
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
    return (
      name.includes(productSearch.toLowerCase()) ||
      barcode.includes(productSearch.toLowerCase())
    );
  }) || [];

  // Step 2: Search invoices for selected product
  async function handleSearchInvoices() {
    setCreditNoteError("");
    if (!selectedProduct) {
      setCreditNoteError("Моля, изберете продукт от връщането.");
      return;
    }
    // Fetch last 5 invoices for this partner and product
    try {
      const res = await fetch(`/api/invoices?productId=${selectedProduct.productId}&partnerName=${encodeURIComponent(refund.partnerName || "")}`);
      if (!res.ok) throw new Error("Грешка при търсене на фактури");
      const data = await res.json();
      setInvoiceSearchResults(data.slice(0, 5));
      setCreditNoteStep(2);
    } catch (err) {
      setCreditNoteError("Грешка при търсене на фактури");
    }
  }

  // Step 3: Select invoice and enter quantity
  function handleSelectInvoice(inv) {
    setSelectedInvoice(inv);
    // Find product in invoice by barcode
    const invProduct = (Array.isArray(inv.products) ? inv.products : []).find(
      p => p.barcode === selectedProduct.barcode
    );
    setCreditQuantity(1);
    setCreditNoteStep(3);
  }

  function handleAddProductToCredit() {
    setCreditNoteError("");
    if (!selectedInvoice || !selectedProduct) {
      setCreditNoteError("Моля, изберете фактура и продукт.");
      return;
    }
    // Debug info
    console.log('DEBUG selectedProduct:', selectedProduct);
    console.log('DEBUG selectedInvoice.products:', selectedInvoice.products);
    // Find product in invoice by barcode
    const invProduct = (Array.isArray(selectedInvoice.products) ? selectedInvoice.products : []).find(
      p => p.barcode === selectedProduct.barcode
    );
    console.log('DEBUG invProduct found:', invProduct);
    if (!invProduct) {
      setCreditNoteError("Този продукт не фигурира в избраната фактура или е бил вече кредитиран");
      return;
    }
    // Check max quantity (simulate: invoice quantity - already credited)
    const maxQty = invProduct.quantity;
    if (creditQuantity < 1 || creditQuantity > maxQty) {
      setCreditNoteError(`Бройката не може да бъде повече от наличните във фактурата (${maxQty})`);
      return;
    }
    setCreditProducts([
      ...creditProducts,
      {
        ...invProduct,
        quantity: creditQuantity,
        invoiceId: selectedInvoice.id,
        productId: selectedProduct.id,
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
      setCreditNoteStep(1);
      setSelectedProduct(null);
      setSelectedInvoice(null);
      setCreditQuantity(1);
      setProductSearch("");
      setInvoiceSearchResults([]);
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
        <Button onClick={handlePrint} className="ml-auto">Принтирай върнатите продукти</Button>
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
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => router.push("/dashboard/revisions")}
          >
            {" "}
            {"<-"} Назад
          </Button>
          <div>
            <h1 className={`text-2xl text-gray-900 font-bold`}>
              Детайли за връщане
            </h1>
            <p className="text-gray-600">Преглед на върнати продукти</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* {invoice ? (
            <Button variant="outline" onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}>
              Виж фактура
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(true)} disabled={invoiceLoading}>
              <IconInvoice />
              {invoiceLoading ? 'Обработка...' : 'Фактура'}
            </Button>
          )} */}
          {/* <Button variant="outline" onClick={() => router.push(`/dashboard/revisions/${revisionId}/edit`)}><EditIcon /> Редактирай</Button> */}
          <Button onClick={handlePrint} variant="outline">
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-lg">
              <CardTitle>Информация за връщането</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                searchKey="product.name"
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
        ref={printRef}
        className="hidden print:block bg-white p-8 text-black"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-bold">Върнати продукти</div>
          <div className="text-md">
            Дата: {new Date(refund.createdAt).toLocaleDateString("bg-BG")}
          </div>
        </div>
        <div className="mb-2">
          <b>Източник:</b> {refund.sourceType} - {refund.sourceName}
        </div>
        <table className="w-full border border-black mb-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black px-2 py-1">Име на продукта</th>
              <th className="border border-black px-2 py-1">EAN код</th>
              <th className="border border-black px-2 py-1">Количество</th>
            </tr>
          </thead>
          <tbody>
            {refund.refundProducts.map((rp) => (
              <tr key={rp.id}>
                <td className="border border-black px-2 py-1">
                  {rp.product?.name || "-"}
                </td>
                <td className="border border-black px-2 py-1">
                  {rp.product?.barcode || "-"}
                </td>
                <td className="border border-black px-2 py-1 text-center">
                  {rp.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
              <div className="flex items-center justify-between bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex flex-col gap-3">
                  {creditNotesSummary.map((cn) => (
                    <div className="flex items-center space-x-3" key={cn.id}>
                      <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-gray-600" />
                      </div>

                      <div key={cn.id}>
                        <TableLink href={`/dashboard/credit-notes/${cn.id}`}>
                          Кредитно известие {cn.creditNoteNumber}
                        </TableLink>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={creditNoteDialogOpen} onOpenChange={setCreditNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Създай кредитно известие</DialogTitle>
          </DialogHeader>
          {creditNoteStep === 1 && (
            <div>
              <div className="mb-2">Изберете продукт от връщането:</div>
              <Input
                placeholder="Търси по име или баркод..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
              />
              <div className="max-h-40 overflow-y-auto mt-2">
                {filteredRefundProducts.map(rp => {
                  const refundQty = rp.quantity;
                  const creditedQty = creditProducts
                    .filter(p => p.productId === rp.product?.id)
                    .reduce((sum, p) => sum + (p.quantity || 0), 0);
                  const fullyCredited = creditedQty >= refundQty;
                  const partiallyCredited = creditedQty > 0 && creditedQty < refundQty;
                  const isSelected = selectedProduct?.id === rp.product?.id;
                  return (
                    <div
                      key={rp.id}
                      className={`p-2 border-b cursor-pointer flex items-center gap-2
                        ${isSelected ? 'bg-blue-100 border border-blue-500 rounded-sm' : ''}
                        ${fullyCredited ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
                        ${partiallyCredited && !isSelected ? 'bg-yellow-50 border border-yellow-400 rounded-sm' : ''}
                        ${partiallyCredited && isSelected ? 'bg-yellow-100 border-2 border-yellow-500 rounded-sm' : ''}
                      `}
                      onClick={() => {
                        if (!fullyCredited) setSelectedProduct(rp.product);
                      }}
                      style={fullyCredited ? { pointerEvents: 'none', opacity: 0.6 } : {}}
                    >
                      <div className="font-medium">{rp.product?.name}</div>
                      <div className="text-xs text-gray-500">{rp.product?.barcode}</div>
                      <div className="ml-2 text-xs text-gray-500">{creditedQty} / {refundQty}</div>
                      {fullyCredited && (
                        <span className="ml-auto text-green-600 text-xs font-semibold">Добавен</span>
                      )}
                      {partiallyCredited && !fullyCredited && (
                        <span className="ml-auto text-yellow-700 text-xs font-semibold">Остава {refundQty - creditedQty}</span>
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
              <Input
                type="number"
                min={1}
                max={selectedInvoice ? (Array.isArray(selectedInvoice.products) ? (selectedInvoice.products.find(p => p.productId === selectedProduct.productId)?.quantity || 1) : 1) : 1}
                value={creditQuantity}
                onChange={e => setCreditQuantity(Number(e.target.value))}
              />
              <Button className="mt-2" onClick={handleAddProductToCredit}>Добави</Button>
            </div>
          )}
          {creditProducts.length > 0 && (
            <div className="mt-4">
              <div className="font-medium mb-2">Добавени продукти:</div>
              <ul>
                {creditProducts.map((p, idx) => (
                  <li key={idx}>{p.name} - {p.quantity} бр.</li>
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
