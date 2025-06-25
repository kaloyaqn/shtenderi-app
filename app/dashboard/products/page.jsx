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

export default function ProductsPage() {
  const router = useRouter()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [importError, setImportError] = useState(null)
  const fileInputRef = useRef()

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
        clientPrice: parseFloat(good.price)
      }));
      // Send to API
      await toast.promise(
        (async () => {
          const response = await fetch('/api/products/import-xml', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products: mapped })
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
    } catch (err) {
      setImportError(err.message);
    } finally {
      e.target.value = '';
    }
  }

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
      cell: ({ row }) => `${row.original.clientPrice.toFixed(2)} лв.`,
    },
    {
        accessorKey: "pcd",
        header: "ПЦД",
    },
    {
      accessorKey: "totalQuantity",
      header: "Общо количество",
      cell: ({ row }) => {
        const product = row.original;
        const assignedQuantity = product.standProducts.reduce((sum, sp) => sum + sp.quantity, 0);
        const unassignedQuantity = product.quantity - assignedQuantity;
        const totalQuantity = unassignedQuantity + assignedQuantity;
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="cursor-help underline decoration-dotted">{totalQuantity}</span>
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
        )
      }
    },
    {
      accessorKey: "quantity",
      header: "Количество БУС",
      cell: ({ row }) => {
        const product = row.original;
        const assignedQuantity = product.standProducts.reduce((sum, sp) => sum + sp.quantity, 0);
        const unassignedQuantity = product.quantity - assignedQuantity;
        return unassignedQuantity;
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original
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
        )
      },
    },
  ]

  if (loading) {
    return <div>Зареждане...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2"> <Bus size={32}/> БУС</h1>
        <div className="flex gap-2">
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
    </div>
  )
} 