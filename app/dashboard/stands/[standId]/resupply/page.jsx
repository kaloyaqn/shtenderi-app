"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Barcode } from "lucide-react";

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

  // Handle barcode scan
  const handleBarcodeScanned = (e) => {
    if (e.key === "Enter" && barcodeInput) {
      e.preventDefault();
      const productInSource = productsInStorage.find(
        (p) => p.product.barcode === barcodeInput
      );
      if (!productInSource) {
        toast.error("Продукт с този баркод не е намерен в склада.");
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
      } else {
        handleProductQuantityChange(
          productInSource.product.id,
          String(currentQuantity + 1)
        );
      }
      setBarcodeInput("");
    }
  };

  const handleProductQuantityChange = (productId, newQuantity) => {
    const product = productsInStorage.find((p) => p.product.id === productId);
    if (!product) return;
    const existingIndex = selectedProducts.findIndex((p) => p.productId === productId);
    const qty = Math.max(0, Math.min(parseInt(newQuantity, 10) || 0, product.quantity));
    if (qty === 0) {
      setSelectedProducts((prev) => prev.filter((p) => p.productId !== productId));
      return;
    }
    if (existingIndex > -1) {
      const updated = [...selectedProducts];
      updated[existingIndex].quantity = qty;
      setSelectedProducts(updated);
    } else {
      setSelectedProducts((prev) => [
        ...prev,
        {
          productId: product.product.id,
          name: product.product.name,
          quantity: qty,
          maxQuantity: product.quantity,
        },
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
        <Card>
          <CardContent className="pt-4">
            <CardTitle className="mb-2">Добавете продукти</CardTitle>
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
              />
            </div>
            <div className="space-y-2">
              {productsInStorage.map((p) => {
                const selected = selectedProducts.find((sp) => sp.productId === p.product.id);
                return (
                  <div
                    key={p.product.id}
                    className="flex items-center justify-between border rounded px-3 py-2"
                  >
                    <div>
                      <div className="font-medium text-sm">{p.product.name}</div>
                      <div className="text-xs text-gray-500">{p.product.barcode}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={p.quantity}
                        value={selected?.quantity || ""}
                        onChange={(e) => handleProductQuantityChange(p.product.id, e.target.value)}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
} 