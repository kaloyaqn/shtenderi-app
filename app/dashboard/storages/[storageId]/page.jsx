'use client';

import { useState, useEffect, use, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
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

// These components will be created later if they don't exist
import AddProductToStorageDialog from './_components/add-product-dialog';
import EditStorageQuantityDialog from './_components/edit-quantity-dialog';

export default function StorageDetailPage({ params }) {
  const { storageId } = use(params);
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => {
                setProductToEdit(storageProduct);
                setEditDialogOpen(true);
            }}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => {
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

  if (loading) return <div>Зареждане...</div>;
  if (error) return <div className="text-red-500">Грешка: {error}</div>;
  if (!storage) return <div>Складът не е намерен.</div>;

  return (
    <div className="md:py-10 py-5">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="md:text-3xl text-xl font-bold">{storage.name}</h1>
          <p className="text-muted-foreground">Управление на продуктите в склада</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleImportClick}>
                <Upload className="mr-2 h-4 w-4" />
                Импорт от XML
            </Button>
            <input
                type="file"
                accept=".xml"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            <Button onClick={() => setAddProductDialogOpen(true) }>
            <Plus className="mr-2 h-4 w-4" />
            Добави продукт
            </Button>
        </div>
      </div>
      
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
            <AlertDialogAction onClick={handleDelete}>Премахни</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddProductToStorageDialog
        open={addProductDialogOpen}
        onOpenChange={setAddProductDialogOpen}
        storageId={storageId}
        onProductAdded={fetchData}
      />

      <EditStorageQuantityDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        storageProduct={productToEdit}
        onQuantityUpdated={fetchData}
      />
    </div>
  );
} 