'use client'

import { useState } from "react"
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

export default function CreateProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Грешка при създаване на продукт')
      }

      router.push('/dashboard/products')
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Добави продукт</CardTitle>
            <CardDescription>
              Въведете информация за новия продукт
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Име *</Label>
                  <Input id="name" name="name" required placeholder="Въведете име на продукта" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="barcode">Баркод *</Label>
                  <Input id="barcode" name="barcode" required placeholder="Сканирайте или въведете баркод" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="clientPrice">Клиентска цена *</Label>
                  <Input id="clientPrice" name="clientPrice" type="number" step="0.01" required placeholder="0.00" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="pcd">Препоръчителна цена (ПЦД)</Label>
                  <Input id="pcd" name="pcd" placeholder="Въведете ПЦД" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="quantity">Количество</Label>
                  <Input id="quantity" name="quantity" type="number" defaultValue={0} placeholder="0" />
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
                  {loading ? 'Създаване...' : 'Създай'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 