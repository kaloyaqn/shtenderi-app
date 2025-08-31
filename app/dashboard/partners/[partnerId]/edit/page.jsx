'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { use } from "react"
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

export default function EditPartnerPage({ params }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [partner, setPartner] = useState(null)
  const [address, setAddress] = useState("")
  const [mol, setMol] = useState("")
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  const partnerId = use(params).partnerId

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const response = await fetch(`/api/partners/${partnerId}`)
        if (!response.ok) throw new Error('Failed to fetch partner')
        const data = await response.json()
        setPartner(data)
        setAddress(data.address || "")
        setMol(data.mol || "")
        setCountry(data.country || "")
        setCity(data.city || "")
      } catch (error) {
        console.error('Error fetching partner:', error)
        setError('Грешка при зареждане на партньор')
      }
    }

    fetchPartner()
  }, [partnerId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.target)
    const data = {
      name: formData.get('name')?.trim(),
      bulstat: formData.get('bulstat')?.trim(),
      contactPerson: formData.get('contactPerson')?.trim(),
      phone: formData.get('phone')?.trim(),
      address: address.trim(),
      country: country.trim(),
      city: city.trim(),
      mol: mol.trim(),
      percentageDiscount: Number(formData.get('percentageDiscount')) || 0,
    }

    try {
      const response = await fetch(`/api/partners/${partnerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Грешка при редактиране на партньор')
      }

      router.push('/dashboard/partners')
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!partner) {
    return <div>Зареждане...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Редактирай партньор</CardTitle>
            <CardDescription>
              Редактирайте информацията за партньора
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="id">ID</Label>
                  <Input
                    id="id"
                    value={partner.id}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Име на фирмата *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={partner.name}
                    placeholder="Въведете име на фирмата"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bulstat">Булстат</Label>
                  <Input
                    id="bulstat"
                    name="bulstat"
                    defaultValue={partner.bulstat}
                    placeholder="Въведете булстат"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contactPerson">Лице за контакт</Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    defaultValue={partner.contactPerson}
                    placeholder="Въведете лице за контакт"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={partner.phone}
                    placeholder="Въведете телефон"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="percentageDiscount">Процентна отстъпка</Label>
                  <Input id="percentageDiscount" name="percentageDiscount" type="number" step="0.01" min="0" max="100" defaultValue={partner.percentageDiscount ?? ''} placeholder="0" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="country">Държава</Label>
                  <Input
                    id="country"
                    name="country"
                    placeholder="Въведете държава (по избор)"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city">Град</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Въведете град (по избор)"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Адрес</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Въведете адрес на партньора (по избор)"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="mol">МОЛ</Label>
                  <Input
                    id="mol"
                    name="mol"
                    placeholder="Въведете МОЛ (Материално отговорно лице)"
                    value={mol}
                    onChange={e => setMol(e.target.value)}
                  />
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