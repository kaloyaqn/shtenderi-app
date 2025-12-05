"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  EditIcon,
  Printer,
  Send,
  Truck,
  AlertTriangle,
} from "lucide-react";
import { IconBox, IconInvoice } from "@tabler/icons-react";
import LoadingScreen from "@/components/LoadingScreen";
import { useSession } from "@/lib/session-context";

import BasicHeader from "@/components/BasicHeader";

import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import RevisionProductsTable from "./_components/RevisionProductsTable";
import CreatePaymentRevisionForm from "@/components/forms/payments-revision/CreatePaymentRevisionForm";
import PaymentsTable from "@/components/tables/revisions/PaymentsTable";
import MobilePageRevisionId from "@/components/mobile/revisions/revisionId/MobilePage";
import PaymentsCardMobile from "@/components/mobile/revisions/revisionId/PaymentsCardMobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { downloadPdf } from "@/lib/print/prints";

export default function RevisionDetailPage() {
  const params = useParams();
  const { revisionId } = params;
  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resupplyDialogOpen, setResupplyDialogOpen] = useState(false);
  const [storages, setStorages] = useState([]);
  const [selectedStorage, setSelectedStorage] = useState("");
  const [selectedCashRegister, setSelectedCashRegister] = useState("");
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [storageProducts, setStorageProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedAddProduct, setSelectedAddProduct] = useState(null);
  const [addProductQuantity, setAddProductQuantity] = useState(1);
  const [addProductLoading, setAddProductLoading] = useState(false);
  const [resupplyErrors, setResupplyErrors] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const router = useRouter();
  const { data: session } = useSession();
  const [repeatDialogOpen, setRepeatDialogOpen] = useState(false);
  const [stands, setStands] = useState([]);
  const [selectedRepeatStand, setSelectedRepeatStand] = useState("");
  const [repeatLoading, setRepeatLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [userId, setUserId] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cashRegisters, setCashRegisters] = useState([]);
  const [unscannedProducts, setUnscannedProducts] = useState([]); // Products that weren't scanned in sale mode
  // --- Desktop only: payments state and fetch (must be at top for hook order) ---
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const res = await fetch(`/api/revisions/${revisionId}/payments`); // <-- use new endpoint
      if (!res.ok) throw new Error("Failed to fetch payments");
      const data = await res.json();
      setPayments(data);
    } catch (error) {
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    if (revisionId) fetchPayments();
  }, [revisionId]);
  // TODO: fetch revision details, including storageId
  const storageId = revision?.storageId || "";

  const contentRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const fetchRevisionData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/revisions/${revisionId}`);
      if (!res.ok) throw new Error("Failed to fetch revision");
      const data = await res.json();
      setRevision(data);

      // If this revision was created from a check, fetch all missing products from the check
      if (data.checkId) {
        try {
          const checkRes = await fetch(`/api/stands/${data.standId}/checks/${data.checkId}`);
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            console.log('Check data:', checkData);
            // Find ALL products that were missing from the check (not just unscanned ones)
            const soldProductIds = data.missingProducts.map(mp => mp.productId);
            const allMissingFromCheck = checkData.checkedProducts.filter(cp =>
              cp.quantity > 0 && !soldProductIds.includes(cp.productId)
            );
            console.log('Missing from check:', {
              soldProductIds,
              allMissingFromCheck,
              checkProducts: checkData.checkedProducts
            });
            console.log('Sample unscanned product:', allMissingFromCheck[0]);
            setUnscannedProducts(allMissingFromCheck);
          }
        } catch (error) {
          console.error("Failed to fetch missing products from check:", error);
        }
      }
    } catch (error) {
      console.error("Failed to fetch revision:", error);
      toast.error("Failed to load revision data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (revisionId) {
      fetchRevisionData();
    }
  }, [revisionId]);

  useEffect(() => {
    // Fetch storages when the resupply dialog is considered
    if (resupplyDialogOpen) {
      fetch("/api/storages")
        .then((res) => res.json())
        .then(setStorages)
        .catch(() => toast.error("Failed to load storages"));
    }
  }, [resupplyDialogOpen]);

  useEffect(() => {
    if (addProductDialogOpen && selectedStorage && revision?.stand?.id) {
      fetch(
        `/api/storages/${selectedStorage}/products-not-on-stand/${revision.stand.id}`
      )
        .then((res) => res.json())
        .then(setStorageProducts)
        .catch(() => setStorageProducts([]));
    }
  }, [addProductDialogOpen, selectedStorage, revision?.stand?.id]);

  // Fetch invoice for this revision
  useEffect(() => {
    if (revision && revision.number) {
      fetch(`/api/invoices?revisionNumber=${revision.number}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) setInvoice(data[0]);
          else setInvoice(null);
        })
        .catch(() => setInvoice(null));
    }
  }, [revision?.number]);

  // Fetch stands for repeat dialog
  useEffect(() => {
    if (repeatDialogOpen) {
      fetch("/api/stands")
        .then((res) => res.json())
        .then(setStands)
        .catch(() => toast.error("Грешка при зареждане на щандове."));
    }
  }, [repeatDialogOpen]);

  useEffect(() => {
    // Fetch all storages for this partner or store
    if (revision?.partnerId) {
      fetch(`/api/partners/${revision.partnerId}/storages`)
        .then((res) => res.json())
        .then(setStorages);
    } else if (revision?.storeId) {
      fetch(`/api/stores/${revision.storeId}/storages`)
        .then((res) => res.json())
        .then(setStorages);
    }
  }, [revision?.partnerId, revision?.storeId]);

  useEffect(() => {
    // Fetch all cash registers
    fetch("/api/cash-registers")
      .then((res) => res.json())
      .then(setCashRegisters);
  }, []);

  const handleResupply = async () => {
    if (!selectedStorage) {
      toast.error("Моля, изберете склад.");
      return;
    }
    setResupplyErrors([]);
    try {
      const response = await fetch(`/api/revisions/${revisionId}/resupply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storageId: selectedStorage }),
      });
      if (response.status === 409) {
        const data = await response.json();
        setResupplyErrors(data.insufficient || []);
        return;
      }
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to resupply from storage");
      }
      toast.success("Щандът е зареден успешно!");
      setResupplyDialogOpen(false);
      setResupplyErrors([]);
      fetchRevisionData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAddProduct = async () => {
    if (!selectedAddProduct || !addProductQuantity) return;
    setAddProductLoading(true);
    try {
      const res = await fetch(`/api/revisions/${revisionId}/add-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedAddProduct.id,
          standId: revision.stand.id,
          quantity: Number(addProductQuantity),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Продуктът е добавен към щанда и ревизията!");
      setAddProductDialogOpen(false);
      setSelectedAddProduct(null);
      setAddProductQuantity(1);
      fetchRevisionData();
    } catch (e) {
      toast.error(e.message || "Грешка при добавяне на продукт");
    } finally {
      setAddProductLoading(false);
    }
  };

  // Helper to get the print table HTML
  const getPrintTableHtml = () => {
    const el = contentRef.current;
    return el ? el.outerHTML : "";
  };

  const handlePrintStock = async () => {
    const email = revision.stand?.email;
    if (email) {
      try {
        const html = getPrintTableHtml();
        await fetch("/api/send-stock-receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, html, saleNumber: revision.number }),
        });
      } catch (err) {
        // Optionally show a toast or ignore
      }
    }
    reactToPrintFn();
  };

  const handleSendToClient = async () => {
    const email = revision.stand?.email;
    if (!email) {
      toast.error("Щандът няма имейл.");
      return;
    }
    try {
      const html = getPrintTableHtml();
      const res = await fetch("/api/send-stock-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, html, saleNumber: revision.number }),
      });
      if (!res.ok) throw new Error("Грешка при изпращане на имейл");
      toast.success("Стоковата разписка е изпратена на клиента!");
    } catch (err) {
      toast.error(err.message || "Грешка при изпращане на имейл");
    }
  };

  const handleCreateAndGoToInvoices = async () => {
    if (!paymentMethod) {
      toast.error("Моля, изберете начин на плащане.");
      return;
    }
    setInvoiceLoading(true);
    try {
      const res = await fetch("/api/invoices?type=revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revisionId, paymentMethod }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsPaymentModalOpen(false);
        router.push(`/dashboard/invoices/${data.id}`);
      } else {
        toast.error("Грешка при създаване на фактура.");
      }
    } catch (e) {
      toast.error("Грешка при създаване на фактура.");
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleRepeatSale = async () => {
    if (!selectedRepeatStand || !session?.user?.id) {
      toast.error("Моля, изберете щанд.");
      return;
    }
    setRepeatLoading(true);
    try {
      const res = await fetch(`/api/revisions/${revisionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          standId: selectedRepeatStand,
          userId: session.user.id,
        }),
      });
      if (!res.ok) throw new Error("Грешка при създаване на нова продажба.");
      const data = await res.json();
      toast.success("Продажбата е повторена успешно!");
      setRepeatDialogOpen(false);
      router.push(`/dashboard/revisions/${data.id}`);
    } catch (err) {
      toast.error(err.message || "Грешка при повторение на продажбата.");
    } finally {
      setRepeatLoading(false);
    }
  };

  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllActions, setShowAllActions] = useState(false);
  // Add-after-sale UI state
  const [appendOpen, setAppendOpen] = useState(false);
  const [appendSourceId, setAppendSourceId] = useState("");
  const [appendBarcode, setAppendBarcode] = useState("");
  const [appendItems, setAppendItems] = useState([]); // {productId, name, barcode, quantity}
  const [appendBusy, setAppendBusy] = useState(false);
  const [appendSourceStock, setAppendSourceStock] = useState({});

  // Load storages when append dialog opens (ensures dropdown is populated)
  useEffect(() => {
    if (!appendOpen) return;
    fetch('/api/storages')
      .then(res => res.json())
      .then(setStorages)
      .catch(() => setStorages([]));
  }, [appendOpen]);

  // Load stock for selected source to show available quantities and cap input
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
      await fetchRevisionData();
    } catch (e) { toast.error(e.message); }
    finally { setAppendBusy(false); }
  };

  if (loading) return <LoadingScreen />;
  if (!revision) return <div>Ревизията не е намерена.</div>;

  // Calculate total paid for this revision
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  // Calculate total price of revision
  const totalRevisionPrice =
    revision?.missingProducts?.reduce((sum, mp) => {
      const price = mp.priceAtSale ?? mp.product?.clientPrice ?? 0;
      const quantity = mp.givenQuantity ?? mp.missingQuantity ?? 0;
      return sum + price * quantity;
    }, 0) || 0;

  // Prepare data for mobile (include both sold and unscanned products)
  const soldProductsForMobile = revision.missingProducts.map((mp) => ({
    ...mp,
    name: mp.product?.name || "-",
    barcode: mp.product?.barcode || "-",
    givenQuantity: mp.givenQuantity,
    isSold: true,
  }));

  const unscannedProductsDataForMobile = unscannedProducts.map((cp) => ({
    id: cp.id,
    productId: cp.productId,
    product: cp.product,
    missingQuantity: cp.originalQuantity || cp.quantity,
    givenQuantity: 0, // Not scanned
    priceAtSale: cp.product?.clientPrice || 0,
    name: cp.product?.name || "-",
    barcode: cp.product?.barcode || "-",
    isSold: false, // Not sold
  }));

  const dataForMobile = [...soldProductsForMobile, ...unscannedProductsDataForMobile];
  const filteredProductsForMobile = dataForMobile.filter(
    (mp) =>
      !searchTerm ||
      mp.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mp.product?.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isMobile) {
    return (
      <MobilePageRevisionId
        handleSendToClient={handleSendToClient}
        totalPaid={totalPaid}
        totalRevisionPrice={totalRevisionPrice}
        fetchPayments={fetchPayments}
        revisionId={revisionId}
        filteredProducts={filteredProductsForMobile}
        handlePrintStock={handlePrintStock}
        revision={revision}
        contentRef={contentRef}
        payments={payments}
      />
    );
  }

  // Overpayment check
  const enteredAmount = parseFloat(amount) || 0;
  const willOverpay = enteredAmount + totalPaid > totalRevisionPrice;
  const isFullyPaid = totalPaid >= totalRevisionPrice;

  const columns = [
    {
      id: "name",
      accessorKey: "name",
      header: "Име",
      cell: ({ row }) => row.original.product?.name || "-",
    },
    {
      id: "pcode",
      accessorKey: "pcode",
      header: "",
      cell: ({ row }) => <span className="text-[0px]"> {row.original.product?.pcode || "-"}</span>

    },
    {
      id:"barcode",
      accessorKey: "barcode",
      header: "Баркод",
      cell: ({ row }) => row.original.product?.barcode || "-",
    },
    {
      accessorKey: "missingQuantity",
      header: "Брой",
      cell: ({ row }) => {
        const mp = row.original;
        const hasDiscrepancy = mp.givenQuantity !== null && mp.givenQuantity !== mp.missingQuantity;
        const isUnscanned = !mp.isSold;

        return (
          <div className={`${hasDiscrepancy || isUnscanned ? "text-red-600 font-semibold" : ""} ${isUnscanned ? "bg-red-50 p-1 rounded" : ""}`}>
            {hasDiscrepancy ? (
              <div>
                <div>{mp.givenQuantity}</div>
                <div className="text-xs text-red-500">(искано: {mp.missingQuantity})</div>
              </div>
            ) : isUnscanned ? (
              <div>
                <div>{mp.missingQuantity}</div>
                <div className="text-xs text-red-500">(не наличен)</div>
              </div>
            ) : (
              mp.missingQuantity
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "priceAtSale",
      header: "Цена при продажба",
      cell: ({ row }) => {
        const price =
          row.original.priceAtSale ?? row.original.product?.clientPrice;
        return price !== undefined ? `${price.toFixed(2)} лв.` : "-";
      },
    },
  ];

  // Flatten data for DataTable - include both sold and unscanned products
  const soldProducts = revision.missingProducts.map((mp) => ({
    ...mp,
    name: mp.product?.name || "-",
    pcode: mp.product?.pcode || "-",
    barcode: mp.product?.barcode || "-",
    givenQuantity: mp.givenQuantity,
    isSold: true,
  }));

  const unscannedProductsData = unscannedProducts.map((cp) => ({
    id: cp.id,
    productId: cp.productId,
    product: cp.product,
    missingQuantity: cp.quantity, // Use quantity (missing from check), not originalQuantity
    givenQuantity: 0, // Not scanned
    priceAtSale: cp.product?.clientPrice || 0,
    name: cp.product?.name || "-",
    barcode: cp.product?.barcode || "-",
    isSold: false, // Not sold
  }));

  const data = [...soldProducts, ...unscannedProductsData];

  // Debug logging
  console.log('Revision data:', {
    revisionId: revision?.id,
    checkId: revision?.checkId,
    soldProductsCount: soldProducts.length,
    unscannedProductsCount: unscannedProductsData.length,
    totalDataCount: data.length,
    soldProducts: soldProducts,
    unscannedProducts: unscannedProductsData
  });

  // Filter products for mobile search (include both sold and unscanned products)
  const filteredProducts = data.filter(
    (mp) =>
      !searchTerm ||
      mp.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mp.product?.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasMissingProducts =
    revision.missingProducts && revision.missingProducts.length > 0;
  const hasUnscannedProducts = unscannedProducts.length > 0;

  // Calculate totals for print table (only sold products)
  const totalQuantity = revision.missingProducts.reduce(
    (sum, mp) => {
      // Use givenQuantity if available (for sale mode), otherwise use missingQuantity
      const quantity = mp.givenQuantity !== null ? mp.givenQuantity : mp.missingQuantity;
      return sum + quantity;
    },
    0
  );
  const totalValue = revision.missingProducts.reduce(
    (sum, mp) => {
      // Use givenQuantity if available (for sale mode), otherwise use missingQuantity
      const quantity = mp.givenQuantity !== null ? mp.givenQuantity : mp.missingQuantity;
      return sum + quantity * (mp.product?.clientPrice || 0);
    },
    0
  );
  const adminName = revision.user?.name || revision.user?.email || "";

  async function handlePayment(e) {
    e.preventDefault();
    setPaymentLoading(true);
    setSuccess(false);
    await fetch(`/api/cash-registers/${selectedCashRegister}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(amount),
        method,
        revisionId,
        userId: session?.user?.id,
      }),
    });
    setPaymentLoading(false);
    setSuccess(true);
    setAmount("");
    fetchPayments(); // refetch payments after new payment
  }

  const isAmountInvalid = isNaN(parseFloat(amount)) || parseFloat(amount) <= 0;

  return (
    <div className="container mx-auto">
      {/* <div className="flex justify-between items-center mb-8">
      <div className='flex items-center gap-2'>
      <Button variant="ghost" size='sm' className='text-xs' onClick={() => router.push('/dashboard/revisions')}> {"<-"} Назад</Button>
      <h1 className={`text-2xl text-gray-900 font-bold`}>Продажба #{revision.number}</h1>
      </div>

      </div> */}

      <BasicHeader
        hasBackButton
        title={`Продажба #${revision.number}`}
        subtitle="Всички данни за твоята продажба"
      >

        <Button onClick={handleSendToClient} variant="outline">
          {" "}
          <Send /> Изпрати
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsPaymentModalOpen(true)}
          disabled={invoiceLoading}
        >
          <IconInvoice />
          {invoiceLoading ? "Обработка..." : "Фактура"}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/revisions/${revisionId}/edit`)}
        >
          <EditIcon /> Редактирай
        </Button>
        <Button variant="outline" onClick={() => setAppendOpen(true)}><IconBox /> Добави</Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/revisions/${revisionId}/refund`)}
        >
          <AlertTriangle /> Рекламация
        </Button>
        {/* <Button variant="outline" onClick={() => setRepeatDialogOpen(true)}>
          <Repeat />  Повтори продажба
          </Button> */}
        <div className="h-6 w-px bg-gray-300"></div>

        {/* <Button variant="default" onClick={() => setResupplyDialogOpen(true)}>
          <Truck /> Зареди от склад
        </Button> */}

