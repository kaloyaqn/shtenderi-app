"use client";
import { Input } from "@/components/ui/input";
import React from 'react';

export default function DeliveryTable({
  isDraft = true,
  lines = [],
  setLines,
  oldPriceByProductId = () => undefined,
  onPickProduct, 
  onPickNewProduct, 
  storageStockByProduct = {}, 
  oldClientPriceByProductId = () => undefined,
}) {
  const [addCode, setAddCode] = React.useState("");
  const [addPcd, setAddPcd] = React.useState("");
  const [addProduct, setAddProduct] = React.useState(null);
  const [addQty, setAddQty] = React.useState("");
  const [addUnit, setAddUnit] = React.useState("");
  const [addClient, setAddClient] = React.useState("");
  const totalQty = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);
  const totalDelivery = lines.reduce((sum, l) => sum + (Number(l.quantity || 0) * Number(l.unitPrice || 0)), 0);
  const totalClient = lines.reduce((sum, l) => sum + (Number(l.quantity || 0) * Number(l.clientPrice || 0)), 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="text-left text-xs uppercase text-gray-500">
            <th className="p-2 border-b">Код / EAN</th>
            <th className="p-2 border-b">Продукт</th>
            <th className="p-2 border-b">Стара доставна</th>
            <th className="p-2 border-b">Стара клиентска</th>
            <th className="p-2 border-b">Бройки</th>
            <th className="p-2 border-b">Дост. цена</th>
            <th className="p-2 border-b">Продажна цена</th>
            <th className="p-2 border-b">ПЦД</th>
            <th className="p-2 border-b">Средна (преглед)</th>
          </tr>
        </thead>
        <tbody>
          {isDraft && (
            <tr>
              <td className="p-2 align-middle">
                <Input
                  placeholder="Код / EAN"
                  value={addCode}
                  onFocus={() => onPickNewProduct && onPickNewProduct({ onSelect: (p) => { setAddProduct(p); setAddCode(p.barcode || ""); setAddPcd(p.pcd || p.pcode || ""); } })}
                  onChange={(e) => setAddCode(e.target.value)}
                />
              </td>
              <td className="p-2 align-middle text-sm text-gray-800 truncate max-w-[360px]">{addProduct?.name || '-'}</td>
              <td className="p-2 align-middle text-sm text-gray-600">{addProduct?.deliveryPrice ?? '-'}</td>
              <td className="p-2 align-middle text-sm text-gray-600">{addProduct?.clientPrice ?? '-'}</td>
              <td className="p-2 align-middle">
                <Input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={addQty}
                  onChange={(e) => setAddQty(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') {
                    if (!addProduct || !addQty || !addUnit) return;
                    setLines(prev => [{ productId: addProduct.id, barcode: addProduct.barcode || '', pcd: addPcd || addProduct.pcd || addProduct.pcode || '', name: addProduct.name || '', quantity: Number(addQty), unitPrice: Number(addUnit), clientPrice: addClient === '' ? 0 : Number(addClient), imported: false, edited: true }, ...prev]);
                    setAddCode(''); setAddPcd(''); setAddProduct(null); setAddQty(''); setAddUnit(''); setAddClient('');
                  }}}
                />
              </td>
              <td className="p-2 align-middle">
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={addUnit}
                  onChange={(e) => setAddUnit(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') {
                    if (!addProduct || !addQty || !addUnit) return;
                    setLines(prev => [{ productId: addProduct.id, barcode: addProduct.barcode || '', pcd: addPcd || addProduct.pcd || addProduct.pcode || '', name: addProduct.name || '', quantity: Number(addQty), unitPrice: Number(addUnit), clientPrice: addClient === '' ? 0 : Number(addClient), imported: false, edited: true }, ...prev]);
                    setAddCode(''); setAddPcd(''); setAddProduct(null); setAddQty(''); setAddUnit(''); setAddClient('');
                  }}}
                />
              </td>
              <td className="p-2 align-middle">
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={addClient}
                  onChange={(e) => setAddClient(e.target.value)}
                  // no submit on client price
                />
              </td>
              <td className="p-2 align-middle">
                <Input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="ПЦД"
                  value={addPcd}
                  onFocus={() => { if (addPcd === '0') setAddPcd(''); }}
                  onChange={(e) => setAddPcd(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') {
                    if (!addProduct || !addQty || !addUnit) return;
                    setLines(prev => [{ productId: addProduct.id, barcode: addProduct.barcode || '', pcd: addPcd || addProduct.pcd || addProduct.pcode || '', name: addProduct.name || '', quantity: Number(addQty), unitPrice: Number(addUnit), clientPrice: addClient === '' ? 0 : Number(addClient), imported: false, edited: true }, ...prev]);
                    setAddCode(''); setAddPcd(''); setAddProduct(null); setAddQty(''); setAddUnit(''); setAddClient('');
                  }}}
                />
              </td>
              <td className="p-2 align-middle text-sm text-gray-800">-</td>
            </tr>
          )}
          {lines.map((ln, i) => {
            const key = ln.productId != null ? String(ln.productId) : undefined;
            const oldPrice = Number(oldPriceByProductId(ln.productId) || 0);
            const qOld = Number((key && storageStockByProduct?.[key]) || 0);
            const qNew = Number(ln.quantity || 0);
            const pNew = Number(ln.unitPrice || 0);
            const avgPreview = (qOld + qNew) > 0 ? (((qOld * oldPrice) + (qNew * pNew)) / (qOld + qNew)).toFixed(4) : '-';
            return (
              <tr key={i} className={`text-sm ${ln.imported && !ln.edited ? 'bg-red-50' : ''}`}>
                <td className="p-2 border-t">{ln.barcode || '-'}</td>
                <td className="p-2 border-t">{ln.name || '-'}</td>
                <td className="p-2 border-t">{oldPrice ? oldPrice : '-'}</td>
                <td className="p-2 border-t">{(() => { const oc = oldClientPriceByProductId(ln.productId); return oc != null ? oc : '-'; })()}</td>
                <td className="p-2 border-t">
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={(ln.quantity === undefined || ln.quantity === null || ln.quantity === '') ? '' : String(ln.quantity)}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setLines(prev => prev.map((row, idx) => idx === i ? { ...row, quantity: raw === '' ? '' : Number(raw), edited: true } : row));
                    }}
                  />
                </td>
                <td className="p-2 border-t">
                  <Input type="number" step="0.01" min={0} value={ln.unitPrice}
                    onChange={(e) => setLines(prev => prev.map((row, idx) => idx === i ? { ...row, unitPrice: Number(e.target.value), edited: true } : row))}
                  />
                </td>
                <td className="p-2 border-t">
                  <Input type="number" step="0.01" min={0} value={ln.clientPrice}
                    onChange={(e) => setLines(prev => prev.map((row, idx) => idx === i ? { ...row, clientPrice: Number(e.target.value), edited: true } : row))}
                  />
                </td>
                <td className="p-2 border-t">
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={(ln.pcd === undefined || ln.pcd === null) ? '' : String(ln.pcd)}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setLines(prev => prev.map((row, idx) => idx === i ? { ...row, pcd: raw, edited: true } : row));
                    }}
                  />
                </td>
                <td className="p-2 border-t">{avgPreview}</td>
              </tr>
            );
          })}
          {/* Footer row totals */}
          <tr className="bg-gray-50 font-medium">
            <td className="p-2 border-t"></td>
            <td className="p-2 border-t text-right">Общо:</td>
            <td className="p-2 border-t"></td>
            <td className="p-2 border-t">{totalQty}</td>
            <td className="p-2 border-t">{totalDelivery.toFixed(2)} лв.</td>
            <td className="p-2 border-t">{totalClient.toFixed(2)} лв.</td>
            <td className="p-2 border-t"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}


