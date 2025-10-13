"use client";
import { useEffect, useState } from "react";
import BasicHeader from "@/components/BasicHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import DeliveryTable from "../_components/DeliveryTable";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { useCommand } from "@/components/command-provider";
import PrintableDelivery from "./_components/printable-delivery";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CreateProductPage from "../../products/create/page";
import { XMLParser } from "fast-xml-parser";
import { useRef } from "react";

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
  const [clientPrice, setClientPrice] = useState(0);
  const [oldPrice, setOldPrice] = useState(0);
  const [storageStockByProduct, setStorageStockByProduct] = useState({});
  const { openProductPicker } = useCommand();
  const fileInputRef = useRef();
  const [isImporting, setIsImporting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const load = async () => {
    const d = await fetch(`/api/deliveries/${deliveryId}`).then(r => r.json());
    setDelivery(d);
    // Seed lines with editable rows (existing delivery rows treated as edited already)
    setLines(
      d?.products?.map(p => ({
        productId: p.productId,
        barcode: p.product?.barcode || p.barcode || '',
        name: p.product?.name || p.name || '',
        pcd: p.pcd || '',
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        clientPrice: p.clientPrice,
        imported: false,
        edited: true
      })) || []
    );
  };
  useEffect(() => {
    if (!delivery?.storageId) return;
    fetch(`/api/storages/${delivery.storageId}/products`).then(r => r.json()).then(list => {
      const map = {}; (list||[]).forEach(sp => { map[String(sp.productId)] = sp.quantity || 0; });
      setStorageStockByProduct(map);
    });
  }, [delivery?.storageId]);

  const onCodeEnter = async () => {
    const q = code?.trim(); if (!q) return;
    const found = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`).then(r => r.json()).catch(() => []);
    const prod = Array.isArray(found) && found.length > 0 ? found[0] : null;
    if (!prod) { setSelectedProduct(null); setOldPrice(0); return; }
    setSelectedProduct(prod); setOldPrice(prod.deliveryPrice || 0); setClientPrice(prod.clientPrice || 0);
  };

  const avgPreview = (() => {
    if (!selectedProduct) return '-';
    const qOld = storageStockByProduct[selectedProduct.id] || 0; // leftover quantity in storage
    const qNew = Number(qty) || 0; // new quantity from delivery
    if (qOld + qNew === 0) return '-';
    const pOld = Number(oldPrice) || 0; // old delivery price from product
    const pNew = Number(unitPrice) || 0; // new delivery price from delivery
    return ((qOld * pOld + qNew * pNew) / (qOld + qNew)).toFixed(4);
  })();

  const addCurrentRow = async () => {
    if (!selectedProduct || !qty || !unitPrice || !clientPrice) return;
    const newLines = [{ productId: selectedProduct.id, barcode: selectedProduct.barcode || '', name: selectedProduct.name || '', quantity: Number(qty), unitPrice: Number(unitPrice), clientPrice: Number(clientPrice), imported: false, edited: true }, ...lines];
    const res = await fetch(`/api/deliveries/${deliveryId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ products: newLines }) });
    if (!res.ok) { toast.error('Грешка при запис'); return; }
    setCode(""); setSelectedProduct(null); setQty(0); setUnitPrice(0); setClientPrice(0); setOldPrice(0);
    load();
  };

  useEffect(() => { if (deliveryId) load(); }, [deliveryId]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const toastId = toast.loading('Обработка на XML файла...');

    try {
      const text = await file.text();
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "",
      });
      const xml = parser.parse(text);
      let products = [];
      
      // Check for new format (offers)
      if (xml.offers?.o) {
        const offers = Array.isArray(xml.offers.o) ? xml.offers.o : [xml.offers.o];
        products = offers.map((offer) => {
          // Extract price from cena_netto (remove € and convert comma to dot)
          const priceStr = offer.cena_netto?.replace('€', '').replace(',', '.').trim() || '0';
          const price = parseFloat(priceStr) || 0;
          
          // Extract quantity from ilosc
          const qtyStr = String(offer.ilosc ?? '0').replace(',', '.').trim();
          const quantity = Number(qtyStr) || 0;
          
          return {
            barcode: '',
            pcd: '',
            name: offer.name?.['#text'] || offer.name || '',
            quantity: quantity,
            unitPrice: price,
            clientPrice: 0,
          };
        }).filter((p) => p.name && !isNaN(p.quantity) && p.quantity > 0);
      }
      // Check for old format (info/goods)
      else if (xml.info?.goods?.good) {
        const goods = Array.isArray(xml.info.goods.good) ? xml.info.goods.good : [xml.info.goods.good];
        products = goods.map((good) => ({
          barcode: String(good.barcode || ''),
          pcd: String(good.pcd || good.pcode || ''),
          name: good.name || '',
          quantity: Number(String(good.quantity ?? '0').replace(',', '.')) || 0,
          unitPrice: Number(good.unitPrice || good.price || 0),
          clientPrice: 0,
        })).filter((p) => (p.barcode || p.pcd || p.name) && !isNaN(p.quantity) && p.quantity > 0);
      }

      if (products.length === 0) {
        toast.error("XML файлът не съдържа продукти или е в грешен формат.");
        return;
      }
      // Client-side append rows; mark as imported and not yet edited
      const appended = products.map(p => ({
        productId: null,
        barcode: p.barcode,
        name: p.name,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        clientPrice: p.clientPrice,
        pcd: p.pcd || '',
        imported: true,
        edited: false
      }));
      setLines(prev => [...appended, ...prev]);
      toast.success(`Импортирани ${appended.length} реда. Моля, прегледайте и редактирайте при нужда.`);
    } catch (error) {
      console.error('XML import error:', error);
      toast.error("Грешка при импортиране на XML файла.");
    } finally {
      setIsImporting(false);
      toast.dismiss(toastId);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
        <BasicHeader title={`Доставка №${delivery.number}`} subtitle={`${delivery?.supplier?.name || ''} → ${delivery?.storage?.name || ''}`}>
          {isDraft && (
            <>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
              >
                {isImporting ? 'Импортиране...' : 'Импорт XML'}
              </Button>
              
              <input
                type="file"
                accept=".xml"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
                disabled={isImporting}
              />
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Създай продукт</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Създай нов продукт</DialogTitle>
                  <CreateProductPage
                    onProductCreated={(prod) => {
                      setLines(prev => [{ productId: prod.id, barcode: prod.barcode || '', name: prod.name || '', quantity: 0, unitPrice: prod.deliveryPrice || 0, clientPrice: prod.clientPrice || 0, imported: false, edited: true }, ...prev]);
                      setCreateOpen(false);
                    }}
                    onClose={() => setCreateOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </>
          )}
         {isDraft && !editing && <Button onClick={() => setEditing(true)}>Редакция</Button>}
         {isDraft && editing && <Button onClick={save}>Запази чернова</Button>}
         {isDraft && <Button onClick={accept}>Приеми</Button>}
         {delivery.status === 'ACCEPTED' && delivery.paidStatus !== 'PAID' && <Button onClick={pay}>Отчети плащане</Button>}
        </BasicHeader>
      <div className="w-full bg-white border border-gray-200 rounded-md p-3 mb-3 text-sm grid grid-cols-2 md:grid-cols-7 gap-2">
        <div><span className="text-gray-500">Доставчик:</span> <span className="font-medium">{delivery?.supplier?.name || '-'}</span></div>
        <div><span className="text-gray-500">Склад:</span> <span className="font-medium">{delivery?.storage?.name || '-'}</span></div>
        <div><span className="text-gray-500">Статус:</span> <span className="font-medium">{delivery.status === 'DRAFT' ? 'Чернова' : 'Приета'}</span></div>
        <div><span className="text-gray-500">Плащане:</span> <span className="font-medium">{delivery.paidStatus === 'PAID' ? 'Платена' : 'Неплатена'}</span></div>
        <div><span className="text-gray-500">Създадена:</span> <span className="font-medium">{new Date(delivery.createdAt).toLocaleString('bg-BG')}</span></div>
        <div><span className="text-gray-500">Приета:</span> <span className="font-medium">{delivery.acceptedAt ? new Date(delivery.acceptedAt).toLocaleString('bg-BG') : '-'}</span></div>
        <div><span className="text-gray-500">Сума:</span> <span className="font-medium">{((delivery.products||[]).reduce((s,p)=> s + (Number(p.quantity||0)*Number(p.unitPrice||0)),0)).toFixed(2)} лв.</span></div>
      </div>

          <DeliveryTable
            isDraft={isDraft}
            lines={lines}
            setLines={setLines}
            oldPriceByProductId={(pid) => {
              if (!pid) return undefined;
              const prod = delivery.products?.find(p => p.productId === pid)?.product;
              return prod?.deliveryPrice;
            }}
            oldClientPriceByProductId={(pid) => {
              if (!pid) return undefined;
              const prod = delivery.products?.find(p => p.productId === pid)?.product;
              return prod?.clientPrice ?? undefined;
            }}
            onPickProduct={(idx) => isDraft && openProductPicker({ onSelect: (p) => {
              setLines(prev => prev.map((row, i) => i === idx ? { ...row, productId: p.id, barcode: p.barcode || '', name: p.name || '', edited: true } : row));
            }})}
            onPickNewProduct={(cfg) => openProductPicker(cfg)}
            storageStockByProduct={storageStockByProduct}
          />

      <div className="flex flex-wrap gap-2 mt-3">

        <PrintableDelivery delivery={delivery} />
      </div>
    </div>
  );
}