{/* <Button variant={""} onClick={handlePrintStock}>
          <Printer /> Принтирай
        </Button>*/}

        <Button
          onClick={() => downloadPdf(revision, "Test")}
        >
        <Printer />  Принтирай
        </Button>
      </BasicHeader>

      <div className="">
        <div className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-2">
            <div className="lg:col-span-1 order-2 lg:order-1 sticky top-2 self-start z-10">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg">
                    Информация за поръчката
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Номер
                      </label>
                      <p className="text-lg font-semibold">
                        #{revision.number}
                      </p>
                    </div>
                    {/* <div>
                    <label className="text-sm font-medium text-gray-500">Статус</label>
                    <Badge variant="secondary" className="mt-1">
                      Активна
                    </Badge>
                  </div> */}
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Партньор
                    </label>
                    <p className="text-base font-medium">
                      {revision.partner?.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Щанд
                      </label>
                      <p className="text-base">
                        {revision.stand?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Магазин
                      </label>
                      <p className="text-base">
                        {revision.store?.name || "N/A"}{" "}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Тип
                      </label>
                      <p className="text-base">{revision.type || "N/A"} </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Ревизор
                    </label>
                    <p className="text-base">
                      {revision.user?.name || revision.user?.email || "N/A"}
                    </p>
                  </div>

                  {revision.checkId && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Свързана проверка
                      </label>
                      <p className="text-base font-mono text-sm">
                        #{revision.checkId.slice(-8)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className={"mt-2"}>
                <CardHeader>
                  <CardTitle>Плащания към тази продажба</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-1">
                    {payments.map((payment) => (
                      <PaymentsCardMobile key={payment.id} payment={payment} />
                    ))}
                  </div>
                </CardContent>
              </Card>
              <CreatePaymentRevisionForm
                totalPaid={totalPaid}
                totalRevisionPrice={totalRevisionPrice}
                fetchPayments={fetchPayments}
                revisionId={revisionId}
                revision={revision}
              />
            </div>

            <div
              ref={contentRef}
              className="lg:col-span-2 order-1 lg:order-2 gap-2 flex flex-col"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base lg:text-lg">
                      Продукти от продажбата
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {(hasMissingProducts && hasUnscannedProducts) && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Несканирани
                        </Badge>
                      )}
                      <Badge variant="outline">{data.length} продукта</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {data.length > 0 ? (
                    <>
                      {/* Warning for missing products from check */}
                      {hasUnscannedProducts && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                          <div className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Някои продукти от проверката не са били налични за продажба. Те са показани в червено и не са включени в продажбата.
                            </span>
                          </div>
                        </div>
                      )}
                      <DataTable
                        columns={columns}
                        data={data}
                        filterableColumns={[
                          { id: "name", title: "Име на продукт" },
                          { id: "barcode", title: "Баркод на продукт" },
                          { id: "pcode", title: "Код на продукт" },
                        ]}
                        rowClassName={(row) => {
                          const mp = row.original;
                          const hasDiscrepancy = mp.givenQuantity !== null && mp.givenQuantity !== mp.missingQuantity;
                          const isUnscanned = !mp.isSold;
                          return hasDiscrepancy || isUnscanned ? "bg-red-50 border-l-4 border-l-red-500" : "";
                        }}
                      />
                      {/* Payment form under DataTable */}
                      {/* <form
                        className="mt-6 p-4 border rounded bg-gray-50"
                        onSubmit={handlePayment}
                      >
                        <h3 className="font-semibold mb-2">
                          Добави плащане към тази продажба
                        </h3>
                        <div className="mb-2 flex items-center gap-2">
                          <label className="block mb-1">Сума</label>
                          <span className="text-xs text-gray-500">
                            {totalPaid.toFixed(2)}/
                            {totalRevisionPrice.toFixed(2)}
                          </span>
                        </div>
                        <Input
                          type="number"
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          required
                          min="0.01"
                          disabled={isFullyPaid}
                        />
                        {isAmountInvalid && (
                          <div className="text-red-600 text-xs mt-1">
                            Сумата трябва да е положително число!
                          </div>
                        )}
                        {isFullyPaid && (
                          <div className="text-green-700 text-xs mt-1">
                            Продажбата е напълно платена.
                          </div>
                        )}
                        <div className="mb-2">
                          <label className="block mb-1">Метод</label>
                          <Select value={method} onValueChange={setMethod}>
                            <SelectTrigger>
                              <SelectValue placeholder="Избери метод" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CASH">В брой</SelectItem>
                              <SelectItem value="BANK">Банка</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="mb-2">
                          <label className="block mb-1">Каса (склад)</label>
                          <Select
                            value={selectedCashRegister}
                            onValueChange={setSelectedCashRegister}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Избери каса" />
                            </SelectTrigger>
                            <SelectContent>
                              {cashRegisters.map((cr) => (
                                <SelectItem key={cr.id} value={cr.storageId}>
                                  {cr.storage?.name || cr.storageId}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            type="submit"
                            disabled={
                              paymentLoading ||
                              willOverpay ||
                              isAmountInvalid ||
                              isFullyPaid
                            }
                          >
                            {paymentLoading ? "Обработка..." : "Добави плащане"}
                          </Button>
                        </div>
                        {success && (
                          <div className="mt-2 text-green-700">
                            Плащането е успешно!
                          </div>
                        )}
                      </form> */}
                    </>
                  ) : (
                    <p>Няма регистрирани продажби.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={resupplyDialogOpen}
        onOpenChange={(open) => {
          setResupplyDialogOpen(open);
          if (!open) setResupplyErrors([]);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Зареждане на щанд от склад</DialogTitle>
            <DialogDescription>
              Изберете от кой склад да заредите продадените количества.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select onValueChange={setSelectedStorage} value={selectedStorage}>
              <SelectTrigger>
                <SelectValue placeholder="Избери склад..." />
              </SelectTrigger>
              <SelectContent>
                {storages.map((storage) => (
                  <SelectItem key={storage.id} value={storage.id}>
                    {storage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {resupplyErrors.length > 0 && (
            <div className="bg-red-100 border border-red-400 text-red-800 rounded p-4 mb-4">
              <div className="font-semibold mb-2">
                Недостатъчна наличност за следните продукти:
              </div>
              <ul className="list-disc pl-5">
                {resupplyErrors.map((err, idx) => (
                  <li key={idx}>
                    {err.name} ({err.barcode}) — Изискват се: {err.required},
                    налични: {err.available}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResupplyDialogOpen(false)}
            >
              Отказ
            </Button>
            <Button onClick={handleResupply}>Зареди</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog
        open={addProductDialogOpen}
        onOpenChange={setAddProductDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Добави нов продукт към продажбата</DialogTitle>
            <DialogDescription>
              Изберете продукт от склада, който не е на щанда, и въведете
              количество.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Command>
              <CommandInput
                placeholder="Търси по име или баркод..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                <CommandEmpty>Няма намерени продукти.</CommandEmpty>
                {storageProducts
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(search.toLowerCase()) ||
                      (p.barcode &&
                        p.barcode.toLowerCase().includes(search.toLowerCase()))
                  )
                  .slice(0, 10)
                  .map((product) => (
                    <CommandItem
                      key={product.id}
                      value={product.name + " " + product.barcode}
                      onSelect={() => {
                        setSelectedAddProduct(product);
                        setSearch(product.name + " (" + product.barcode + ")");
                      }}
                    >
                      {product.name}{" "}
                      <span className="text-xs text-muted-foreground">
                        ({product.barcode})
                      </span>
                    </CommandItem>
                  ))}
              </CommandList>
            </Command>
            {selectedAddProduct && (
              <div>
                <label
                  htmlFor="addProductQuantity"
                  className="block text-sm font-medium mb-1"
                >
                  Количество
                </label>
                <input
                  id="addProductQuantity"
                  type="number"
                  min={1}
                  value={addProductQuantity}
                  onChange={(e) => setAddProductQuantity(e.target.value)}
                  className="border rounded px-2 py-1 w-24"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddProductDialogOpen(false)}
              disabled={addProductLoading}
            >
              Отказ
            </Button>
            <Button
              onClick={handleAddProduct}
              disabled={!selectedAddProduct || addProductLoading}
            >
              {addProductLoading ? "Добавяне..." : "Добави"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Payment Method Dialog */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Избор на начин на плащане</DialogTitle>
            <DialogDescription>
              Моля, изберете как е платена тази фактура.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              onValueChange={setPaymentMethod}
              defaultValue={paymentMethod}
            >
              <SelectTrigger>
                <SelectValue placeholder="Избери начин на плащане..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">В брой</SelectItem>
                <SelectItem value="CARD">Банка</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              Отказ
            </Button>
            <Button
              onClick={handleCreateAndGoToInvoices}
              disabled={invoiceLoading}
            >
              {invoiceLoading ? "Създаване..." : "Създай фактура"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Append-after-sale dialog (desktop) */}
      {!isMobile && (
      <Dialog open={appendOpen} onOpenChange={setAppendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добави продукти към продажбата</DialogTitle>
            <DialogDescription>
              Сканирай баркодове и задай количества. Задължително избери източник (склад).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Източник (склад)</label>
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
              <label className="text-sm text-gray-600">Баркод</label>
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
                    </tr>
                  ))}
                  {appendItems.length === 0 && (
                    <tr><td className="px-2 py-2 text-gray-500" colSpan={4}>Няма добавени продукти</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAppendOpen(false)} disabled={appendBusy}>Отказ</Button>
            <Button onClick={submitAppend} disabled={appendBusy || appendItems.length === 0}>{appendBusy ? 'Добавяне...' : 'Добави'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}

      {/* Append-after-sale drawer (mobile) */}
      {isMobile && (
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
                <label className="text-sm text-gray-600">Източник (склад)</label>
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
                <label className="text-sm text-gray-600">Баркод</label>
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
                      </tr>
                    ))}
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
      )}
      {/* Print-only stock receipt table */}
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
          Изготвил: <b>{adminName}</b>
        </div>
      </div>
      {/* Repeat Sale Dialog */}
      {/* <Dialog open={repeatDialogOpen} onOpenChange={setRepeatDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Повтори продажба</DialogTitle>
            <DialogDescription>
              Изберете щанд, от който да повторите продажбата. Ще се създаде
              нова продажба с нов номер.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              onValueChange={setSelectedRepeatStand}
              value={selectedRepeatStand}
            >
              <SelectTrigger>
                <SelectValue placeholder="Избери щанд..." />
              </SelectTrigger>
              <SelectContent>
                {stands.map((stand) => (
                  <SelectItem key={stand.id} value={stand.id}>
                    {stand.name}{" "}
                    {stand.store?.name ? `(${stand.store.name})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRepeatDialogOpen(false)}
              disabled={repeatLoading}
            >
              Отказ
            </Button>
            <Button
              onClick={handleRepeatSale}
              disabled={!selectedRepeatStand || repeatLoading}
            >
              {repeatLoading ? "Създаване..." : "Повтори"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            className="bg-white p-6 rounded shadow-md min-w-[300px]"
            onSubmit={handlePayment}
          >
            <h2 className="text-lg font-bold mb-2">Make Payment</h2>
            <div className="mb-2 flex items-center gap-2">
              <label className="block mb-1">Amount</label>
              <span className="text-xs text-gray-500">
                {amount || 0}/{totalRevisionPrice}
              </span>
            </div>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border px-2 py-1 w-full"
              required
            />
            <div className="mb-2">
              <label className="block mb-1">Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="border px-2 py-1 w-full"
              >
                <option value="CASH">Cash</option>
                <option value="BANK">Bank</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block mb-1">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="border px-2 py-1 w-full"
                required
              />
              {/* TODO: Replace with user picker or use current session user */}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-1 rounded"
                disabled={paymentLoading}
              >
                {paymentLoading ? "Processing..." : "Submit"}
              </button>
              <button
                type="button"
                className="bg-gray-300 px-4 py-1 rounded"
                onClick={() => setShowPayment(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {success && (
        <div className="mt-2 text-green-700">Payment successful!</div>
      )}
      {/* Below the payment form (desktop only): */}


    </div>
  );
}
