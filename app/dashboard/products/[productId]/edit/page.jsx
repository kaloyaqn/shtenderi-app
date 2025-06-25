'use client'

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function EditProductPage({ params }) {
  const router = useRouter()
  const { productId } = use(params)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [product, setProduct] = useState(null)

  useEffect(() => {
    if (!productId) return;
    
    setLoading(true);
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`)
        if (!response.ok) throw new Error('Failed to fetch product')
        const data = await response.json()
        setProduct(data)
      } catch (error) {
        console.error('Error fetching product:', error)
        setError('Грешка при зареждане на продукт')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.target)
    const data = {
        name: formData.get('name')?.trim(),
        barcode: formData.get('barcode')?.trim(),
        clientPrice: parseFloat(formData.get('clientPrice')),
        pcd: formData.get('pcd')?.trim() || null,
        quantity: parseInt(formData.get('quantity'), 10) || 0,
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Грешка при редактиране на продукт')
      }

      router.push('/dashboard/products')
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !product) {
    return <div>Зареждане...</div>
  }
  
  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Редактирай продукт</CardTitle>
            <CardDescription>
              Редактирайте информацията за продукта
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
              <div className="grid gap-2">
                  <Label htmlFor="name">Име *</Label>
                  <Input id="name" name="name" required defaultValue={product.name} placeholder="Въведете име на продукта" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="barcode">Баркод *</Label>
                  <Input id="barcode" name="barcode" required defaultValue={product.barcode} placeholder="Сканирайте или въведете баркод" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="clientPrice">Клиентска цена *</Label>
                  <Input id="clientPrice" name="clientPrice" type="number" step="0.01" required defaultValue={product.clientPrice} placeholder="0.00" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="pcd">Препоръчителна цена (ПЦД)</Label>
                  <Input id="pcd" name="pcd" defaultValue={product.pcd || ''} placeholder="Въведете ПЦД" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="quantity">Количество</Label>
                  <Input id="quantity" name="quantity" type="number" defaultValue={product.quantity || 0} placeholder="0" />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Отказ
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Запазване...' : 'Запази'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 