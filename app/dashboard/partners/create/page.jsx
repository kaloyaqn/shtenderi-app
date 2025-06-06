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

export default function CreatePartnerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.target)
    const data = {
      id: formData.get('id')?.trim(),
      name: formData.get('name')?.trim(),
      bulstat: formData.get('bulstat')?.trim(),
      contactPerson: formData.get('contactPerson')?.trim(),
      phone: formData.get('phone')?.trim(),
    }

    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Грешка при създаване на партньор')
      }

      router.push('/dashboard/partners')
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
            <CardTitle>Добави партньор</CardTitle>
            <CardDescription>
              Въведете информация за новия партньор
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="id">ID *</Label>
                  <Input
                    id="id"
                    name="id"
                    required
                    placeholder="Въведете ID на партньора"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Име на фирмата *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Въведете име на фирмата"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bulstat">Булстат</Label>
                  <Input
                    id="bulstat"
                    name="bulstat"
                    placeholder="Въведете булстат"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contactPerson">Лице за контакт</Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
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