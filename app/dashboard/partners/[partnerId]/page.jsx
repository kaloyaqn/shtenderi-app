'use client'

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PartnerViewPage({ params }) {
  const router = useRouter()
  const { partnerId } = use(params)
  const [partner, setPartner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const response = await fetch(`/api/partners/${partnerId}?includeStores=1`)
        if (!response.ok) throw new Error('Failed to fetch partner')
        const data = await response.json()
        setPartner(data)
      } catch (err) {
        setError('Грешка при зареждане на партньор')
      } finally {
        setLoading(false)
      }
    }
    fetchPartner()
  }, [partnerId])

  if (loading) return <div>Зареждане...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!partner) return null

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Детайли за партньор</CardTitle>
            <CardDescription>Вижте информацията за този партньор</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><b>ID:</b> {partner.id}</div>
            <div><b>Име на фирмата:</b> {partner.name}</div>
            <div><b>Булстат:</b> {partner.bulstat || '-'}</div>
            <div><b>Лице за контакт:</b> {partner.contactPerson || '-'}</div>
            <div><b>Телефон:</b> {partner.phone || '-'}</div>
            <div className="mb-2">
              <strong>Седалище:</strong> {partner.address || '-'}
            </div>
            {Array.isArray(partner.stores) && (
              <div>
                <b>Магазини ({partner.stores.length}):</b>
                <ul className="list-disc ml-6 mt-2">
                  {partner.stores.map((store) => (
                    <li key={store.id}>
                      <a
                        href={`/dashboard/stores/${store.id}`}
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        {store.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => router.back()}>Назад</Button>
              <Button onClick={() => router.push(`/dashboard/partners/${partner.id}/edit`)}>Редактирай</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 