"use client"

import { useEffect, useState, useRef, use } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { CheckCircle, XCircle, Barcode, Package, BarcodeIcon, PlusIcon, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

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
  const [pendingProducts, setPendingProducts] = useState({}); // barcode -> { product, quantity }
  const { data: session } = useSession();
  const userId = session?.user?.id || null;

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
  const handleScan = async (e) => {
    e.preventDefault();
    const barcode = e.target.barcode.value.trim();
    if (!barcode) return;
    const prod = products.find(p => p.product.barcode === barcode);
    if (!prod) {
      // Try to fetch product by barcode
      let productData = null;
      try {
        const res = await fetch(`/api/products?barcode=${barcode}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            productData = data[0];
          }
        }
      } catch {}
      if (!productData) {
        toast.error('Продукт с този баркод не е намерен.');
        try {
          new Audio('/error.mp3').play();
        } catch (err) {}
        e.target.reset();
        inputRef.current?.focus();
        return;
      }
      // Add to pendingProducts
      setPendingProducts(prev => {
        if (prev[barcode]) {
          return { ...prev, [barcode]: { ...prev[barcode], quantity: prev[barcode].quantity + 1 } };
        } else {
          return { ...prev, [barcode]: { product: productData, quantity: 1 } };
        }
      });
      e.target.reset();
      setShowCheck(true);
      setTimeout(() => setShowCheck(false), 2000);
      inputRef.current?.focus();
      return;
    }
    const origQty = prod.quantity;
    if (origQty === 0) {
      toast.warning('Няма налични бройки от този продукт.');
      try {
        new Audio('/error.mp3').play();
      } catch (err) {}
      e.target.reset();
      inputRef.current?.focus();
      return;
    }
    const remainingItem = remaining.find(p => p.barcode === barcode);
    if (remainingItem && remainingItem.remaining === 0) {
      toast.warning('Няма налични бройки от този продукт.');
      try {
        new Audio('/error.mp3').play();
      } catch (err) {}
      e.target.reset();
      inputRef.current?.focus();
      return;
    }
    const checkedItem = checked.find(p => p.barcode === barcode);
    if (checkedItem && checkedItem.checked >= origQty) {
      toast.warning('Няма толкова налични бройки от този продукт.');
      try {
        new Audio('/error.mp3').play();
      } catch (err) {}
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
    // Play success sound
    try {
      new Audio('/success.mp3').play();
    } catch (err) {}
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
    // Add pending products to stand with quantity 0
    const pendingBarcodes = Object.keys(pendingProducts);
    for (const barcode of pendingBarcodes) {
      const { product } = pendingProducts[barcode];
      // Call API to add to standProducts if not already present
      await fetch(`/api/stands/${standId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 0 }),
      });
    }
    // Build missingProducts: original missing + all pending products
    const missingProducts = [
      ...missing.map(m => ({
        productId: products.find(p => p.product.barcode === m.barcode)?.product.id,
        missingQuantity: m.remaining,
      })).filter(mp => mp.productId),
      ...pendingBarcodes.map(barcode => ({
        productId: pendingProducts[barcode].product.id,
        missingQuantity: pendingProducts[barcode].quantity,
      })),
    ];
    // Always create a revision, even if there are no missing products
    try {
      const res = await fetch('/api/revisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standId,
          userId,
          missingProducts,
        }),
      });
      if (!res.ok) throw new Error('Грешка при запис на продажбата');
      const data = await res.json();
      setRevisionId(data.id);
      toast.success('Продажбата е записана успешно!');
    } catch (err) {
      toast.error(err.message);
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

  // Merge products and pendingProducts for display
  const allProducts = [
    ...products.map(p => {
      const rem = remaining.find(r => r.barcode === p.product.barcode);
      return {
        barcode: p.product.barcode,
        name: p.product.name,
        quantity: rem ? rem.remaining : p.quantity,
        isPending: false,
      };
    }),
    ...Object.values(pendingProducts).map(({ product, quantity }) => ({
      barcode: product.barcode,
      name: product.name,
      quantity,
      isPending: true,
    })),
  ];

  return (
    <div className="pb-15">
      {standName && (
      <h1 className="text-xl lg:text-2xl font-bold md:pb-4 md:p-0 p-4 border-b mb-4">Чекиране на {standName}</h1>
      )}

<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
<div className="lg:col-span-1">
{!finished && (
        <Card>
          <CardContent>
            <CardTitle className='mb-2'>Сканиране</CardTitle>
            <form onSubmit={handleScan} className="mb-2 flex flex-col gap-2 items-stretch relative">
            <Input
              name="barcode"
              ref={inputRef}
              placeholder="Сканирай или въведи баркод..."
              className=""
              autoComplete="off"
              inputMode="numeric"
              pattern="[0-9]*"
              readOnly={inputReadOnly}
              onFocus={() => setInputReadOnly(false)}
            />
            <Button type="submit" className=""> <PlusIcon /> Добави</Button>
          </form>
          <div className="text-center p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
            <b>Съвет:</b> <br />
            Можеш да сканираш нови продукти и да въвеждаш ръчно баркод
          </div>
          </CardContent>
        </Card>
      )}
</div>

<div className="lg:col-span-2 gap-4 w-full">
  <Card>
  {!finished && (
        <CardContent>
          <CardTitle className="text-base font-semibold mb-2  flex items-center gap-2"><Package size={20}/> Списък с продукти на щанда</CardTitle>
          <div className="grid gap-2 mb-6 sm:grid-cols-2">
            {allProducts.map(p => (
              <div key={p.barcode} className={`rounded-sm border border-[1px] flex flex-col justify-between p-3 ${p.isPending ? 'bg-yellow-100 border-yellow-400' : ''}`}>
                <h3 className='text-sm text-gray-700 leading-[110%]'>{p.name}</h3>
                <div className='w-full flex justify-between items-end'>
                  <div className='text-xs inline-flex items-center mt-1 gap-2 px-[4px] py-1 bg-gray-50 text-gray-600 rounded-[2px]'>
                    <Barcode size={12} />
                    <span className='leading-tight'>{p.barcode}</span>
                  </div>
                  <h6 className='font-bold text-base gray-900'>{p.quantity}</h6>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
  </Card>

  <Card className='mt-2'>
      <CardContent>
      <CardTitle className="text-lg font-semibold mb-2 flex items-center gap-2"><CheckCircle size={20} className="text-green-500"/> Непродадени продукти</CardTitle>
      <div className="grid gap-2 mb-6 sm:grid-cols-2">
        {checked.length === 0 && <div className="text-muted-foreground text-sm">Няма непродадени продукти.</div>}
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
      </CardContent>
  </Card>

  {!revisionId && (
      <Button  
      onClick={handleFinish}
      disabled={products.length === 0}
size="lg" className='w-full! h-15 mt-3'>
<CheckCircle />  Приключи чекиране
</Button>
  )}

  {revisionId && (
            <div className="flex w-full justify-center">
            <Link
            className='w-full'
                href={`/dashboard/revisions/${revisionId}`}
            
            >
            <Button
                className="w-full! h-15 mt-3 bg-blue-600 hover:bg-blue-700"
              >

                <Eye />
                Виж продажбата
              </Button>
            </Link>
            </div>
          )}
</div>
</div>


    </div>
  );
} 