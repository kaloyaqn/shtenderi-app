"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { PrintableRevision } from './_components/printable-revision';
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
  const router = useRouter();

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

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

  const handleResupply = async () => {
    if (!selectedStorage) {
        toast.error('Моля, изберете склад.');
        return;
    }

    await toast.promise(async () => {
        const response = await fetch(`/api/revisions/${revisionId}/resupply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storageId: selectedStorage }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to resupply from storage');
        }

        // Optionally, you can refresh data here if needed
        // await fetchRevisionData();
    }, {
        loading: 'Зареждане от склад...',
        success: 'Щандът е зареден успешно!',
        error: (err) => err.message,
    });
    
    setResupplyDialogOpen(false);
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

  if (loading) return <div>Зареждане...</div>;
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

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Детайли за ревизия</h1>
        <div className="flex gap-2">
            {hasMissingProducts && (
                <Button onClick={() => setResupplyDialogOpen(true)} variant="outline">
                    Зареди от склад
                </Button>
            )}
            {selectedStorage && (
                <Button onClick={() => setAddProductDialogOpen(true)} variant="outline">
                    Добави нов продукт към ревизията
                </Button>
            )}
            <Button onClick={handlePrint}>Принтирай</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {/* Render the printable component but keep it visually hidden */}
        <div style={{ display: 'none' }}>
            <PrintableRevision ref={componentRef} revision={revision} />
        </div>

        <div className="space-y-4">
            <div><strong>Щанд:</strong> {revision.stand?.name || 'N/A'}</div>
            <div><strong>Магазин:</strong> {revision.stand?.store?.name || 'N/A'}</div>
            <div><strong>Партньор:</strong> {revision.partner?.name || 'N/A'}</div>
            <div><strong>Ревизор:</strong> {revision.user?.name || revision.user?.email || 'N/a'}</div>
            <div><strong>Дата:</strong> {new Date(revision.createdAt).toLocaleString('bg-BG')}</div>
        </div>

        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Липсващи продукти:</h2>
            {revision.missingProducts?.length > 0 ? (
            <ul className="space-y-2">
                {revision.missingProducts.map((mp) => (
                <li key={mp.id} className="p-3 bg-red-50 rounded-md">
                    <div className="font-semibold">{mp.product?.name} ({mp.product?.barcode})</div>
                    <div className="text-sm text-red-700">Липсващи: {mp.missingQuantity}</div>
                </li>
                ))}
            </ul>
            ) : (
            <p>Няма регистрирани липси.</p>
            )}
        </div>

      </div>

      <div className="flex gap-2 mt-6">
        <Button variant="outline" onClick={() => router.push(`/dashboard/revisions/${revisionId}/edit`)}>Редактирай</Button>
        <Button variant="ghost" onClick={() => router.push('/dashboard/revisions')}>Назад</Button>
      </div>

      {/* Resupply Dialog */}
      <Dialog open={resupplyDialogOpen} onOpenChange={setResupplyDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Зареждане на щанд от склад</DialogTitle>
                <DialogDescription>
                    Изберете от кой склад да заредите липсващите количества.
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
            <DialogTitle>Добави нов продукт към ревизията</DialogTitle>
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
    </div>
  );
} 