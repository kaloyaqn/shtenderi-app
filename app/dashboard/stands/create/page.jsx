'use client'

import { useState, useEffect } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CreateStandPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stores, setStores] = useState([])
  const [selectedStore, setSelectedStore] = useState("")

  useEffect(() => {
    async function fetchStores() {
      try {
        console.log("Fetching stores...");
        const response = await fetch('/api/stores')
        if (!response.ok) {
          throw new Error('Failed to fetch stores')
        }
        const data = await response.json()
        console.log("Stores fetched:", data);
        setStores(data)
      } catch (err) {
        console.error("Error fetching stores:", err);
        setError(err.message)
      }
    }
    fetchStores()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedStore) {
      setError("Моля, изберете магазин")
      return
    }
    setLoading(true)
    setError(null)

    const formData = new FormData(e.target)
    const data = {
      name: formData.get('name')?.trim(),
      storeId: selectedStore,
    }
    console.log("Submitting with data:", data);

    try {
      const response = await fetch('/api/stands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      console.log("API Response:", result);

      if (!response.ok) {
        throw new Error(result.error || 'Грешка при създаване на щанд')
      }

      router.push('/dashboard/stands')
      router.refresh()
    } catch (err) {
      console.error("Error creating stand:", err);
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
            <CardTitle>Добави щанд</CardTitle>
            <CardDescription>
              Въведете информация за новия щанд
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Име на щанда *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Въведете име на щанда"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="store">Магазин *</Label>
                  <Select onValueChange={setSelectedStore} value={selectedStore}>
                    <SelectTrigger>
                      <SelectValue placeholder="Изберете магазин" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name} ({store.address})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Отказ
                </Button>
                <Button type="submit" disabled={loading || stores.length === 0}>
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