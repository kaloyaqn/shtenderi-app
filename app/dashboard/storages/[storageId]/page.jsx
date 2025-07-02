'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Plus, Pencil, Trash2, Upload, Barcode, ImportIcon, LucideUpload } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { XMLParser } from 'fast-xml-parser';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

// These components will be created later if they don't exist
// import AddProductToStorageDialog from './_components/add-product-dialog';
import EditStorageQuantityDialog from './_components/edit-quantity-dialog';
import ResupplyDialog from '@/app/dashboard/components/resupply-dialog';
import StorageTransferDialog from '@/app/dashboard/components/storage-transfer-dialog';
import LoadingScreen from '@/components/LoadingScreen';
import BasicHeader from '@/components/BasicHeader';
import { IconPackageImport, IconTransfer, IconTruckReturn } from '@tabler/icons-react';

export default function StorageDetailPage({ params }) {
  const { storageId } = use(params);
  const { data: session } = useSession();
  const [storage, setStorage] = useState(null);
  const [productsInStorage, setProductsInStorage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  // Dialog states would go here
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [resupplyDialogOpen, setResupplyDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false);
  const [refundProducts, setRefundProducts] = useState([]); // [{product, quantity}]
  const [barcodeInput, setBarcodeInput] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);

  // Focus input for barcode scanning
  const barcodeInputRef = useRef(null);
  useEffect(() => {
    if (refundDialogOpen) {
      setTimeout(() => barcodeInputRef.current?.focus(), 100);
    }
  }, [refundDialogOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [storageRes, productsRes] = await Promise.all([
        fetch(`/api/storages/${storageId}`),
        fetch(`/api/storages/${storageId}/products`),
      ]);

      if (!storageRes.ok) throw new Error('Failed to fetch storage details');
      if (!productsRes.ok) throw new Error('Failed to fetch products in storage');

      const storageData = await storageRes.json();
      const productsData = await productsRes.json();
      
      setStorage(storageData);
      setProductsInStorage(productsData);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storageId) {
      fetchData();
    }
  }, [storageId]);

  const handleDelete = async () => {
    if (!productToDelete) return;

    await toast.promise(async () => {
        const response = await fetch(`/api/storages/${storageId}/products/${productToDelete.id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to remove product from storage');
        }
        fetchData();
    }, {
        loading: 'Removing product...',
        success: 'Product removed successfully!',
        error: (err) => err.message,
    });

    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading('Обработка на XML файла...');

    try {
        const text = await file.text();
        const parser = new XMLParser();
        const xml = parser.parse(text);
        const goods = xml.info?.goods?.good || [];
        const products = (Array.isArray(goods) ? goods : [goods]).map(good => ({
            barcode: String(good.barcode),
            quantity: Number(good.quantity),
            name: good.name,
            clientPrice: parseFloat(good.price) || 0
        })).filter(p => p.barcode && !isNaN(p.quantity));

        if (products.length === 0) {
            throw new Error("XML файлът не съдържа продукти или е в грешен формат.");
        }

        const response = await fetch(`/api/storages/${storageId}/import-xml`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Import failed');
        }

        toast.success('Продуктите са импортирани успешно!', { id: toastId });
        await fetchData();

    } catch (err) {
        toast.error(err.message || 'Възникна грешка при импортиране', { id: toastId });
    } finally {
        e.target.value = '';
    }
  };
  
  const columns = [
    {
      accessorKey: 'product.name',
      header: 'Продукт',
    },
    {
      accessorKey: 'product.barcode',
      header: 'Баркод',
    },
    {
      accessorKey: 'quantity',
      header: 'Количество в склада',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const storageProduct = row.original;
        return (
          <div className="flex items-center gap-2 md:flex-row flex-col md:justify-start justify-center w-full">
            <Button variant="table" onClick={() => {
                setProductToEdit(storageProduct);
                setEditDialogOpen(true);
            }}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="table" onClick={() => {
              setProductToDelete(storageProduct);
              setDeleteDialogOpen(true);
            }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Add product by barcode
  const handleBarcodeEnter = (e) => {
    if (e.key === 'Enter' && barcodeInput) {
      const found = productsInStorage.find(p => p.product.barcode === barcodeInput);
      if (found) {
        setRefundProducts((prev) => {
          const existing = prev.find(rp => rp.product.id === found.product.id);
          if (existing) {
            return prev.map(rp => rp.product.id === found.product.id ? { ...rp, quantity: Math.min(rp.quantity + 1, found.quantity) } : rp);
          }
          return [...prev, { product: found.product, quantity: 1, max: found.quantity }];
        });
      } else {
        toast.error('Продуктът не е намерен в склада');
      }
      setBarcodeInput("");
    }
  };

  // Update quantity
  const setRefundQuantity = (productId, quantity) => {
    setRefundProducts((prev) => prev.map(rp => rp.product.id === productId ? { ...rp, quantity } : rp));
  };

  // Remove product
  const removeRefundProduct = (productId) => {
    setRefundProducts((prev) => prev.filter(rp => rp.product.id !== productId));
  };

  // Confirm refund
  const handleRefund = async () => {
    if (refundProducts.length === 0) return;
    setRefundLoading(true);
    try {
      const res = await fetch('/api/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: 'STORAGE',
          sourceId: storageId,
          products: refundProducts.map(rp => ({ productId: rp.product.id, quantity: rp.quantity })),
        }),
      });
      if (!res.ok) throw new Error('Грешка при връщане');
      toast.success('Връщането е създадено!');
      setRefundDialogOpen(false);
      setRefundProducts([]);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRefundLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return <div>Error: {error}</div>;
  if (!storage) return <div>Складът не е намерен.</div>;

  return (
    <div className="">
      <BasicHeader subtitle={"Упраялавай стоката в склада"} title={storage ? `Склад: ${storage.name}` : "Зареждане..."}>
      <Button
      onClick={handleImportClick}
      variant={'outline'}>
            <ImportIcon />  Импорт
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xml" />

      <Button
      onClick={() => setTransferDialogOpen(true)}
      variant={'outline'}>
              <IconTransfer />
              Преместване
            </Button>
            <Button
            onClick={() => setRefundDialogOpen(true)}
            variant={'outline'}>
              <IconTruckReturn />
              Връщане
            </Button>
            <div className='w-px hidden md:block h-6 bg-gray-300'></div>
            <Button
            onClick={() => setResupplyDialogOpen(true)}
            >
              <IconPackageImport />
              Зареди щендер
            </Button>
      </BasicHeader>
      
      <DataTable
        columns={columns}
        data={productsInStorage}
        searchKey="product.barcode"
        filterableColumns={[]}
        loading={loading}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Премахване на продукт</AlertDialogTitle>
            <AlertDialogDescription>
              Сигурни ли сте, че искате да премахнете този продукт от склада? Това действие не може да бъде отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отказ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Изтрий</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ResupplyDialog
        open={resupplyDialogOpen}
        onOpenChange={setResupplyDialogOpen}
        storageId={storageId}
        onResupplySuccess={fetchData}
      />

      <StorageTransferDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        sourceStorageId={storageId}
        onTransferSuccess={fetchData}
      />

      <Dialog open={decisionDialogOpen} onOpenChange={setDecisionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Какво желаете да направите?</DialogTitle>
          </DialogHeader>
          <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-20" onClick={() => { setDecisionDialogOpen(false); setResupplyDialogOpen(true); }}>
              Прехвърляне към Щанд
            </Button>
            <Button variant="outline" className="h-20" onClick={() => { setDecisionDialogOpen(false); setTransferDialogOpen(true); }}>
              Прехвърляне към Склад
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <EditStorageQuantityDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        storageProduct={productToEdit}
        onQuantityUpdated={fetchData}
      />

      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Върни продукти от склада</DialogTitle>
          </DialogHeader>
          <div className="mb-2">
            <Input
              ref={barcodeInputRef}
              placeholder="Сканирай или въведи баркод..."
              value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)}
              onKeyDown={handleBarcodeEnter}
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {refundProducts.length === 0 && <div className="text-gray-500">Няма избрани продукти.</div>}
            {refundProducts.map(rp => (
              <div key={rp.product.id} className="flex items-center gap-2 mb-2">
                <div className="flex-1">{rp.product.name} <span className="text-xs text-gray-500">({rp.product.barcode})</span></div>
                <Input
                  type="number"
                  min={1}
                  max={rp.max}
                  value={rp.quantity}
                  onChange={e => setRefundQuantity(rp.product.id, Math.max(1, Math.min(rp.max, Number(e.target.value))))}
                  className="w-20"
                />
                <span className="text-xs text-gray-400">/ {rp.max}</span>
                <Button variant="ghost" size="icon" onClick={() => removeRefundProduct(rp.product.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>Отказ</Button>
            <Button onClick={handleRefund} disabled={refundProducts.length === 0 || refundLoading}>
              {refundLoading ? 'Връщане...' : 'Върни избраните продукти'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 