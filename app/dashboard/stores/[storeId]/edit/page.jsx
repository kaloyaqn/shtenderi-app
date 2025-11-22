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
import { Combobox } from "@/components/ui/combobox"
import { Plus } from "lucide-react"

export default function EditStorePage({ params }) {
  const router = useRouter()
  const { storeId } = use(params)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [store, setStore] = useState(null)
  const [partners, setPartners] = useState([])
  const [partnersLoading, setPartnersLoading] = useState(true)

  const [cities, setCities] = useState([])
  const [cityId, setCityId] = useState("")
  const [citySearch, setCitySearch] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storeRes, partnersRes, citiesRes] = await Promise.all([
          fetch(`/api/stores/${storeId}`),
          fetch("/api/partners"),
          fetch("/api/cities"),
        ])

        if (!storeRes.ok) throw new Error("Failed to fetch store")
        if (!partnersRes.ok) throw new Error("Failed to fetch partners")
        if (!citiesRes.ok) throw new Error("Failed to fetch cities")

        const storeData = await storeRes.json()
        const partnersData = await partnersRes.json()
        const citiesData = await citiesRes.json()

        setStore(storeData)
        setPartners(partnersData)
        setCities(citiesData)

        const detectedCityId =
          storeData.cityId ||
          (storeData.city && storeData.city.id) ||
          ""

        setCityId(detectedCityId)
      } catch (err) {
        setError("Грешка при зареждане на данни")
      } finally {
        setPartnersLoading(false)
      }
    }

    fetchData()
  }, [storeId])

  async function createCity(name) {
    try {
      const res = await fetch("/api/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      if (!res.ok) throw new Error("Грешка при създаване на град")

      const newCity = await res.json()

      setCities(prev => [...prev, newCity])
      setCityId(newCity.id)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.target)

    const data = {
      name: formData.get("name")?.trim(),
      address: formData.get("address")?.trim(),
      contact: formData.get("contact")?.trim(),
      phone: formData.get("phone")?.trim(),
      partnerId: formData.get("partnerId"),
      cityId: cityId || null,
    }

    try {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Грешка при редактиране на магазин")
      }

      router.push("/dashboard/stores")
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!store || partnersLoading) {
    return <div>Зареждане...</div>
  }

  const cityOptions = cities.map(c => ({
    label: c.name,
    value: c.id,
  }))

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">

        <Card>
          <CardHeader>
            <CardTitle>Редактирай магазин</CardTitle>
            <CardDescription>Редактирайте информацията за магазина</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="space-y-4">

                <div className="grid gap-2">
                  <Label>Име *</Label>
                  <Input name="name" required defaultValue={store.name} />
                </div>

                <div className="grid gap-2">
                  <Label>Адрес *</Label>
                  <Input name="address" required defaultValue={store.address} />
                </div>

                {/* CITY COMBOBOX */}
                <div className="grid gap-2">
                  <Label>Град *</Label>
                  <Combobox
                    value={cityId}
                    onValueChange={setCityId}
                    onSearchChange={setCitySearch}
                    options={cityOptions}
                    placeholder="Изберете град"
                    emptyContent={(text) => (
                      <Button
                        variant={'outlined'}
                        type="button"
                        className="w-full mx-4"
                        onClick={() => createCity(text)}
                      >
                        <Plus />  Създай град "{text}"
                      </Button>
                    )}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Лице за контакт</Label>
                  <Input name="contact" defaultValue={store.contact} />
                </div>

                <div className="grid gap-2">
                  <Label>Телефон</Label>
                  <Input name="phone" defaultValue={store.phone} />
                </div>

                <div className="grid gap-2">
                  <Label>Партньор *</Label>
                  <select
                    name="partnerId"
                    required
                    className="border rounded px-3 py-2"
                    defaultValue={store.partnerId}
                  >
                    <option value="">Изберете партньор</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Отказ
                </Button>

                <Button type="submit" disabled={loading}>
                  {loading ? "Запазване..." : "Запази"}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
