'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
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

export default function ProductsPage() {
  const router = useRouter()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)

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
      cell: ({ row }) => `€${row.original.clientPrice.toFixed(2)}`,
    },
    {
        accessorKey: "pcd",
        header: "ПЦД",
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
        <h1 className="text-3xl font-bold">Продукти</h1>
        <Button onClick={() => router.push('/dashboard/products/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Добави продукт
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        searchKey="name"
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