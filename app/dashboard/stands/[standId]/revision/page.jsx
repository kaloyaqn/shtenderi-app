"use client"

import { useEffect, useState, useRef, use } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { CheckCircle, XCircle, Barcode, Package } from 'lucide-react';

const Html5QrcodeScanner = dynamic(
  () => import('html5-qrcode').then(mod => mod.Html5Qrcode),
  { ssr: false }
);

export default function StandRevisionPage({ params }) {
  const { standId } = use(params);
  const [products, setProducts] = useState([]); // [{product, quantity}]
  const [remaining, setRemaining] = useState([]); // [{barcode, name, remaining}]
  const [checked, setChecked] = useState([]); // [{barcode, name, checked}]
  const [finished, setFinished] = useState(false);
  const [report, setReport] = useState(null);
  const inputRef = useRef();
  const [scannerOpen, setScannerOpen] = useState(false);
  const scannerRef = useRef(null);
  const [revisionId, setRevisionId] = useState(null);

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

  useEffect(() => {
    if (!scannerOpen) return;
    let html5QrCode;
    let running = true;
    import('html5-qrcode').then(({ Html5Qrcode, Html5QrcodeSupportedFormats }) => {
      html5QrCode = new Html5Qrcode('barcode-scanner');
      html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 300, height: 120 },
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.EAN_8,
          ],
        },
        (decodedText) => {
          if (running) {
            setScannerOpen(false);
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.value = decodedText;
                const event = new Event('input', { bubbles: true });
                inputRef.current.dispatchEvent(event);
                inputRef.current.form?.dispatchEvent(new Event('submit', { bubbles: true }));
              }
            }, 200);
            html5QrCode.stop();
          }
        },
        (error) => {
          // ignore scan errors
        }
      );
      scannerRef.current = html5QrCode;
    });
    return () => {
      running = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [scannerOpen]);

  // Always autofocus barcode input when scanner closes or after reset
  useEffect(() => {
    if (!scannerOpen && !finished) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [scannerOpen, finished]);

  // Handle barcode scan
  const handleScan = (e) => {
    e.preventDefault();
    const barcode = e.target.barcode.value.trim();
    if (!barcode) return;
    const prod = products.find(p => p.product.barcode === barcode);
    if (!prod) {
      toast.error('Продукт с този баркод не е намерен.');
      e.target.reset();
      inputRef.current?.focus();
      return;
    }
    const origQty = prod.quantity;
    if (origQty === 0) {
      toast.warning('Няма налични бройки от този продукт.');
      e.target.reset();
      inputRef.current?.focus();
      return;
    }
    const remainingItem = remaining.find(p => p.barcode === barcode);
    if (remainingItem && remainingItem.remaining === 0) {
      toast.warning('Няма налични бройки от този продукт.');
      e.target.reset();
      inputRef.current?.focus();
      return;
    }
    const checkedItem = checked.find(p => p.barcode === barcode);
    if (checkedItem && checkedItem.checked >= origQty) {
      toast.warning('Няма толкова налични бройки от този продукт.');
      e.target.reset();
      inputRef.current?.focus();
      return;
    }
    setRemaining(prev => prev.map(p => {
      if (p.barcode === barcode && p.remaining > 0) {
        return { ...p, remaining: p.remaining - 1 };
      }
      return p;
    }));
    setChecked(prev => {
      const idx = prev.findIndex(p => p.barcode === barcode);
      if (idx !== -1) {
        return prev.map((p, i) => i === idx ? { ...p, checked: p.checked + 1 } : p);
      } else {
        return [...prev, { barcode, name: prod.product.name, checked: 1 }];
      }
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
        const data = await res.json();
        setRevisionId(data.id);
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
    <div className="container mx-auto py-4 px-2 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4 text-center">Ревизия на щанд</h1>
      {!finished && (
        <>
          <form onSubmit={handleScan} className="mb-2 flex flex-col sm:flex-row gap-2 items-stretch">
            <input
              name="barcode"
              ref={inputRef}
              autoFocus
              placeholder="Сканирай или въведи баркод..."
              className="border rounded-full px-4 py-3 text-lg w-full shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
              autoComplete="off"
              inputMode="numeric"
              pattern="[0-9]*"
            />
            <Button type="submit" className="w-full sm:w-auto text-lg py-3 rounded-full">Добави</Button>
          </form>
          <div className="flex justify-center mb-2">
            <Button variant="ghost" className="text-base px-4 py-2 rounded-full" onClick={handleReset}>Изчисти</Button>
          </div>
          <div className="text-sm text-muted-foreground mb-2 text-center">Можеш да въведеш баркод ръчно</div>
        </>
      )}
      {/* Product list as cards - only show if not finished */}
      {!finished && (
        <>
          <h2 className="text-lg font-semibold mb-2 mt-6 flex items-center gap-2"><Package size={20}/> Списък с продукти на щанда</h2>
          <div className="grid gap-2 mb-6 sm:grid-cols-2">
            {remaining.map(p => (
              <div key={p.barcode} className={`rounded-lg border p-3 flex flex-col gap-1 shadow-sm ${finished && p.remaining > 0 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-muted/50'}`}>
                <div className="font-semibold text-base flex items-center gap-2">
                  <Barcode size={18} className="text-muted-foreground"/>{p.barcode}
                </div>
                <div className="text-sm font-medium break-words">{p.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">Оставащи:</span>
                  <span className="font-bold text-lg">{p.remaining}</span>
                  {finished && p.remaining > 0 && <XCircle className="text-red-400 ml-2" size={18}/>} 
                  {finished && p.remaining === 0 && <CheckCircle className="text-green-500 ml-2" size={18}/>} 
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {/* Checked products as cards */}
      <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><CheckCircle size={20} className="text-green-500"/> Проверени продукти</h2>
      <div className="grid gap-2 mb-6 sm:grid-cols-2">
        {checked.length === 0 && <div className="text-muted-foreground text-sm">Няма проверени продукти.</div>}
        {checked.map(p => (
          <div key={p.barcode} className="rounded-lg border p-3 flex flex-col gap-1 bg-green-50 border-green-200 text-green-900 shadow-sm">
            <div className="font-semibold text-base flex items-center gap-2">
              <Barcode size={18} className="text-muted-foreground"/>{p.barcode}
            </div>
            <div className="text-sm font-medium break-words">{p.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">Проверени:</span>
              <span className="font-bold text-lg">{p.checked}</span>
              <CheckCircle className="text-green-500 ml-2" size={18}/>
            </div>
          </div>
        ))}
      </div>
      {/* Missing products as cards after finish */}
      {finished && report && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-red-700"><XCircle size={20}/> Липсващи продукти</h2>
          {report.length === 0 ? (
            <div className="text-green-600">Няма липсващи продукти!</div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {report.map((item, i) => (
                <div key={item.barcode} className="rounded-lg border p-3 flex flex-col gap-1 bg-red-50 border-red-200 text-red-700 shadow-sm">
                  <div className="font-semibold text-base flex items-center gap-2">
                    <Barcode size={18} className="text-muted-foreground"/>{item.barcode}
                  </div>
                  <div className="text-sm font-medium break-words">{item.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">Оставащи:</span>
                    <span className="font-bold text-lg">{item.remaining}</span>
                    <XCircle className="text-red-400 ml-2" size={18}/>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Show link to revision if available */}
          {revisionId && (
            <div className="flex justify-center mt-6">
              <a
                href={`/dashboard/revisions/${revisionId}`}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-8 py-3 text-lg shadow transition"
              >
                Виж ревизията
              </a>
            </div>
          )}
        </div>
      )}
      {/* Complete button at the bottom */}
      {!finished && (
        <div className="flex justify-center mt-6 mb-4">
          <Button
            onClick={handleFinish}
            disabled={products.length === 0}
            className="text-lg px-8 py-3 rounded-full font-bold"
          >
            <CheckCircle size={22} className="mr-2" /> Приключи ревизията
          </Button>
        </div>
      )}
    </div>
  );
} 