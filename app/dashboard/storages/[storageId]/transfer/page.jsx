"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Barcode, CheckCircle, XCircle } from "lucide-react";
import { useSession } from "@/lib/session-context";

export default function StorageTransferPage({ params }) {
  const { storageId } = params;
  const router = useRouter();
  const { data: session } = useSession();

  const [step, setStep] = useState(1);
  const [allStorages, setAllStorages] = useState([]);
  const [allStands, setAllStands] = useState([]);
  const [productsInSource, setProductsInSource] = useState([]);
  const [destinationId, setDestinationId] = useState("");
  const [destinationType, setDestinationType] = useState("STORAGE");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [showError, setShowError] = useState(false);
  const barcodeInputRef = useRef();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth <= 768);
    }
  }, []);

  // Fetch all storages and stands for destination selection
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/storages").then((res) => res.json()),
      fetch("/api/stands").then((res) => res.json()),
    ])
      .then(([storagesData, standsData]) => {
        setAllStorages(storagesData.filter((s) => s.id !== storageId));
        setAllStands(standsData);
      })
      .catch(() => toast.error("Грешка при зареждане на дестинации."))
      .finally(() => setLoading(false));
  }, [storageId]);

  // Fetch products when proceeding to step 2
  useEffect(() => {
    if (step !== 2) return;
    setLoading(true);
    fetch(`/api/storages/${storageId}/products`)
      .then((res) => res.json())
      .then((data) => {
        setProductsInSource(data);
        setSelectedProducts([]);
        setTimeout(() => {
          barcodeInputRef.current?.focus();
        }, 100);
      })
      .catch(() => toast.error("Грешка при зареждане на продукти"))
      .finally(() => setLoading(false));
  }, [step, storageId]);

  // Handle barcode scan
  const handleBarcodeScanned = (e) => {
    if (e.key === "Enter" && barcodeInput) {
      e.preventDefault();
      const productInSource = productsInSource.find(
        (p) => p.product.barcode === barcodeInput
      );
      if (!productInSource) {
        toast.error("Продукт с този баркод не е намерен в склада.");
        setShowError(true);
        try { new Audio('/error.mp3').play(); } catch {}
        setTimeout(() => setShowError(false), 1200);
        setBarcodeInput("");
        return;
      }
      const existingProduct = selectedProducts.find(
        (p) => p.productId === productInSource.product.id
      );
      const currentQuantity = existingProduct?.quantity || 0;
      if (currentQuantity >= productInSource.quantity) {
        toast.warning(
          `Достигнато е максималното налично количество за ${productInSource.product.name}.`
        );
        setShowError(true);
        try { new Audio('/error.mp3').play(); } catch {}
        setTimeout(() => setShowError(false), 1200);
      } else {
        handleProductQuantityChange(
          productInSource.product.id,
          String(currentQuantity + 1),
          true // moveToTop
        );
        setShowCheck(true);
        try { new Audio('/success.mp3').play(); } catch {}
        setTimeout(() => setShowCheck(false), 1200);
      }
      setBarcodeInput("");
    }
  };

  // Move to top logic
  const handleProductQuantityChange = (productId, newQuantity, moveToTop = false) => {
    const product = productsInSource.find((p) => p.product.id === productId);
    if (!product) return;
    const existingIndex = selectedProducts.findIndex((p) => p.productId === productId);
    const qty = Math.max(0, Math.min(parseInt(newQuantity, 10) || 0, product.quantity));
    if (qty === 0) {
      setSelectedProducts((prev) => prev.filter((p) => p.productId !== productId));
      return;
    }
    if (existingIndex > -1) {
      let updated = [...selectedProducts];
      updated[existingIndex].quantity = qty;
      if (moveToTop) {
        const [item] = updated.splice(existingIndex, 1);
        updated = [item, ...updated];
      }
      setSelectedProducts(updated);
    } else {
      setSelectedProducts((prev) => [
        { productId: product.product.id, name: product.product.name, quantity: qty, maxQuantity: product.quantity },
        ...prev,
      ]);
    }
  };

  // Sort products: selected first, then unselected
  const selectedIds = selectedProducts.map((sp) => sp.productId);
  const sortedProducts = [
    ...productsInSource.filter((p) => selectedIds.includes(p.product.id)),
    ...productsInSource.filter((p) => !selectedIds.includes(p.product.id)),
  ];

  const handleSubmit = async () => {
    if (!destinationId) {
      toast.error("Моля, изберете дестинация.");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("Моля, изберете продукти.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        sourceStorageId: storageId,
        destinationId,
        destinationType,
        products: selectedProducts.map(({ productId, quantity }) => ({ productId, quantity })),
      };
      const res = await fetch("/api/storages/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Грешка при прехвърляне.");
      }
      
      const result = await res.json();
      
      if (destinationType === "STAND") {
        // For stand transfers, redirect to transfers page for confirmation
        toast.success("Трансферът е създаден и очаква потвърждение!");
        router.push("/dashboard/transfers");
        return;
      } else {
        // For storage-to-storage transfers, redirect to storage page
        toast.success("Прехвърлянето е успешно!");
        router.push(`/dashboard/storages/${storageId}`);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      {step === 1 && (
        <div className="bg-white rounded mb-4 p-4">
          <div className="mb-2 font-semibold text-base">Изберете дестинация</div>
          <Tabs defaultValue="STORAGE" className="w-full" onValueChange={(val) => {
            setDestinationType(val);
            setDestinationId("");
          }}>
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="STORAGE">Склад</TabsTrigger>
              <TabsTrigger value="STAND">Щанд</TabsTrigger>
            </TabsList>
            <TabsContent value="STORAGE">
              <Select onValueChange={setDestinationId} value={destinationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Изберете склад..." />
                </SelectTrigger>
                <SelectContent>
                  {allStorages.map((storage) => (
                    <SelectItem key={storage.id} value={storage.id}>
                      {storage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>
            <TabsContent value="STAND">
              <Select onValueChange={setDestinationId} value={destinationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Изберете щанд..." />
                </SelectTrigger>
                <SelectContent>
                  {allStands.map((stand) => (
                    <SelectItem key={stand.id} value={stand.id}>
                      {stand.name} {stand.store?.name ? `— ${stand.store.name}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setStep(2)} disabled={!destinationId || loading}>
              {loading ? "Зареждане..." : "Напред"}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded mb-4 p-4">
          <div className="mb-2 font-semibold text-base">Добавете продукти</div>
          <div className="relative mb-4">
            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Сканирайте баркод..."
              className="pl-10"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={handleBarcodeScanned}
              disabled={loading}
              ref={barcodeInputRef}
              inputMode={isMobile ? "none" : undefined}
            />
          </div>
          <div className="space-y-2">
            {/* Success/Error indicator */}
            {showCheck && (
              <div className="flex items-center gap-2 text-green-600 mb-2 animate-pulse">
                <CheckCircle className="h-5 w-5" /> Успешно добавен продукт
              </div>
            )}
            {showError && (
              <div className="flex items-center gap-2 text-red-600 mb-2 animate-pulse">
                <XCircle className="h-5 w-5" /> Грешка при добавяне
              </div>
            )}
            {sortedProducts.map((p) => {
              const selected = selectedProducts.find((sp) => sp.productId === p.product.id);
              return (
                <div
                  key={p.product.id}
                  className={`rounded-sm border border-[1px] flex flex-col justify-between p-3 ${selected ? 'bg-yellow-100 border-yellow-400' : ''}`}
                >
                  <div className="font-medium text-sm">{p.product.name}</div>
                  <div className="text-xs text-gray-500">{p.product.barcode}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      min={0}
                      max={p.quantity}
                      value={selected?.quantity || ""}
                      onChange={(e) => handleProductQuantityChange(p.product.id, e.target.value, true)}
                      className="w-16 text-right"
                      disabled={loading}
                    />
                    <span className="text-xs text-gray-500">/ {p.quantity}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSubmit} disabled={loading || !selectedProducts.length}>
              Прехвърли
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 