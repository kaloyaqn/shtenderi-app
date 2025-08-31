'use client'

import { useState, useEffect, useRef } from "react"
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
import QRCode from 'react-qr-code'
import { useReactToPrint } from "react-to-print"
import { PrinterIcon } from "lucide-react"
import { toast } from "sonner"

export default function CreateStandPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [stores, setStores] = useState([])
  const [selectedStore, setSelectedStore] = useState("")
  const [createdStand, setCreatedStand] = useState(null)


  const contentRef = useRef();
  const handlePrint = useReactToPrint({
      content: () => contentRef.current,
  });
  
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function fetchStores() {
      try {
        const response = await fetch('/api/stores')
        if (!response.ok) {
          throw new Error('Failed to fetch stores')
        }
        const data = await response.json()
        setStores(data)
      } catch (err) {
        toast.error(err.message)
      }
    }
    fetchStores()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedStore) {
      toast.error("Моля, изберете магазин")
      return
    }
    setLoading(true)

    const formData = new FormData(e.target)
    const data = {
      name: formData.get('name')?.trim(),
      storeId: selectedStore,
      email: email.trim(),
    }

    try {
      const response = await fetch('/api/stands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Грешка при създаване на щанд')
      }
      
      toast.success('Щендерът е създаден успешно!');
      // We no longer show the QR code on this page. Redirecting.
      // setCreatedStand(result);
      
      setTimeout(() => {
        router.push('/dashboard/stands');
        router.refresh(); // To ensure the list is updated
      }, 1000); // 1 second delay

    } catch (err) {
      toast.error(err.message)
      setLoading(false);
    } finally {
      // On success, we redirect, so no need to set loading to false.
      // On error, it's set in the catch block.
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
                <div className="grid gap-2">
                  <Label htmlFor="email">Имейл на щанда</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Въведете имейл на щанда (по избор)"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
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