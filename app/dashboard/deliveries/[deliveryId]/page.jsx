"use client";
import { useEffect, useState } from "react";
import BasicHeader from "@/components/BasicHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { useCommand } from "@/components/command-provider";

export default function DeliveryDetailPage() {
  const { deliveryId } = useParams();
  const router = useRouter();
  const [delivery, setDelivery] = useState(null);
  const [editing, setEditing] = useState(false);
  const [lines, setLines] = useState([]);
  // Input row for adding on detail page
  const [code, setCode] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [oldPrice, setOldPrice] = useState(0);
  const [storageStockByProduct, setStorageStockByProduct] = useState({});
  const { openProductPicker } = useCommand();

  const load = async () => {
    const d = await fetch(`/api/deliveries/${deliveryId}`).then(r => r.json());
    setDelivery(d);
    setLines(d?.products?.map(p => ({ productId: p.productId, quantity: p.quantity, unitPrice: p.unitPrice })) || []);
  };
  useEffect(() => {
    if (!delivery?.storageId) return;
    fetch(`/api/storages/${delivery.storageId}/products`).then(r => r.json()).then(list => {
      const map = {}; (list||[]).forEach(sp => { map[sp.productId] = sp.quantity || 0; });
      setStorageStockByProduct(map);
    });
  }, [delivery?.storageId]);

  const onCodeEnter = async () => {
    const q = code?.trim(); if (!q) return;
    const found = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`).then(r => r.json()).catch(() => []);
    const prod = Array.isArray(found) && found.length > 0 ? found[0] : null;
    if (!prod) { setSelectedProduct(null); setOldPrice(0); return; }
    setSelectedProduct(prod); setOldPrice(prod.deliveryPrice || 0);
  };

  const avgPreview = (() => {
    if (!selectedProduct) return '-';
    const existingInDraft = lines
      .filter(it => it.productId === selectedProduct.id)
      .reduce((sum, it) => sum + Number(it.quantity || 0), 0);
    const qOldBase = storageStockByProduct[selectedProduct.id] || 0;
    const qOld = Number(qOldBase) + existingInDraft;
    const qNew = Number(qty) || 0; if (qOld + qNew === 0) return '-';
    const pOld = Number(oldPrice) || 0; const pNew = Number(unitPrice) || 0;
    return ((qOld * pOld + qNew * pNew) / (qOld + qNew)).toFixed(4);
  })();

  const addCurrentRow = async () => {
    if (!selectedProduct || !qty || !unitPrice) return;
    const newLines = [{ productId: selectedProduct.id, quantity: Number(qty), unitPrice: Number(unitPrice) }, ...lines];
    const res = await fetch(`/api/deliveries/${deliveryId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ products: newLines }) });
    if (!res.ok) { toast.error('Грешка при запис'); return; }
    setCode(""); setSelectedProduct(null); setQty(0); setUnitPrice(0); setOldPrice(0);
    load();
  };

  useEffect(() => { if (deliveryId) load(); }, [deliveryId]);

  const save = async () => {
    try {
      const res = await fetch(`/api/deliveries/${deliveryId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ products: lines }) });
      if (!res.ok) throw new Error();
      toast.success('Записано');
      setEditing(false);
      load();
    } catch {
      toast.error('Грешка при запис');
    }
  };

  const accept = async () => {
    const r = await fetch(`/api/deliveries/${deliveryId}/accept`, { method: 'POST' });
    if (r.ok) { toast.success('Приета доставка'); load(); } else { toast.error('Грешка при приемане'); }
  };

  const pay = async () => {
    const r = await fetch(`/api/deliveries/${deliveryId}/pay`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ method: 'CASH' }) });
    if (r.ok) { toast.success('Платена'); load(); } else { toast.error('Грешка при плащане'); }
  };

  if (!delivery) return null;

  const isDraft = delivery.status === 'DRAFT';

  return (
    <div className="container mx-auto">
      <BasicHeader title={`Доставка №${delivery.number}`} subtitle={`${delivery?.supplier?.name || ''} → ${delivery?.storage?.name || ''}`} />
      <div className="w-full bg-white border border-gray-200 rounded-md p-3 mb-3 text-sm grid grid-cols-2 md:grid-cols-7 gap-2">
        <div><span className="text-gray-500">Доставчик:</span> <span className="font-medium">{delivery?.supplier?.name || '-'}</span></div>
        <div><span className="text-gray-500">Склад:</span> <span className="font-medium">{delivery?.storage?.name || '-'}</span></div>
        <div><span className="text-gray-500">Статус:</span> <span className="font-medium">{delivery.status === 'DRAFT' ? 'Чернова' : 'Приета'}</span></div>
        <div><span className="text-gray-500">Плащане:</span> <span className="font-medium">{delivery.paidStatus === 'PAID' ? 'Платена' : 'Неплатена'}</span></div>
        <div><span className="text-gray-500">Създадена:</span> <span className="font-medium">{new Date(delivery.createdAt).toLocaleString('bg-BG')}</span></div>
        <div><span className="text-gray-500">Приета:</span> <span className="font-medium">{delivery.acceptedAt ? new Date(delivery.acceptedAt).toLocaleString('bg-BG') : '-'}</span></div>
        <div><span className="text-gray-500">Сума:</span> <span className="font-medium">{((delivery.products||[]).reduce((s,p)=> s + (Number(p.quantity||0)*Number(p.unitPrice||0)),0)).toFixed(2)} лв.</span></div>
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
                {isDraft && (
                <tr>
                  <td className="p-2 align-middle"><Input placeholder="Код / EAN" value={code} onFocus={() => openProductPicker({ onSelect: (p) => { setSelectedProduct(p); setOldPrice(p.deliveryPrice || 0); setCode(p.pcode || p.barcode || ''); } })} onChange={(e) => setCode(e.target.value)} onBlur={onCodeEnter} /></td>
                  <td className="p-2 align-middle text-sm text-gray-800 truncate max-w-[360px]">{selectedProduct?.name || '-'}</td>
                  <td className="p-2 align-middle text-sm text-gray-600">{oldPrice || 0}</td>
                  <td className="p-2 align-middle"><Input type="number" min={0} value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" onKeyDown={(e) => { if (e.key === 'Enter') addCurrentRow(); }} /></td>
                  <td className="p-2 align-middle"><Input type="number" step="0.01" min={0} value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="0.00" onKeyDown={(e) => { if (e.key === 'Enter') addCurrentRow(); }} /></td>
                  <td className="p-2 align-middle text-sm text-gray-800">{avgPreview}</td>
                </tr>
                )}
                {lines.map((ln, i) => (
                  <tr key={i} className="text-sm">
                    <td className="p-2 border-t text-gray-500">{delivery.products[i]?.product?.barcode || delivery.products[i]?.product?.pcode || ''}</td>
                    <td className="p-2 border-t">{delivery.products[i]?.product?.name}</td>
                    <td className="p-2 border-t">{delivery.products[i]?.product?.deliveryPrice ?? '-'}</td>
                    <td className="p-2 border-t">{ln.quantity}</td>
                    <td className="p-2 border-t">{ln.unitPrice}</td>
                    <td className="p-2 border-t">-</td>
                  </tr>
                ))}
                {/* Footer row total */}
                <tr>
                  <td colSpan={4}></td>
                  <td className="p-2 border-t font-medium text-right">Общо:</td>
                  <td className="p-2 border-t font-bold">{((lines||[]).reduce((s,p)=> s + (Number(p.quantity||0)*Number(p.unitPrice||0)),0)).toFixed(2)} лв.</td>
                </tr>
              </tbody>
            </table>
          </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {isDraft && !editing && <Button onClick={() => setEditing(true)}>Редакция</Button>}
        {isDraft && editing && <Button onClick={save}>Запази чернова</Button>}
        {isDraft && <Button onClick={accept}>Приеми</Button>}
        {delivery.status === 'ACCEPTED' && delivery.paidStatus !== 'PAID' && <Button onClick={pay}>Отчети плащане</Button>}
      </div>
    </div>
  );
}


