'use client'

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Bus, Upload } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import { XMLParser } from "fast-xml-parser"
import { toast } from 'sonner'

function EditableCell({ value, onSave, type = 'text', min, max }) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    setInputValue(value ?? '');
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleSave = async () => {
    if (inputValue === value) {
      setEditing(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSave(inputValue);
      setEditing(false);
    } catch (err) {
      setError('Грешка при запис');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditing(false);
      setInputValue(value ?? '');
    }
  };

  if (editing) {
    return (
      <div>
        <input
          ref={inputRef}
          type={type}
          min={min}
          max={max}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="border rounded px-2 py-1 w-20 text-sm"
          disabled={loading}
        />
        {error && <div className="text-xs text-red-500">{error}</div>}
      </div>
    );
  }
  return (
    <span className="cursor-pointer underline decoration-dotted" onClick={() => setEditing(true)}>
      {value === null || value === undefined || value === '' ? <span className="text-muted-foreground">—</span> : value}
    </span>
  );
}

export default function ProductsPage() {
  const router = useRouter()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [importError, setImportError] = useState(null)
  const fileInputRef = useRef()
  const [showQuantityPrompt, setShowQuantityPrompt] = useState(false)
  const [pendingProducts, setPendingProducts] = useState(null)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      const products = await response.json()
      setData(products)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete product')
      }

      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
    } finally {
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click();
  }

  const handleFileChange = async (e) => {
    setImportError(null);
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parser = new XMLParser();
      const xml = parser.parse(text);
      // Extract products from xml
      const goods = xml.info?.goods?.good || [];
      const products = Array.isArray(goods) ? goods : [goods];
      // Map to expected fields
      const mapped = products.map(good => ({
        barcode: good.barcode,
        name: good.name,
        clientPrice: parseFloat(good.price),
        quantity: good.quantity !== undefined ? parseInt(good.quantity, 10) : undefined,
      }));
      setPendingProducts(mapped);
      setShowQuantityPrompt(true);
    } catch (err) {
      setImportError(err.message);
    } finally {
      e.target.value = '';
    }
  }

  const handleImportWithQuantities = async (updateQuantities) => {
    setShowQuantityPrompt(false);
    if (!pendingProducts) return;
    // Remove quantity if not updating
    const productsToSend = updateQuantities
      ? pendingProducts
      : pendingProducts.map(p => {
          const { quantity, ...rest } = p;
          return rest;
        });
    await toast.promise(
      (async () => {
        const response = await fetch('/api/products/import-xml', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: productsToSend, updateQuantities })
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Import failed');
        }
        await fetchProducts();
      })(),
      {
        loading: 'Импортиране... Моля, изчакайте',
        success: 'Импортирането е успешно!',
        error: (err) => err.message || 'Възникна грешка при импортиране',
      }
    );
    setPendingProducts(null);
  };

  const handleUpdateProductField = async (id, field, newValue) => {
    const product = data.find(p => p.id === id);
    if (!product) return;
    const patch = { [field]: field === 'quantity' ? parseInt(newValue, 10) : newValue };
    // Always send required fields for updateProduct
    patch.name = product.name;
    patch.barcode = product.barcode;
    patch.clientPrice = product.clientPrice;
    await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    await fetchProducts();
  };

  const getRowClassName = (row) => {
    if (row.original.quantity === 0) {
      return "bg-red-50 dark:bg-red-950";
    }
    return "";
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Име",
    },
    {
      accessorKey: "barcode",
      header: "Баркод",
    },
    {
      accessorKey: "clientPrice",
      header: "Клиентска цена",
      cell: ({ row }) => {
        if (!row || !row.original || typeof row.original.clientPrice !== 'number') return null;
        return `${row.original.clientPrice.toFixed(2)} лв.`;
      },
    },
    {
      accessorKey: "pcd",
      header: "ПЦД",
      cell: ({ row }) => {
        if (!row) return null;
        return (
          <EditableCell
            value={row.original.pcd}
            onSave={val => handleUpdateProductField(row.original.id, 'pcd', val)}
          />
        );
      },
    },
    {
      accessorKey: "quantity",
      header: "Общо количество",
      cell: ({ row }) => {
        if (!row) return null;
        const product = row.original;
        if (!product || !Array.isArray(product.standProducts)) return null;
        const assignedQuantity = product.standProducts.reduce((sum, sp) => sum + sp.quantity, 0);
        const unassignedQuantity = product.quantity - assignedQuantity;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                    <EditableCell
                        value={product.quantity}
                        type="number"
                        min={0}
                        onSave={val => handleUpdateProductField(product.id, 'quantity', val)}
                    />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold mb-2">Разпределение:</p>
                <ul>
                    {product.standProducts.map(sp => (
                        <li key={sp.id}>
                            {sp.stand.name}: {sp.quantity}
                        </li>
                    ))}
                    <li className="mt-1 pt-1 border-t">
                        Неразпределени: {unassignedQuantity}
                    </li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "unassignedQuantity",
      header: "Количество БУС",
      cell: ({ row }) => {
        if (!row) return null;
        const product = row.original;
        if (!product || !Array.isArray(product.standProducts)) return null;
        const assignedQuantity = product.standProducts.reduce((sum, sp) => sum + sp.quantity, 0);
        const unassignedQuantity = product.quantity - assignedQuantity;
        return unassignedQuantity;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        if (!row) return null;
        const product = row.original;
        if (!product) return null;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setProductToDelete(product)
                setDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ]

  if (loading) {
    return <div>Зареждане...</div>
  }

  return (
    <div className=" md:py-10 py-5 w-full">
      <div className="flex justify-between md:flex-row flex-col  md:items-center w-full mb-8">
        <h1 className="md:text-3xl w-full text-xl text-left font-bold flex items-center gap-2 md:mb-0 mb-2"> <Bus size={32}/> СКЛАД {"(БУС)"}</h1>
        <div className="flex justify-end w-full md:flex-row flex-col gap-2">
          <Button onClick={() => router.push('/dashboard/products/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Добави продукт
          </Button>
          <Button variant="outline" onClick={handleImportClick}>
            <Upload className="mr-2 h-4 w-4" />
            Импортирай от XML
          </Button>
          <input
            type="file"
            accept=".xml"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {importError && <div className="text-red-500 mb-4">{importError}</div>}

      <DataTable 
        columns={columns} 
        data={data} 
        searchKey="name"
        filterableColumns={[{ id: 'barcode', title: 'Баркод' }]}
        rowClassName={getRowClassName}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Изтриване на продукт</AlertDialogTitle>
            <AlertDialogDescription>
              Сигурни ли сте, че искате да изтриете продукт {productToDelete?.name}?
              Това действие не може да бъде отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отказ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Изтрий</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showQuantityPrompt} onOpenChange={setShowQuantityPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Обновяване на количества?</AlertDialogTitle>
            <AlertDialogDescription>
              Искате ли да обновите количествата на продуктите при импортиране от XML?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleImportWithQuantities(false)}>Не</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleImportWithQuantities(true)}>Да</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 