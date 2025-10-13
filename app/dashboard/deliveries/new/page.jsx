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
import DeliveryTable from "../_components/DeliveryTable";
import { XMLParser } from "fast-xml-parser";
import { useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImportIcon, PlusIcon, SaveIcon } from "lucide-react";
import { IconTruckDelivery } from "@tabler/icons-react";
import CreateProductPage from "../../products/create/page";

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
  const [clientPrice, setClientPrice] = useState(0);
  const [oldPrice, setOldPrice] = useState(0);
  const [storageStockByProduct, setStorageStockByProduct] = useState({});
  const { openProductPicker } = useCommand();
  const fileInputRef = useRef();
  const [isImporting, setIsImporting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

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
      (list || []).forEach(sp => { map[String(sp.productId)] = sp.quantity || 0; });
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
    setClientPrice(prod.clientPrice || 0);
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

  const canAdd = selectedProduct && Number(qty) > 0 && Number(unitPrice) >= 0 && Number(clientPrice) >= 0;
  const canSave = Boolean(supplierId && storageId && items.length > 0 && items.every(i =>
    (i.productId || i.barcode || i.name) && Number(i.quantity) > 0 && Number(i.unitPrice) >= 0 && Number(i.clientPrice) >= 0
  ));

  const addCurrentRow = () => {
    if (!canAdd) { return; }
    setItems(prev => [{ productId: selectedProduct.id, barcode: selectedProduct.barcode || '', quantity: Number(qty), unitPrice: Number(unitPrice), clientPrice: Number(clientPrice), name: selectedProduct.name, oldPrice: Number(oldPrice), avgPreview: Number(avgPreview) }, ...prev]);
    // Reset input row
    setCode(""); setSelectedProduct(null); setQty(0); setUnitPrice(0); setClientPrice(0); setOldPrice(0);
  };

  const addRow = () => setItems(prev => [...prev, { productId: "", quantity: 0, unitPrice: 0 }]);
  const removeRow = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const submitDraft = async () => {
    if (!canSave) { toast.error('Попълнете доставчик, склад и добавете поне един продукт'); return; }
    try {
      const body = { supplierId, storageId, products: items.filter(i => Number(i.quantity) > 0).map(i => ({ productId: i.productId || null, barcode: i.barcode || null, pcd: i.pcd || null, name: i.name || null, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice), clientPrice: Number(i.clientPrice) })) };
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
      const body = { supplierId, storageId, products: items.filter(i => Number(i.quantity) > 0).map(i => ({ productId: i.productId || null, barcode: i.barcode || null, pcd: i.pcd || null, name: i.name || null, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice), clientPrice: Number(i.clientPrice) })) };
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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!supplierId || !storageId) {
      toast.error('Първо изберете доставчик и склад');
      return;
    }

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
            barcode: '', // No barcode in this format
            pcode: '', // No pcode in this format
            name: offer.name?.['#text'] || offer.name || '', // Extract from CDATA
            quantity: quantity,
            unitPrice: price,
            clientPrice: 0, // Client price not from import; only delivery price
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
          clientPrice: 0, // Client price not from import; only delivery price
        })).filter((p) => (p.barcode || p.pcode) && !isNaN(p.quantity) && p.quantity > 0);
      }

      if (products.length === 0) {
        toast.error("XML файлът не съдържа продукти или е в грешен формат.");
        return;
      }

      // Client-side append rows; do NOT create a delivery here
      const appended = products.map(p => ({
        productId: null,
        barcode: p.barcode || '',
        name: p.name || '',
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        clientPrice: p.clientPrice,
        pcd: p.pcd || '',
        imported: true,
        edited: false
      }));
      setItems(prev => [...appended, ...prev]);
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

  return (
    <div className="container mx-auto">
      <BasicHeader title="Нова доставка" subtitle="Създаване на доставка (чернова)">
      <Button 
        variant="outline" 
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
      >
        <ImportIcon />
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
          <Button variant={'outline'}><PlusIcon />Създай продукт</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Създай нов продукт</DialogTitle>
          <CreateProductPage 
            onProductCreated={(prod) => {
              setProducts(prev => [prod, ...prev]);
              setItems(prev => [{ productId: prod.id, barcode: prod.barcode || '', name: prod.name || '', quantity: 0, unitPrice: prod.deliveryPrice || 0, clientPrice: prod.clientPrice || 0, imported: false, edited: true }, ...prev]);
              setCreateOpen(false);
            }}
            onClose={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Button variant="outline" onClick={submitDraft} disabled={isImporting}> <SaveIcon /> Запази като чернова</Button>
      <Button onClick={submitAndAccept} disabled={isImporting}><IconTruckDelivery /> Приеми</Button>

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
          <DeliveryTable
            isDraft={true}
            lines={items}
            setLines={setItems}
            oldPriceByProductId={(pid) => {
              const product = products.find(p => p.id === pid);
              return product?.deliveryPrice;
            }}
            oldClientPriceByProductId={(pid) => {
              const product = products.find(p => p.id === pid);
              return product?.clientPrice;
            }}
            onPickProduct={(idx) => openProductPicker({ onSelect: (p) => {
              setItems(prev => prev.map((row, i) => i === idx ? { ...row, productId: p.id, barcode: p.barcode || '', name: p.name || '', edited: true } : row));
            }})}
            onPickNewProduct={(cfg) => openProductPicker(cfg)}
            storageStockByProduct={storageStockByProduct}
          />

          <div className="flex gap-2">

          </div>
    </div>
  );
}


