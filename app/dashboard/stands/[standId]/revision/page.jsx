"use client"

import { useEffect, useState, useRef, use } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { CheckCircle, XCircle, Barcode, Package, BarcodeIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const [standName, setStandName] = useState('');
  const [showCheck, setShowCheck] = useState(false);
  const [inputReadOnly, setInputReadOnly] = useState(false);

  // Detect mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInputReadOnly(window.innerWidth <= 768);
    }
  }, []);

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

  // Fetch stand name
  useEffect(() => {
    const fetchStand = async () => {
      const res = await fetch(`/api/stands/${standId}`);
      if (res.ok) {
        const data = await res.json();
        setStandName(data.name || '');
      }
    };
    fetchStand();
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
    setShowCheck(true);
    setTimeout(() => setShowCheck(false), 2000);
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

  // Before rendering, sort remaining so checked are on the bottom
  const sortedRemaining = [...remaining].sort((a, b) => {
    if (a.remaining === 0 && b.remaining !== 0) return 1;
    if (a.remaining !== 0 && b.remaining === 0) return -1;
    return 0;
  });

  return (
    <div className="pb-15">
      {standName && (
        <>
      <h1 className="text-xl font-semibold mt-4 mb-4 text-center">Ревизия на {standName}</h1>
      </>
      )}

      {!finished && (
        <>
          <form onSubmit={handleScan} className="mb-2 flex flex-col sm:flex-row gap-2 items-stretch relative">
            <input
              name="barcode"
              ref={inputRef}
              placeholder="Сканирай или въведи баркод..."
              className="border relative rounded-full px-4 py-3 text-lg w-full shadow-sm focus:ring-2 focus:ring-blue-400 outline-none pr-10"
              autoComplete="off"
              inputMode="numeric"
              pattern="[0-9]*"
              readOnly={inputReadOnly}
              onFocus={() => setInputReadOnly(false)}
            />
            {showCheck && (
              <div className='absolute right-3 w-7 h-7 flex justify-center items-center rounded-full text-center bg-lime-500 text-lime-900  top-3.5'>
              <CheckCircle className="" size={22} />

              </div>
            )}
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
            {sortedRemaining.map(p => (
              <div key={p.barcode} className={`rounded-sm border border-[1px] flex flex-col justify-between p-3 ${finished ? (p.remaining > 0 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-900') : ''}`}>
                <h3 className='text-sm text-gray-700 leading-[110%]'>{p.name}</h3>
                <div className='w-full flex justify-between items-end'>
                  <div className='text-xs inline-flex items-center mt-1 gap-2 px-[4px] py-1 bg-gray-50 text-gray-600 rounded-[2px]'>
                    <Barcode size={12} />
                    <span className='leading-tight'>{p.barcode}</span>
                  </div>
                  <h6 className='font-bold text-base gray-900'>{p.remaining}</h6>
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
          <div key={p.barcode} className='rounded-sm border border-green-200 bg-green-50 p-3 flex flex-col justify-between text-green-900'>
            <h3 className='text-sm leading-[110%]'>{p.name}</h3>
            <div className='w-full flex justify-between items-end'>
              <div className='text-xs inline-flex items-center mt-1 gap-2 px-[4px] py-1 bg-green-100 border border-green-300 text-gray-600 rounded-[2px]'>
                <Barcode size={12} />
                <span className='leading-tight'>{p.barcode}</span>
              </div>
              <h6 className='font-bold text-base'>{p.checked}</h6>
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
                <div key={item.barcode} className='rounded-sm border border-red-200 bg-red-50 p-3 flex flex-col justify-between text-red-700'>
                  <h3 className='text-sm leading-[110%]'>{item.name}</h3>
                  <div className='w-full flex justify-between items-end'>
                    <div className='text-xs inline-flex items-center mt-1 gap-2 px-[4px] py-1 bg-gray-50 text-gray-600 rounded-[2px]'>
                      <Barcode size={12} />
                      <span className='leading-tight'>{item.barcode}</span>
                    </div>
                    <h6 className='font-bold text-base'>{item.remaining}</h6>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Show link to revision if available */}
          {revisionId && (
            <div className="flex w-full justify-center mt-6">
              <a
                href={`/dashboard/revisions/${revisionId}`}
                className="inline-block bg-blue-600 w-full text-center hover:bg-blue-700 text-white font-bold rounded-full px-8 py-3 text-lg shadow transition"
              >
                Виж ревизията
              </a>
            </div>
          )}
        </div>
      )}
      {/* Complete button at the bottom */}
      {!finished && (
        <div className="flex w-full justify-center mt-6 mb-4">
          <Button
            onClick={handleFinish}
            disabled={products.length === 0}
            className="text-lg w-full px-8 py-8 rounded-sm font-bold"
          >
            <CheckCircle size={22} className="mr-2" /> Приключи ревизията
          </Button>
        </div>
      )}
    </div>
  );
} 