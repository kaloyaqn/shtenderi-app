"use client";
import { useEffect, useState } from "react";
import BasicHeader from "@/components/BasicHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCommand } from "@/components/command-provider";

export default function DeliveryNewPage() {
  const router = useRouter();
  const [partners, setPartners] = useState([]);
  const [storages, setStorages] = useState([]);
  const [products, setProducts] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [storageId, setStorageId] = useState("");
  const [items, setItems] = useState([]);
  // Input row state
  const [code, setCode] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [oldPrice, setOldPrice] = useState(0);
  const [storageStockByProduct, setStorageStockByProduct] = useState({});
  const { openProductPicker } = useCommand();

  useEffect(() => {
    Promise.all([
      fetch("/api/delivery-partners").then(r => r.json()),
      fetch("/api/storages").then(r => r.json()),
      fetch("/api/products").then(r => r.json()),
    ]).then(([p, s, pr]) => { setPartners(p||[]); setStorages(s||[]); setProducts(pr||[]); });
  }, []);

  // When storage changes, load its current stock for avg calculation
  useEffect(() => {
    if (!storageId) { setStorageStockByProduct({}); return; }
    fetch(`/api/storages/${storageId}/products`).then(r => r.json()).then(list => {
      const map = {};
      (list || []).forEach(sp => { map[sp.productId] = sp.quantity || 0; });
      setStorageStockByProduct(map);
    }).catch(() => setStorageStockByProduct({}));
  }, [storageId]);

  // Autofill by code/pcode/barcode
  const onCodeEnter = async () => {
    const q = code?.trim();
    if (!q) return;
    // Use search endpoint which supports pcode/name and numeric barcode
    const found = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`).then(r => r.json()).catch(() => []);
    const prod = Array.isArray(found) && found.length > 0 ? found[0] : null;
    if (!prod) { setSelectedProduct(null); setOldPrice(0); return; }
    setSelectedProduct(prod);
    setOldPrice(prod.deliveryPrice || 0);
  };

  const avgPreview = (() => {
    if (!selectedProduct) return '-';
    const existingInDraft = items
      .filter(it => it.productId === selectedProduct.id)
      .reduce((sum, it) => sum + Number(it.quantity || 0), 0);
    const qOldBase = storageStockByProduct[selectedProduct.id] || 0;
    const qOld = Number(qOldBase) + existingInDraft;
    const qNew = Number(qty) || 0;
    if (qOld + qNew === 0) return '-';
    const pOld = Number(oldPrice) || 0;
    const pNew = Number(unitPrice) || 0;
    return ((qOld * pOld + qNew * pNew) / (qOld + qNew)).toFixed(4);
  })();

  const canAdd = selectedProduct && Number(qty) > 0 && Number(unitPrice) >= 0;
  const canSave = supplierId && storageId && items.length > 0 && items.every(i => i.productId && i.quantity > 0 && i.unitPrice >= 0);

  const addCurrentRow = () => {
    if (!canAdd) { return; }
    setItems(prev => [{ productId: selectedProduct.id, barcode: selectedProduct.barcode || '', quantity: Number(qty), unitPrice: Number(unitPrice), name: selectedProduct.name, oldPrice: Number(oldPrice), avgPreview: Number(avgPreview) }, ...prev]);
    // Reset input row
    setCode(""); setSelectedProduct(null); setQty(0); setUnitPrice(0); setOldPrice(0);
  };

  const addRow = () => setItems(prev => [...prev, { productId: "", quantity: 0, unitPrice: 0 }]);
  const removeRow = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const submitDraft = async () => {
    if (!canSave) { toast.error('Попълнете доставчик, склад и добавете поне един продукт'); return; }
    try {
      const body = { supplierId, storageId, products: items.filter(i => i.productId && i.quantity > 0).map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })) };
      const res = await fetch('/api/deliveries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      const d = await res.json();
      toast.success('Чернова създадена');
      router.push(`/dashboard/deliveries/${d.id}`);
    } catch {
      toast.error('Грешка при създаване');
    }
  };

  const submitAndAccept = async () => {
    if (!canSave) { toast.error('Попълнете доставчик, склад и добавете поне един продукт'); return; }
    try {
      const body = { supplierId, storageId, products: items.filter(i => i.productId && i.quantity > 0).map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })) };
      const res = await fetch('/api/deliveries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      const d = await res.json();
      const acc = await fetch(`/api/deliveries/${d.id}/accept`, { method: 'POST' });
      if (!acc.ok) throw new Error();
      toast.success('Доставката е записана и приета');
      router.push(`/dashboard/deliveries/${d.id}`);
    } catch {
      toast.error('Грешка при запис и приемане');
    }
  };

  return (
    <div className="container mx-auto">
      <BasicHeader title="Нова доставка" subtitle="Създаване на доставка (чернова)">
      <Button variant="outline" onClick={submitDraft}>Запази като чернова</Button>
      <Button onClick={submitAndAccept}>Запази</Button>
      </BasicHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Доставчик</label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger><SelectValue placeholder="Избери доставчик" /></SelectTrigger>
                <SelectContent>
                  {partners.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm">Склад</label>
              <Select value={storageId} onValueChange={setStorageId}>
                <SelectTrigger><SelectValue placeholder="Избери склад" /></SelectTrigger>
                <SelectContent>
                  {storages.map(s => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500">
                  <th className="p-2 border-b">Код / EAN</th>
                  <th className="p-2 border-b">Продукт</th>
                  <th className="p-2 border-b">Стара доставна</th>
                  <th className="p-2 border-b">Бройки</th>
                  <th className="p-2 border-b">Дост. цена</th>
                  <th className="p-2 border-b">Средна (преглед)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 align-middle"><Input placeholder="Код / EAN" value={code} onFocus={() => openProductPicker({ onSelect: (p) => { setSelectedProduct(p); setOldPrice(p.deliveryPrice || 0); setCode(p.pcode || p.barcode || ''); } })} onChange={(e) => setCode(e.target.value)} onBlur={onCodeEnter} /></td>
                  <td className="p-2 align-middle text-sm text-gray-800 truncate max-w-[360px]">{selectedProduct?.name || '-'}</td>
                  <td className="p-2 align-middle text-sm text-gray-600">{oldPrice || 0}</td>
                  <td className="p-2 align-middle"><Input type="number" min={0} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" onKeyDown={(e) => { if (e.key === 'Enter') addCurrentRow(); }} /></td>
                  <td className="p-2 align-middle"><Input type="number" step="0.01" min={0} value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="0.00" onKeyDown={(e) => { if (e.key === 'Enter') addCurrentRow(); }} /></td>
                  <td className="p-2 align-middle text-sm text-gray-800">{avgPreview}</td>
                </tr>
                {items.map((row, idx) => (
                  <tr key={idx} className="text-sm">
                    <td className="p-2 border-t text-gray-500">{row.barcode}</td>
                    <td className="p-2 border-t">{row.name || '-'}</td>
                    <td className="p-2 border-t">{row.oldPrice ?? '-'}</td>
                    <td className="p-2 border-t">{row.quantity}</td>
                    <td className="p-2 border-t">{row.unitPrice}</td>
                    <td className="p-2 border-t">{row.avgPreview ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">

          </div>
    </div>
  );
}


