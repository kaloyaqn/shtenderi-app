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

export default function CreateStorePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [partners, setPartners] = useState([])
  const [partnersLoading, setPartnersLoading] = useState(true)

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch('/api/partners')
        if (!response.ok) throw new Error('Failed to fetch partners')
        const data = await response.json()
        setPartners(data)
      } catch (error) {
        setError('Грешка при зареждане на партньори')
      } finally {
        setPartnersLoading(false)
      }
    }
    fetchPartners()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.target)
    const data = {
      name: formData.get('name')?.trim(),
      address: formData.get('address')?.trim(),
      contact: formData.get('contact')?.trim(),
      phone: formData.get('phone')?.trim(),
      partnerId: formData.get('partnerId'),
    }

    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Грешка при създаване на магазин')
      }
      router.push('/dashboard/stores')
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
            <CardTitle>Добави магазин</CardTitle>
            <CardDescription>
              Въведете информация за новия магазин
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Име на магазин *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Въведете име на магазина"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Адрес *</Label>
                  <Input
                    id="address"
                    name="address"
                    required
                    placeholder="Въведете адрес на магазина"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact">Лице за контакт</Label>
                  <Input
                    id="contact"
                    name="contact"
                    placeholder="Въведете лице за контакт"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Въведете телефон"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="partnerId">Партньор *</Label>
                  <select
                    id="partnerId"
                    name="partnerId"
                    required
                    className="border rounded px-3 py-2"
                    disabled={partnersLoading}
                  >
                    <option value="">Изберете партньор</option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
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
                <Button type="submit" disabled={loading || partnersLoading}>
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