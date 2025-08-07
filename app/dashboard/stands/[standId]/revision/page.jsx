"use client"

import { useEffect, useState, useRef, use } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Barcode, Package, PlusIcon, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import BasicHeader from '@/components/BasicHeader';
import LoadingScreen from '@/components/LoadingScreen';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function StandRevisionPage({ params, searchParams }) {
  const { standId } = use(params);
  const checkIdFromParams = searchParams?.checkId || null;
  const [mode, setMode] = useState(checkIdFromParams ? 'sale' : 'check');
  const [checkId, setCheckId] = useState(checkIdFromParams);
  const [products, setProducts] = useState([]); // [{product, quantity}]
  const [remaining, setRemaining] = useState([]); // [{barcode, name, remaining}]
  const [checked, setChecked] = useState([]); // [{barcode, name, checked}]
  const [finished, setFinished] = useState(false);
  const inputRef = useRef();
  const [revisionId, setRevisionId] = useState(null);
  const [standName, setStandName] = useState('');
  const [finishing, setFinishing] = useState(false); // loading state for finish button
  const [checkAlreadyHasRevision, setCheckAlreadyHasRevision] = useState(false); // track if check already has revision
  const { data: session } = useSession();
  const userId = session?.user?.id || null;
  const router = useRouter();



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

  // If checkIdFromParams, fetch check and set missing products for sale mode
  useEffect(() => {
    if (checkIdFromParams && mode === 'sale') {
      fetch(`/api/stands/${standId}/checks/${checkIdFromParams}`)
        .then(res => res.json())
        .then(check => {
          console.log('Check data loaded:', check);
          console.log('Check revisions:', check.revisions);
          
          // Check if this check already has a revision
          if (check.revisions && check.revisions.length > 0) {
            console.log('Check already has revision, setting error state');
            setCheckAlreadyHasRevision(true);
            return;
          }
          
          // Set up missing products for sale mode
          setRemaining(
            check.checkedProducts.map(cp => ({
              barcode: cp.product.barcode,
              name: cp.product.name,
              remaining: cp.quantity,
            }))
          );
          setProducts(
            check.checkedProducts.map(cp => ({
              product: cp.product,
              quantity: cp.quantity,
            }))
          );
        })
        .catch(err => {
          console.error('Error fetching check:', err);
        });
    }
  }, [checkIdFromParams, mode, standId]);

  // Always autofocus barcode input when scanner closes or after reset
  useEffect(() => {
    if (!finished) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [finished]);

  // Handle barcode scan
  const handleScan = async (e) => {
    e.preventDefault();
    const barcode = e.target.barcode.value.trim();
    if (!barcode) return;
    const prod = products.find(p => p.product.barcode === barcode);
    // Check if product is inactive
    if (prod && prod.product && prod.product.active === false) {
      toast.error('Продуктът е неактивен, моля свържете се с администратор');
      try {
        new Audio('/error.mp3').play();
      } catch (err) {}
      e.target.reset();
      inputRef.current?.focus();
      return;
    }
    if (!prod) {
      // Product not found in stand inventory - show error
      toast.error('Продуктът не съществува в инвентара на този щендер.');
      try {
        new Audio('/error.mp3').play();
      } catch (err) {}
      e.target.reset();
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
        // If product already exists, update it and move to front
        const updated = prev.map((p, i) => i === idx ? { ...p, checked: p.checked + 1 } : p);
        const item = updated[idx];
        const withoutItem = updated.filter((_, i) => i !== idx);
        return [item, ...withoutItem];
      } else {
        // If new product, add to front
        return [{ barcode, name: prod.product.name, checked: 1 }, ...prev];
      }
    });
    // Play success sound
    try {
      new Audio('/success.mp3').play();
    } catch (err) {}
    e.target.reset();
    inputRef.current?.focus();
  };

  // Finish revision and generate report
  const handleFinish = async () => {
    setFinishing(true);
    setFinished(true);
    const missing = remaining.filter(p => p.remaining > 0);
    if (mode === 'check') {
      // Create a check
      const checkedProducts = products.map(p => {
        const rem = remaining.find(r => r.barcode === p.product.barcode);
        return {
          productId: p.product.id,
          quantity: rem ? rem.remaining : 0, // Missing quantity
          originalQuantity: p.quantity, // Original quantity for sale mode
          status: (rem && rem.remaining > 0) ? 'missing' : 'ok',
        };
      });
      try {
        const res = await fetch(`/api/stands/${standId}/checks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, checkedProducts }),
        });
        if (!res.ok) throw new Error('Грешка при запис на проверката');
        const data = await res.json();
        setCheckId(data.id);
        toast.success('Проверката е записана успешно!');
      } catch (err) {
        toast.error(err.message);
      } finally {
        setFinishing(false);
      }
    } else if (mode === 'sale') {
      // Build missingProducts: only from missing
      const missingProducts = [
        ...missing.map(m => {
          const prod = products.find(p => p.product.barcode === m.barcode)?.product;
          return prod ? {
            productId: prod.id,
            missingQuantity: m.remaining,
            clientPrice: prod.clientPrice,
          } : null;
        }).filter(mp => mp && mp.productId),
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
      } finally {
        setFinishing(false);
      }
    }
  };



  // Merge products for display
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
  ];

  // --- SALE MODE STATE ---
  const [saleChecked, setSaleChecked] = useState([]); // [{barcode, name, checked}]
  const [saleUnchecked, setSaleUnchecked] = useState([]); // [{barcode, name, remaining}]
  const [saleLoading, setSaleLoading] = useState(false);
  const [storages, setStorages] = useState([]);
  const [selectedStorage, setSelectedStorage] = useState('');
  const [showEmptySaleConfirm, setShowEmptySaleConfirm] = useState(false);
  const saleInputRef = useRef();

  // When entering sale mode, load only missing products from the check
  useEffect(() => {
    if (mode === 'sale' && checkId) {
      setSaleLoading(true);
      fetch(`/api/stands/${standId}/checks/${checkId}`)
        .then(res => res.json())
        .then(check => {
          const missing = check.checkedProducts.filter(cp => cp.quantity > 0);
          setSaleUnchecked(
            missing.map(cp => ({
              barcode: cp.product.barcode,
              name: cp.product.name,
              remaining: cp.quantity,
              productId: cp.product.id,
              clientPrice: cp.product.clientPrice,
              maxQuantity: cp.quantity, // Track original quantity
            }))
          );
          setSaleChecked([]);
        })
        .finally(() => setSaleLoading(false));
      // Fetch storages for the stand
      fetch('/api/storages')
        .then(res => res.json())
        .then(setStorages)
        .catch(() => setStorages([]));
    }
  }, [mode, checkId, standId]);

  // Auto-select storage for non-admins if only one assigned
  useEffect(() => {
    if (mode === 'sale' && session?.user?.role !== 'ADMIN' && storages.length === 1) {
      setSelectedStorage(storages[0].id);
    }
  }, [mode, session?.user?.role, storages]);

  // Sale scan handler
  const handleSaleScan = (barcode) => {
    const uncheckedProd = saleUnchecked.find(p => p.barcode === barcode);
    // Check if product is inactive
    if (uncheckedProd && uncheckedProd.hasOwnProperty('active') && uncheckedProd.active === false) {
      toast.error('Продуктът е неактивен, моля свържете се с администратор');
      try { new Audio('/error.mp3').play(); } catch {}
      setTimeout(() => saleInputRef.current?.focus(), 100);
      return false;
    }
    if (!uncheckedProd) {
      // Check if product exists in the original sale list (checked or all products)
      const wasInSale = saleChecked.find(p => p.barcode === barcode) || products.find(p => p.product.barcode === barcode);
      if (wasInSale) {
        toast.warning('Надвишено количество');
        try { new Audio('/error.mp3').play(); } catch {}
        setTimeout(() => saleInputRef.current?.focus(), 100);
        return false;
      }
      toast.error('Продукт с този баркод не е намерен.');
      try { new Audio('/error.mp3').play(); } catch {}
      setTimeout(() => saleInputRef.current?.focus(), 100);
      return false;
    }
    if (uncheckedProd.remaining <= 0) {
      toast.warning('Надвишено количество');
      try { new Audio('/error.mp3').play(); } catch {}
      setTimeout(() => saleInputRef.current?.focus(), 100);
      return false;
    }
    setSaleUnchecked(prev => prev.map(p =>
      p.barcode === barcode && p.remaining > 0
        ? { ...p, remaining: p.remaining - 1 }
        : p
    ).filter(p => p.remaining > 0));
    setSaleChecked(prev => {
      const idx = prev.findIndex(p => p.barcode === barcode);
      if (idx !== -1) {
        // If product already exists, update it and move to front
        const updated = prev.map((p, i) => i === idx ? { ...p, checked: p.checked + 1 } : p);
        const item = updated[idx];
        const withoutItem = updated.filter((_, i) => i !== idx);
        return [item, ...withoutItem];
      } else {
        // If new product, add to front
        return [{ barcode: uncheckedProd.barcode, name: uncheckedProd.name, checked: 1, productId: uncheckedProd.productId, clientPrice: uncheckedProd.clientPrice, maxQuantity: uncheckedProd.maxQuantity }, ...prev];
      }
    });
    try { new Audio('/success.mp3').play(); } catch {}
    setTimeout(() => saleInputRef.current?.focus(), 100);
    return true;
  };

  // On finish in sale mode, use the new sale API that handles automatic zeroing
  const handleFinishSale = async () => {
    if (!selectedStorage) {
      toast.error('Моля, изберете склад.');
      return;
    }

    // Check if no products are scanned
    if (saleChecked.length === 0) {
      setShowEmptySaleConfirm(true);
      return;
    }

    setFinishing(true);
    setFinished(true);
    
    try {
      const res = await fetch('/api/revisions/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standId,
          userId,
          checkId,
          saleChecked,
          selectedStorage,
        }),
      });
      
      if (res.status === 409) {
        const data = await res.json();
        if (data.insufficient && data.insufficient.length > 0) {
          const errorList = data.insufficient.map(e => `${e.productName}: нужно ${e.needed}, налично ${e.available}`).join('\n');
          toast.error(`Недостатъчни количества в склада за:\n${errorList}`);
        } else if (data.error && data.error.includes('already has a revision')) {
          toast.error('Тази проверка вече е превърната в продажба. Не можете да създадете дублираща продажба.');
        } else {
          toast.error('Недостатъчни количества в склада.');
        }
        try { new Audio('/error.mp3').play(); } catch {}
        setFinishing(false);
        return;
      }
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Грешка при запис на продажбата');
      }
      
      const data = await res.json();
      setRevisionId(data.id);
      toast.success('Продажбата е записана успешно!');
      // Redirect to revision details page
      router.push(`/dashboard/revisions/${data.id}`);
    } catch (err) {
      toast.error(err.message);
      try { new Audio('/error.mp3').play(); } catch {}
    } finally {
      setFinishing(false);
    }
  };

  // Handle empty sale confirmation
  const handleConfirmEmptySale = async () => {
    setShowEmptySaleConfirm(false);
    setFinishing(true);
    setFinished(true);
    
    try {
      const res = await fetch('/api/revisions/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standId,
          userId,
          checkId,
          saleChecked: [], // Empty array for empty sale
          selectedStorage,
        }),
      });
      
      if (res.status === 409) {
        const data = await res.json();
        if (data.error && data.error.includes('already has a revision')) {
          toast.error('Тази проверка вече е превърната в продажба. Не можете да създадете дублираща продажба.');
        } else {
          toast.error('Грешка при създаване на празна продажба.');
        }
        try { new Audio('/error.mp3').play(); } catch {}
        setFinishing(false);
        return;
      }
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Грешка при запис на продажбата');
      }
      
      const data = await res.json();
      setRevisionId(data.id);
      toast.success('Продажбата е записана успешно!');
      // Redirect to revision details page
      router.push(`/dashboard/revisions/${data.id}`);
    } catch (err) {
      toast.error(err.message);
      try { new Audio('/error.mp3').play(); } catch {}
    } finally {
      setFinishing(false);
    }
  };

  // After finish in check mode, show two buttons
  // - View Check (link to check details page)
  // - Continue to Sale (switches to sale mode, loads missing products from check)
  if (mode === 'check' && finished && checkId) {
    return (
      <>
      <BasicHeader 
      className={'mt-20'}
      title={'Приключена проверка'}
      hasBackButton
      subtitle={'Изберете дали искате да продължите към продажба, или да отидете към страницата с направената проверка'}
      />


            <div className="flex flex-col gap-2 mt-4">
        <Button variant={'outline'} asChild>
          <Link href={`/dashboard/checks/${checkId}`}>Виж проверка</Link>
        </Button>
        <Button
          onClick={async () => {
            setMode('sale');
            setFinished(false);
            // Update URL to include checkId
            const url = new URL(window.location);
            url.searchParams.set('checkId', checkId);
            window.history.pushState({}, '', url);
            
            // Fetch the check and reload missing products for sale mode
            const res = await fetch(`/api/stands/${standId}/checks/${checkId}`);
            const check = await res.json();
            setRemaining(
              check.checkedProducts.map(cp => ({
                barcode: cp.product.barcode,
                name: cp.product.name,
                remaining: cp.quantity,
              }))
            );
            setProducts(
              check.checkedProducts.map(cp => ({
                product: cp.product,
                quantity: cp.quantity,
              }))
            );
          }}
        >
          Продължи към продажба
        </Button>
      </div>
      </>
    );
  }

  // In sale mode, render split UI
  if (mode === 'sale') {
    if (saleLoading) return <LoadingScreen />;
    
    console.log('Sale mode render - checkAlreadyHasRevision:', checkAlreadyHasRevision);
    
    // Show error if check already has a revision
    if (checkAlreadyHasRevision) {
      return (
        <div className="pb-15">
          <BasicHeader title="Грешка" hasBackButton />
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
            <div className="text-center max-w-md">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Проверката вече е превърната в продажба
              </h2>
              <p className="text-gray-600 mb-6">
                Тази проверка вече има създадена продажба. Не можете да създадете дублираща продажба от същата проверка.
              </p>
              <div className="flex flex-col gap-3">
                <Button asChild>
                  <Link href={`/dashboard/checks/${checkId}`}>
                    Виж проверката
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/stands/${standId}`}>
                    Назад към щанда
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="pb-15">
        <BasicHeader title={`Продажба след проверка`}>
          <Button
            onClick={handleFinishSale}
            disabled={finishing || !selectedStorage}
            size="lg"
            className="w-full! h-15 mt-3 mb-4"
          >
            {finishing ? <span className="flex items-center gap-2"><span className="loader mr-2 w-4 h-4 border-2 border-t-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></span>Обработка...</span> : <><CheckCircle />  Приключи продажба</>}
          </Button>
        </BasicHeader>
        <form onSubmit={e => {
          e.preventDefault();
          const barcode = e.target.barcode.value.trim();
          if (barcode) {
            handleSaleScan(barcode);
            e.target.reset();
          }
          setTimeout(() => saleInputRef.current?.focus(), 100);
        }} className="mb-4 flex flex-col gap-2 items-stretch relative">
          <Input
            name="barcode"
            ref={saleInputRef}
            placeholder="Сканирай или въведи баркод..."
            className="h-15"
            autoComplete="off"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <Button type="submit"> <PlusIcon /> Добави</Button>
        </form>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Изберете склад за зареждане:</label>
          <Select onValueChange={setSelectedStorage} value={selectedStorage}>
            <SelectTrigger className={'w-full'}>
              <SelectValue placeholder="Избери склад..." />
            </SelectTrigger>
            <SelectContent>
              {storages.map(storage => (
                <SelectItem key={storage.id} value={storage.id}>{storage.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">

          <div>
            <div className="text-base font-semibold mb-2 flex items-center gap-2"><Package size={20}/> Непродадени продукти (очакват сканиране)</div>
            <div className="grid gap-2 mb-6">
              {saleUnchecked.length === 0 && <div className="text-muted-foreground text-sm">Всички продукти са чекирани.</div>}
              {saleUnchecked.map(p => (
                <div key={p.barcode} className='rounded-sm border p-2 flex flex-col justify-between border-gray-200'>
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
          </div>
          <div>
            <div className="text-lg font-semibold mb-2 flex items-center gap-2"><CheckCircle size={20} className="text-green-500"/>Чекирани продукти (ще бъдат продадени)</div>
            <div className="grid gap-2 mb-6">
              {saleChecked.length === 0 && <div className="text-muted-foreground text-sm">Няма чекирани продукти.</div>}
              {saleChecked.map(p => (
                <div key={p.barcode} className='rounded-sm border p-2 border-green-200 bg-green-50 flex flex-col justify-between text-green-900'>
                  <h3 className='text-sm leading-[110%]'>{p.name}</h3>
                  <div className='w-full flex justify-between items-end'>
                    <div className='text-xs inline-flex items-center mt-1 gap-2 px-[4px] py-1 bg-green-100 text-gray-600 rounded-[2px]'>
                      <Barcode size={12} />
                      <span className='leading-tight'>{p.barcode}</span>
                    </div>
                    <h6 className='font-bold text-base'>{p.checked}</h6>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Empty Sale Confirmation Dialog */}
        <Dialog open={showEmptySaleConfirm} onOpenChange={setShowEmptySaleConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Потвърждение за празна продажба</DialogTitle>
              <DialogDescription>
                Не сте сканирали нито един продукт. Желаете ли да превърнете проверката в продажба?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmptySaleConfirm(false)}>
                Отказ
              </Button>
              <Button onClick={handleConfirmEmptySale}>
                Да, превърни в продажба
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="pb-15">
      <BasicHeader title={`Чекиране на щендер: ${standName}`}>
      {!revisionId && (
      <Button  
      onClick={handleFinish}
      disabled={products.length === 0 || finishing}
      size="lg" className='w-full! h-15 mt-3 mb-4'>
        {finishing ? <span className="flex items-center gap-2"><span className="loader mr-2 w-4 h-4 border-2 border-t-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></span>Обработка...</span> : <><CheckCircle />  Приключи чекиране</>}
      </Button>
      )}
      {revisionId && (
        <Button 
          asChild 
          size="lg" 
          className="w-full! h-15 mb-4 mt-3"
        >
          <Link href={`/dashboard/revisions/${revisionId}`}><Eye className="mr-2"/> Виж продажба</Link>
        </Button>
      )}
      </BasicHeader>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-3">
<div className="lg:col-span-1">

{!finished && (
        <div>
          <div>
            <div className='mb-2'><b>Сканиране</b></div>
            <form onSubmit={handleScan} className="mb-2 flex flex-col gap-2 items-stretch relative">
            <Input
              name="barcode"
              ref={inputRef}
              placeholder="Сканирай или въведи баркод..."
              className="h-15"
              autoComplete="off"
              inputMode="numeric"
              pattern="[0-9]*"
            />
            <Button type="submit" className=""> <PlusIcon /> Добави</Button>
          </form>
          </div>
        </div>
      )}
</div>

<div className="lg:col-span-2 gap-4 w-full">
  {/* Switch order: show Непродадени продукти first */}
  <div className='mb-2'>
      <div>
      <div className="text-lg font-semibold mb-2 flex items-center gap-2"><CheckCircle size={20} className="text-green-500"/>Наличност на стелаж/щендер</div>
      <div className="grid gap-2 mb-6 sm:grid-cols-2">
        {checked.length === 0 && <div className="text-muted-foreground text-sm">Няма непродадени продукти.</div>}
        {checked.map(p => (
          <div key={p.barcode} className='rounded-sm border p-2 border-green-200 bg-green-50 flex flex-col justify-between text-green-900'>
            <h3 className='text-sm leading-[110%]'>{p.name}</h3>
            <div className='w-full flex justify-between items-end'>
              <div className='text-xs inline-flex items-center mt-1 gap-2 px-[4px] py-1 bg-green-100 text-gray-600 rounded-[2px]'>
                <Barcode size={12} />
                <span className='leading-tight'>{p.barcode}</span>
              </div>
              <h6 className='font-bold text-base'>{p.checked}</h6>
            </div>
          </div>
        ))}
      </div>
      </div>
  </div>

  <div>
  {!finished && (
        <div>
          <div className="text-base font-semibold mb-2  flex items-center gap-2"><Package size={20}/> Списък с продукти на щанда</div>
          <div className="grid gap-2 mb-6 sm:grid-cols-2">
            {allProducts.filter(p => p.quantity > 0).map(p => (
              <div key={p.barcode} className={`rounded-sm border p-2 flex flex-col justify-between border-gray-200`}>
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
        </div>
      )}
  </div>

</div>
</div>
    </div>
  );
} 