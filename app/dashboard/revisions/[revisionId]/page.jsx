"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Edit2, Edit3, EditIcon, Printer, Repeat, Send, Truck } from 'lucide-react';
import { IconInvoice } from '@tabler/icons-react';
import LoadingScreen from '@/components/LoadingScreen';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import BasicHeader from '@/components/BasicHeader';

export default function RevisionDetailPage() {
  const params = useParams();
  const { revisionId } = params;
  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resupplyDialogOpen, setResupplyDialogOpen] = useState(false);
  const [storages, setStorages] = useState([]);
  const [selectedStorage, setSelectedStorage] = useState('');
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [storageProducts, setStorageProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedAddProduct, setSelectedAddProduct] = useState(null);
  const [addProductQuantity, setAddProductQuantity] = useState(1);
  const [addProductLoading, setAddProductLoading] = useState(false);
  const [resupplyErrors, setResupplyErrors] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const router = useRouter();
  const { data: session } = useSession();
  const [repeatDialogOpen, setRepeatDialogOpen] = useState(false);
  const [stands, setStands] = useState([]);
  const [selectedRepeatStand, setSelectedRepeatStand] = useState('');
  const [repeatLoading, setRepeatLoading] = useState(false);

  const contentRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const fetchRevisionData = async () => {
    setLoading(true);
    try {
        const res = await fetch(`/api/revisions/${revisionId}`);
        if (!res.ok) throw new Error('Failed to fetch revision');
        const data = await res.json();
        setRevision(data);
    } catch (error) {
        console.error('Failed to fetch revision:', error);
        toast.error('Failed to load revision data.');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (revisionId) {
        fetchRevisionData();
    }
  }, [revisionId]);
  
  useEffect(() => {
      // Fetch storages when the resupply dialog is considered
      if(resupplyDialogOpen) {
          fetch('/api/storages')
            .then(res => res.json())
            .then(setStorages)
            .catch(() => toast.error('Failed to load storages'));
      }
  }, [resupplyDialogOpen]);

  useEffect(() => {
    if (addProductDialogOpen && selectedStorage && revision?.stand?.id) {
      fetch(`/api/storages/${selectedStorage}/products-not-on-stand/${revision.stand.id}`)
        .then(res => res.json())
        .then(setStorageProducts)
        .catch(() => setStorageProducts([]));
    }
  }, [addProductDialogOpen, selectedStorage, revision?.stand?.id]);

  // Fetch invoice for this revision
  useEffect(() => {
    if (revision && revision.number) {
      fetch(`/api/invoices?revisionNumber=${revision.number}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) setInvoice(data);
          else setInvoice(null);
        })
        .catch(() => setInvoice(null));
    }
  }, [revision?.number]);

  // Fetch stands for repeat dialog
  useEffect(() => {
    if (repeatDialogOpen) {
      fetch('/api/stands')
        .then(res => res.json())
        .then(setStands)
        .catch(() => toast.error('Грешка при зареждане на щандове.'));
    }
  }, [repeatDialogOpen]);

  const handleResupply = async () => {
    if (!selectedStorage) {
        toast.error('Моля, изберете склад.');
        return;
    }
    setResupplyErrors([]);
    try {
        const response = await fetch(`/api/revisions/${revisionId}/resupply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storageId: selectedStorage }),
        });
        if (response.status === 409) {
            const data = await response.json();
            setResupplyErrors(data.insufficient || []);
            return;
        }
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to resupply from storage');
        }
        toast.success('Щандът е зареден успешно!');
        setResupplyDialogOpen(false);
        setResupplyErrors([]);
        fetchRevisionData();
    } catch (err) {
        toast.error(err.message);
    }
  }

  const handleAddProduct = async () => {
    if (!selectedAddProduct || !addProductQuantity) return;
    setAddProductLoading(true);
    try {
      const res = await fetch(`/api/revisions/${revisionId}/add-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedAddProduct.id,
          standId: revision.stand.id,
          quantity: Number(addProductQuantity),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Продуктът е добавен към щанда и ревизията!');
      setAddProductDialogOpen(false);
      setSelectedAddProduct(null);
      setAddProductQuantity(1);
      fetchRevisionData();
    } catch (e) {
      toast.error(e.message || 'Грешка при добавяне на продукт');
    } finally {
      setAddProductLoading(false);
    }
  };

  // Helper to get the print table HTML
  const getPrintTableHtml = () => {
    const el = contentRef.current;
    return el ? el.outerHTML : '';
  };

  const handlePrintStock = async () => {
    const email = revision.stand?.email;
    if (email) {
      try {
        const html = getPrintTableHtml();
        await fetch('/api/send-stock-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, html, saleNumber: revision.number }),
        });
      } catch (err) {
        // Optionally show a toast or ignore
      }
    }
    reactToPrintFn();
  };

  const handleSendToClient = async () => {
    const email = revision.stand?.email;
    if (!email) {
      toast.error('Щандът няма имейл.');
      return;
    }
    try {
      const html = getPrintTableHtml();
      const res = await fetch('/api/send-stock-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, html, saleNumber: revision.number }),
      });
      if (!res.ok) throw new Error('Грешка при изпращане на имейл');
      toast.success('Стоковата разписка е изпратена на клиента!');
    } catch (err) {
      toast.error(err.message || 'Грешка при изпращане на имейл');
    }
  };

  const handleCreateAndGoToInvoices = async () => {
    if (!paymentMethod) {
      toast.error('Моля, изберете начин на плащане.');
      return;
    }
    setInvoiceLoading(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revisionId, paymentMethod }),
      });
      if (res.ok) {
        setIsPaymentModalOpen(false);
        router.push('/dashboard/invoices');
      } else {
        toast.error('Грешка при създаване на фактура.');
      }
    } catch (e) {
      toast.error('Грешка при създаване на фактура.');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleRepeatSale = async () => {
    if (!selectedRepeatStand || !session?.user?.id) {
      toast.error('Моля, изберете щанд.');
      return;
    }
    setRepeatLoading(true);
    try {
      const res = await fetch(`/api/revisions/${revisionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ standId: selectedRepeatStand, userId: session.user.id }),
      });
      if (!res.ok) throw new Error('Грешка при създаване на нова продажба.');
      const data = await res.json();
      toast.success('Продажбата е повторена успешно!');
      setRepeatDialogOpen(false);
      router.push(`/dashboard/revisions/${data.id}`);
    } catch (err) {
      toast.error(err.message || 'Грешка при повторение на продажбата.');
    } finally {
      setRepeatLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!revision) return <div>Ревизията не е намерена.</div>;

  const columns = [
    {
      accessorKey: 'name',
      header: 'Име',
      cell: ({ row }) => row.original.product?.name || '-',
    },
    {
      accessorKey: 'barcode',
      header: 'Баркод',
      cell: ({ row }) => row.original.product?.barcode || '-',
    },
    {
      accessorKey: 'missingQuantity',
      header: 'Брой',
      cell: ({ row }) => row.original.missingQuantity,
    },
  ];

  // Flatten data for DataTable
  const data = revision.missingProducts.map(mp => ({
    ...mp,
    name: mp.product?.name || '-',
    barcode: mp.product?.barcode || '-',
  }));

  const hasMissingProducts = revision.missingProducts && revision.missingProducts.length > 0;

  // Calculate totals for print table
  const totalQuantity = revision.missingProducts.reduce((sum, mp) => sum + mp.missingQuantity, 0);
  const totalValue = revision.missingProducts.reduce((sum, mp) => sum + (mp.missingQuantity * (mp.product?.clientPrice || 0)), 0);
  const adminName = revision.user?.name || revision.user?.email || '';

  return (
    <div className="container mx-auto">
      {/* <div className="flex justify-between items-center mb-8">
      <div className='flex items-center gap-2'>
      <Button variant="ghost" size='sm' className='text-xs' onClick={() => router.push('/dashboard/revisions')}> {"<-"} Назад</Button>
      <h1 className={`text-2xl text-gray-900 font-bold`}>Продажба #{revision.number}</h1>
      </div>

      </div> */}

      <BasicHeader
      hasBackButton
      title={`Продажба #${revision.number}`}
      subtitle="Всички данни за твоята продажба"
      >

          <Button variant={'outline'} onClick={handlePrintStock}><Printer/> Принтирай</Button>
          <Button onClick={handleSendToClient} variant="outline"> <Send /> Изпрати</Button>
          {invoice ? (
            <Button variant="outline" onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}>
              Виж фактура
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(true)} disabled={invoiceLoading}>
              <IconInvoice />
              {invoiceLoading ? 'Обработка...' : 'Фактура'}
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push(`/dashboard/revisions/${revisionId}/edit`)}><EditIcon /> Редактирай</Button>
          {/* <Button variant="outline" onClick={() => setRepeatDialogOpen(true)}>
          <Repeat />  Повтори продажба
          </Button> */}
          <div className="h-6 w-px bg-gray-300"></div>

          <Button variant="default" onClick={() => setResupplyDialogOpen(true)}>
  <Truck />  Зареди от склад
  </Button>


      </BasicHeader>



      <div className="">
        <div className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-2">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base lg:text-lg">Информация за поръчката</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Номер</label>
                    <p className="text-lg font-semibold">#{revision.number}</p>
                  </div>
                  {/* <div>
                    <label className="text-sm font-medium text-gray-500">Статус</label>
                    <Badge variant="secondary" className="mt-1">
                      Активна
                    </Badge>
                  </div> */}
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-gray-500">Партньор</label>
                  <p className="text-base font-medium">{revision.partner?.name}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Щанд</label>
                    <p className="text-base">{revision.stand?.name || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Магазин</label>
                    <p className="text-base">{revision.store?.name || "N/A"} </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Тип</label>
                    <p className="text-base">{revision.type || "N/A"} </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Ревизор</label>
                  <p className="text-base">{revision.user?.name || revision.user?.email || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div ref={contentRef} className="lg:col-span-2 order-1 lg:order-2">
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle className="text-base lg:text-lg">
                      Продадени продукти
                    </CardTitle>
                    <Badge variant='outline'>
                      2 продукта
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                {revision.missingProducts?.length > 0 ? (
              <DataTable columns={columns} data={data} searchKey="barcode" />
            ) : (
              <p>Няма регистрирани продажби.</p>
            )}
                </CardContent>
              </Card>
          </div>    
        </div>
        </div>
      </div>

      <Dialog open={resupplyDialogOpen} onOpenChange={(open) => { setResupplyDialogOpen(open); if (!open) setResupplyErrors([]); }}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Зареждане на щанд от склад</DialogTitle>
                <DialogDescription>
                    Изберете от кой склад да заредите продадените количества.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Select onValueChange={setSelectedStorage} value={selectedStorage}>
                    <SelectTrigger>
                        <SelectValue placeholder="Избери склад..." />
                    </SelectTrigger>
                    <SelectContent>
                        {storages.map(storage => (
                            <SelectItem key={storage.id} value={storage.id}>
                                {storage.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {resupplyErrors.length > 0 && (
              <div className="bg-red-100 border border-red-400 text-red-800 rounded p-4 mb-4">
                <div className="font-semibold mb-2">Недостатъчна наличност за следните продукти:</div>
                <ul className="list-disc pl-5">
                  {resupplyErrors.map((err, idx) => (
                    <li key={idx}>
                      {err.name} ({err.barcode}) — Изискват се: {err.required}, налични: {err.available}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <DialogFooter>
                <Button variant="outline" onClick={() => setResupplyDialogOpen(false)}>Отказ</Button>
                <Button onClick={handleResupply}>Зареди</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={addProductDialogOpen} onOpenChange={setAddProductDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Добави нов продукт към продажбата</DialogTitle>
            <DialogDescription>
              Изберете продукт от склада, който не е на щанда, и въведете количество.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Command>
              <CommandInput
                placeholder="Търси по име или баркод..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                <CommandEmpty>Няма намерени продукти.</CommandEmpty>
                {storageProducts
                  .filter(p =>
                    p.name.toLowerCase().includes(search.toLowerCase()) ||
                    (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()))
                  )
                  .slice(0, 10)
                  .map(product => (
                    <CommandItem
                      key={product.id}
                      value={product.name + ' ' + product.barcode}
                      onSelect={() => {
                        setSelectedAddProduct(product);
                        setSearch(product.name + ' (' + product.barcode + ')');
                      }}
                    >
                      {product.name} <span className="text-xs text-muted-foreground">({product.barcode})</span>
                    </CommandItem>
                  ))}
              </CommandList>
            </Command>
            {selectedAddProduct && (
              <div>
                <label htmlFor="addProductQuantity" className="block text-sm font-medium mb-1">Количество</label>
                <input
                  id="addProductQuantity"
                  type="number"
                  min={1}
                  value={addProductQuantity}
                  onChange={e => setAddProductQuantity(e.target.value)}
                  className="border rounded px-2 py-1 w-24"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddProductDialogOpen(false)} disabled={addProductLoading}>Отказ</Button>
            <Button onClick={handleAddProduct} disabled={!selectedAddProduct || addProductLoading}>
              {addProductLoading ? 'Добавяне...' : 'Добави'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Payment Method Dialog */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Избор на начин на плащане</DialogTitle>
                <DialogDescription>
                    Моля, изберете как е платена тази фактура.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Select onValueChange={setPaymentMethod} defaultValue={paymentMethod}>
                    <SelectTrigger>
                        <SelectValue placeholder="Избери начин на плащане..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="CASH">В брой</SelectItem>
                        <SelectItem value="CARD">Банка</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Отказ</Button>
                <Button onClick={handleCreateAndGoToInvoices} disabled={invoiceLoading}>
                  {invoiceLoading ? 'Създаване...' : 'Създай фактура'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Print-only stock receipt table */}
      <div ref={contentRef} className="hidden print:block bg-white p-8 text-black">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-bold">Стокова № {revision.number}</div>
          <div className="text-md">Дата: {new Date(revision.createdAt).toLocaleDateString('bg-BG')}</div>
        </div>
          <div className='flex items-center justify-between'>
          <div className="mb-2">
          <div className="font-semibold">Доставчик:</div>
          <div>Фирма: Омакс Сълюшънс ЕООД</div>
          <div>ЕИК/ДДС номер: BG200799887</div>
          <div>Седалище: гр. Хасково, ул. Рай №7</div>
        </div>
        <div className="mb-2 text-right">
          <div className="font-semibold">Получател:</div>
          <div>Фирма: {revision.partner?.name || '-'}</div>
          <div>ЕИК/ДДС номер: {revision.partner?.bulstat || '-'}</div>
          <div>Седалище: {revision.partner?.address || '-'}</div>
        </div>
          </div>
        <div className="mb-4">
          <div className="font-semibold">Описание:</div>
        </div>
        <table className="w-full border border-black mb-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black px-2 py-1">Име на продукта</th>
              <th className="border border-black px-2 py-1">EAN код</th>
              <th className="border border-black px-2 py-1">Количество</th>
              <th className="border border-black px-2 py-1">Единична цена без ДДС</th>
              <th className="border border-black px-2 py-1">ПЦД</th>
            </tr>
          </thead>
          <tbody>
            {revision.missingProducts.map(mp => (
              <tr key={mp.id}>
                <td className="border border-black px-2 py-1">{mp.product?.name || '-'}</td>
                <td className="border border-black px-2 py-1">{mp.product?.barcode || '-'}</td>
                <td className="border border-black px-2 py-1 text-center">{mp.missingQuantity}</td>
                <td className="border border-black px-2 py-1 text-right">{mp.product?.clientPrice?.toFixed(2) || '-'}</td>
                <td className="border border-black px-2 py-1 text-right">{mp.product?.pcd || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mb-2">Общ брой продукти: <b>{totalQuantity}</b></div>
        <div className="mb-2">Стойност с ДДС: <b>{totalValue.toFixed(2)} лв.</b></div>
        <div className="mt-6">Изготвил: <b>{adminName}</b></div>
      </div>
      {/* Repeat Sale Dialog */}
      <Dialog open={repeatDialogOpen} onOpenChange={setRepeatDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Повтори продажба</DialogTitle>
            <DialogDescription>
              Изберете щанд, от който да повторите продажбата. Ще се създаде нова продажба с нов номер.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select onValueChange={setSelectedRepeatStand} value={selectedRepeatStand}>
              <SelectTrigger>
                <SelectValue placeholder="Избери щанд..." />
              </SelectTrigger>
              <SelectContent>
                {stands.map(stand => (
                  <SelectItem key={stand.id} value={stand.id}>
                    {stand.name} {stand.store?.name ? `(${stand.store.name})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRepeatDialogOpen(false)} disabled={repeatLoading}>Отказ</Button>
            <Button onClick={handleRepeatSale} disabled={!selectedRepeatStand || repeatLoading}>
              {repeatLoading ? 'Създаване...' : 'Повтори'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 