"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Barcode, CheckCircle, XCircle } from "lucide-react";

export default function StandResupplyPage({ params }) {
  const { standId } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStorageId = searchParams.get("storageId") || "";

  const [storages, setStorages] = useState([]);
  const [sourceStorageId, setSourceStorageId] = useState(initialStorageId);
  const [productsInStorage, setProductsInStorage] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const barcodeInputRef = useRef();
  const [showCheck, setShowCheck] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Fetch storages for select
  useEffect(() => {
    fetch("/api/storages")
      .then((res) => res.json())
      .then(setStorages)
      .catch(() => toast.error("Грешка при зареждане на складове"));
  }, []);

  // Fetch products when storage changes
  useEffect(() => {
    if (!sourceStorageId) {
      setProductsInStorage([]);
      setSelectedProducts([]);
      return;
    }
    setLoading(true);
    fetch(`/api/storages/${sourceStorageId}/products`)
      .then((res) => res.json())
      .then((data) => {
        setProductsInStorage(data);
        setSelectedProducts([]);
        setTimeout(() => {
          barcodeInputRef.current?.focus();
        }, 100);
      })
      .catch(() => toast.error("Грешка при зареждане на продукти"))
      .finally(() => setLoading(false));
  }, [sourceStorageId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth <= 768);
    }
  }, []);

  // Handle barcode scan
  const handleBarcodeScanned = (e) => {
    if (e.key === "Enter" && barcodeInput) {
      e.preventDefault();
      const productInSource = productsInStorage.find(
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
    const product = productsInStorage.find((p) => p.product.id === productId);
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

  const handleSubmit = async () => {
    if (!sourceStorageId) {
      toast.error("Моля, изберете склад.");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("Моля, изберете продукти.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        sourceStorageId,
        destinationStandId: standId,
        products: selectedProducts.map(({ productId, quantity }) => ({ productId, quantity })),
      };
      const res = await fetch("/api/resupply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Грешка при презареждане.");
      }
      toast.success("Презареждането е успешно!");
      router.push(`/dashboard/stands/${standId}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Sort products: selected first, then unselected
  const selectedIds = selectedProducts.map(sp => sp.productId);
  const sortedProducts = [
    ...productsInStorage.filter(p => selectedIds.includes(p.product.id)),
    ...productsInStorage.filter(p => !selectedIds.includes(p.product.id)),
  ];

  return (
    <div className="">
      <Card className="mb-4">
        <CardContent className="pt-4">
          <CardTitle className="mb-2">Изберете склад-източник</CardTitle>
          <Select
            value={sourceStorageId}
            onValueChange={setSourceStorageId}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Изберете склад..." />
            </SelectTrigger>
            <SelectContent>
              {storages.map((storage) => (
                <SelectItem key={storage.id} value={storage.id}>
                  {storage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {sourceStorageId && ( 
        <div className="bg-white rounded mb-4 ">
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
              ref={barcodeInputRef}
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
              Прехвърли към щанда
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 