"use client"

import { useEffect, useState, useRef, use } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function StandRevisionPage({ params }) {
  const { standId } = use(params);
  const [products, setProducts] = useState([]); // [{product, quantity}]
  const [remaining, setRemaining] = useState([]); // [{barcode, name, remaining}]
  const [checked, setChecked] = useState([]); // [{barcode, name, checked}]
  const [finished, setFinished] = useState(false);
  const [report, setReport] = useState(null);
  const inputRef = useRef();

  // Fetch products for this stand
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch(`/api/stands/${standId}/products`);
      const data = await res.json();
      setProducts(data);
      setRemaining(data.map(p => ({
        barcode: p.product.barcode,
        name: p.product.name,
        remaining: p.quantity,
      })));
      setChecked([]);
    };
    fetchProducts();
  }, [standId]);

  // Handle barcode scan
  const handleScan = (e) => {
    e.preventDefault();
    const barcode = e.target.barcode.value.trim();
    if (!barcode) return;
    setRemaining(prev => prev.map(p => {
      if (p.barcode === barcode && p.remaining > 0) {
        return { ...p, remaining: p.remaining - 1 };
      }
      return p;
    }));
    setChecked(prev => {
      const idx = prev.findIndex(p => p.barcode === barcode);
      if (idx !== -1) {
        // Already checked, increment
        return prev.map((p, i) => i === idx ? { ...p, checked: p.checked + 1 } : p);
      } else {
        // New checked
        const prod = products.find(p => p.product.barcode === barcode);
        if (prod) {
          return [...prev, { barcode, name: prod.product.name, checked: 1 }];
        }
      }
      return prev;
    });
    e.target.reset();
    inputRef.current?.focus();
  };

  // Finish revision and generate report
  const handleFinish = async () => {
    setFinished(true);
    const missing = remaining.filter(p => p.remaining > 0);
    setReport(missing);
    // Save revision to API with a placeholder userId
    if (missing.length > 0) {
      try {
        const res = await fetch('/api/revisions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            standId,
            userId: 'ecc03da6-d498-47f2-8bfc-52273ca7c7bb',
            missingProducts: missing.map(m => ({
              productId: products.find(p => p.product.barcode === m.barcode)?.product.id,
              missingQuantity: m.remaining,
            })).filter(mp => mp.productId),
          }),
        });
        if (!res.ok) throw new Error('Грешка при запис на ревизията');
        toast.success('Ревизията е записана успешно!');
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  // Reset revision
  const handleReset = () => {
    setRemaining(products.map(p => ({
      barcode: p.product.barcode,
      name: p.product.name,
      remaining: p.quantity,
    })));
    setChecked([]);
    setFinished(false);
    setReport(null);
    inputRef.current?.focus();
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Ревизия на щанд</h1>
      {!finished && (
        <>
          <form onSubmit={handleScan} className="mb-4 flex gap-2">
            <input
              name="barcode"
              ref={inputRef}
              autoFocus
              placeholder="Сканирай или въведи баркод..."
              className="border rounded px-2 py-1 flex-1"
              autoComplete="off"
            />
            <Button type="submit">Добави</Button>
          </form>
          <div className="mb-4">
            <Button variant="outline" onClick={handleFinish} disabled={products.length === 0}>Приключи ревизията</Button>
            <Button variant="ghost" onClick={handleReset} className="ml-2">Изчисти</Button>
          </div>
        </>
      )}
      <h2 className="text-lg font-semibold mb-2">Списък с продукти на щанда</h2>
      <table className="w-full border rounded mb-6">
        <thead>
          <tr className="bg-muted">
            <th className="p-2 text-left">Име</th>
            <th className="p-2 text-left">Баркод</th>
            <th className="p-2 text-left">Оставащи бройки</th>
          </tr>
        </thead>
        <tbody>
          {remaining.map(p => (
            <tr key={p.barcode} className={finished && p.remaining > 0 ? 'bg-red-100 text-red-700' : ''}>
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.barcode}</td>
              <td className="p-2">{p.remaining}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mb-2">Проверени продукти</h2>
      <table className="w-full border rounded mb-6">
        <thead>
          <tr className="bg-muted">
            <th className="p-2 text-left">Име</th>
            <th className="p-2 text-left">Баркод</th>
            <th className="p-2 text-left">Проверени бройки</th>
          </tr>
        </thead>
        <tbody>
          {checked.map(p => (
            <tr key={p.barcode}>
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.barcode}</td>
              <td className="p-2">{p.checked}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {finished && report && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-red-700">Липсващи продукти</h2>
          {report.length === 0 ? (
            <div className="text-green-600">Няма липсващи продукти!</div>
          ) : (
            <table className="w-full border rounded">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Име</th>
                  <th className="p-2 text-left">Баркод</th>
                  <th className="p-2 text-left">Оставащи бройки</th>
                </tr>
              </thead>
              <tbody>
                {report.map((item, i) => (
                  <tr key={item.barcode} className="bg-red-100 text-red-700">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.barcode}</td>
                    <td className="p-2">{item.remaining}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Button className="mt-4" onClick={handleReset}>Нова ревизия</Button>
        </div>
      )}
    </div>
  );
} 