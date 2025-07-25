"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function StandRefundPage() {
  const { standId } = useParams();
  const [products, setProducts] = useState([]); // [{product, quantity}]
  const [refundList, setRefundList] = useState({}); // barcode -> { product, quantity }
  const [standName, setStandName] = useState("");
  const [note, setNote] = useState("");
  const inputRef = useRef();
  const router = useRouter();
  const { data: session } = useSession();
  const [inputReadOnly, setInputReadOnly] = useState(false);

  // Fetch stand name
  useEffect(() => {
    if (!standId) return;
    fetch(`/api/stands/${standId}`)
      .then((res) => res.json())
      .then((data) => setStandName(data.name || ""));
  }, [standId]);

  // Fetch products on stand
  useEffect(() => {
    if (!standId) return;
    fetch(`/api/stands/${standId}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, [standId]);

  useEffect(() => {
    // Detect mobile and set readOnly
    if (typeof window !== "undefined") {
      setInputReadOnly(window.innerWidth <= 768);
    }
    // Always focus input on mount
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const handleInputFocus = () => {
    setInputReadOnly(false);
  };

  // Handle barcode scan/entry
  const handleScan = async (e) => {
    e.preventDefault();
    const barcode = e.target.barcode.value.trim();
    if (!barcode) return;
    const prod = products.find((p) => p.product.barcode === barcode);
    if (!prod) {
      toast.error("Продукт с този баркод не е намерен на щанда.");
      e.target.reset();
      inputRef.current?.focus();
      return;
    }
    if (prod.quantity === 0) {
      toast.warning("Няма налични бройки от този продукт на щанда.");
      e.target.reset();
      inputRef.current?.focus();
      return;
    }
    setRefundList((prev) => {
      const current = prev[barcode]?.quantity || 0;
      if (current + 1 > prod.quantity) {
        toast.warning("Няма толкова налични бройки от този продукт на щанда.");
        return prev;
      }
      return {
        ...prev,
        [barcode]: {
          product: prod.product,
          quantity: current + 1,
        },
      };
    });
    e.target.reset();
    inputRef.current?.focus();
  };

  // Remove product from refund list
  const handleRemove = (barcode) => {
    setRefundList((prev) => {
      const copy = { ...prev };
      delete copy[barcode];
      return copy;
    });
  };

  // Complete refund
  const handleRefund = async () => {
    const productsToRefund = Object.values(refundList).map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      clientPrice: item.product.clientPrice,
    }));
    if (productsToRefund.length === 0) {
      toast.error("Няма избрани продукти за връщане.");
      return;
    }
    try {
      const res = await fetch("/api/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: "STAND",
          sourceId: standId,
          products: productsToRefund,
          note: note,
        }),
      });
      if (!res.ok) throw new Error("Грешка при връщане на продукти");
      toast.success("Връщането е успешно записано!");
      setRefundList({});
      router.push(`/dashboard/refunds`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Връщане на продукти от щанд: {standName}</h1>
      <form onSubmit={handleScan} className="mb-4 flex gap-2">
        <input
          name="barcode"
          ref={inputRef}
          placeholder="Сканирай или въведи баркод..."
          className="border rounded px-4 py-2 text-lg w-full"
          autoComplete="off"
          readOnly={inputReadOnly}
          onFocus={handleInputFocus}
        />
        <Button type="submit">Добави</Button>
      </form>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Продукти за връщане:</h2>
        {Object.keys(refundList).length === 0 && <div className="text-muted-foreground">Няма избрани продукти.</div>}
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.values(refundList).map(({ product, quantity }) => (
            <div key={product.barcode} className="border rounded p-3 flex flex-col gap-1 bg-yellow-50">
              <div className="font-semibold">{product.name}</div>
              <div className="text-xs text-gray-600">Баркод: {product.barcode}</div>
              <div className="text-sm">Количество: <b>{quantity}</b></div>
              <Button size="sm" variant="outline" onClick={() => handleRemove(product.barcode)}>
                Премахни
              </Button>
            </div>
          ))}
        </div>
      </div> 
      <Label className={'mb-2'}>Основание на рекламация</Label>
      <Textarea 
      value={note}
      onChange={(e) => setNote(e.target.value)}
      />
      <Button onClick={handleRefund} disabled={Object.keys(refundList).length === 0} className="text-lg px-8 py-3 rounded font-bold mt-4">
        Потвърди връщането
      </Button>
    </div>
  );
} 