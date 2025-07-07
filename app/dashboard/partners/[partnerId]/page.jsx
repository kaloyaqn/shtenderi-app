'use client'

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Edit,
  Phone,
  User,
  Building,
  MapPin,
  Store as StoreIcon,
  ExternalLink,
  Mail,
  Calendar,
  Activity,
  TrendingUp,
  Package,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import BasicHeader from "@/components/BasicHeader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip } from '@/components/ui/tooltip';

export default function PartnerViewPage({ params }) {
  const router = useRouter()
  const { partnerId } = use(params)
  const [partner, setPartner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stands, setStands] = useState([]);
  const [selectedStandId, setSelectedStandId] = useState('');

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

  useEffect(() => {
    if (!partner?.id) return;
    fetch('/api/stands')
      .then(res => res.json())
      .then(allStands => setStands(allStands.filter(s => s.partnerId === partner.id)));
  }, [partner?.id]);

  if (loading) return <div>Зареждане...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!partner) return null

  return (
    <div className="">
      {/* Header */}
      <BasicHeader
      hasBackButton={true}
      
      title={partner.name} 
      subtitle={'Всички данни за Вашия партньор'}
      >

        <Button variant={'outline'} onClick={() => router.push(`/dashboard/partners/${partner.id}/edit`)}>
          <Edit />
          Редактирай
        </Button>

      </BasicHeader>

      {/* Stand-to-stand transfer UI */}
      {stands.length > 0 && (
        <div className="mb-6 max-w-md">
          <Select onValueChange={setSelectedStandId} value={selectedStandId}>
            <SelectTrigger>
              <SelectValue placeholder="Изберете изходен щанд за трансфер..." />
            </SelectTrigger>
            <SelectContent>
              {stands.map(stand => (
                <SelectItem key={stand.id} value={stand.id}>{stand.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="mt-2"
            disabled={!selectedStandId}
            onClick={() => {
              if (selectedStandId) router.push(`/dashboard/stands/${selectedStandId}/transfer`);
            }}
          >
            Трансфер между щандове
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Partner Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-xl font-bold">
                      {partner.name?.slice(0,2).toUpperCase() || "П"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{partner.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        ID: {partner.id}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        {partner.active !== false ? "Активен" : "Неактивен"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Булстат</p>
                        <p className="text-base font-mono">{partner.bulstat || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Лице за контакт</p>
                        <p className="text-base">{partner.contactPerson || '-'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Телефон</p>
                        <a href={`tel:${partner.phone || ''}`} className="text-base text-blue-600 hover:text-blue-800">
                          {partner.phone || '-'}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Седалище</p>
                        <p className="text-base text-gray-500">{partner.address || 'Не е посочено'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <StoreIcon className="h-5 w-5 mr-2 text-gray-700" />
                  Магазини
                  <Badge variant="outline" className="ml-2 text-xs">
                    {Array.isArray(partner.stores) ? partner.stores.length : 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(partner.stores) && partner.stores.length > 0 ? (
                  partner.stores.map((store) => (
                    <div key={store.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <StoreIcon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <a href={`/dashboard/stores/${store.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm underline decoration-2 underline-offset-2 flex items-center group">
                            {store.name}
                            <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                          <p className="text-xs text-gray-500 mt-1">{store.isMain ? 'Основен магазин' : ''}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        {store.active !== false ? "Активен" : "Неактивен"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">Няма магазини</div>
                )}
              </CardContent>
            </Card>

            {/* Invoices Table */}
            {Array.isArray(partner.invoices) && partner.invoices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Фактури</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 border">№</th>
                          <th className="p-2 border">Дата</th>
                          <th className="p-2 border">Стойност</th>
                          <th className="p-2 border">Разплатена сума</th>
                          <th className="p-2 border">Остатък</th>
                          <th className="p-2 border">Кредит</th>
                          <th className="p-2 border"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {partner.invoices.map(inv => {
                          const paid = Array.isArray(inv.payments) ? inv.payments.reduce((sum, p) => sum + p.amount, 0) : 0;
                          const remaining = inv.totalValue - paid;
                          const overpaid = paid > inv.totalValue;
                          return (
                            <tr key={inv.id}>
                              <td className="p-2 border font-mono">{inv.invoiceNumber}</td>
                              <td className="p-2 border">{new Date(inv.issuedAt).toLocaleDateString('bg-BG')}</td>
                              <td className="p-2 border">{inv.totalValue.toFixed(2)} лв.</td>
                              <td className="p-2 border">{paid.toFixed(2)} лв.</td>
                              <td className="p-2 border">{remaining > 0 ? remaining.toFixed(2) + ' лв.' : '0.00 лв.'}</td>
                              <td className="p-2 border text-center">
                                {overpaid && (
                                  <Tooltip content="Има надплащане/кредит">
                                    <span className="text-green-600 font-bold">+{(paid - inv.totalValue).toFixed(2)} лв.</span>
                                  </Tooltip>
                                )}
                              </td>
                              <td className="p-2 border">
                                <Button size="sm" variant="link" onClick={() => router.push(`/dashboard/invoices/${inv.id}`)}>
                                  Виж
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity (placeholder) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Activity className="h-5 w-5 mr-2 text-gray-700" />
                  Последна активност
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Нова продажба в магазин {partner.stores?.[0]?.name || ''}</p>
                      <p className="text-xs text-gray-500 mt-1">Преди 2 часа</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Продажба
                    </Badge>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Обновена информация за контакт</p>
                      <p className="text-xs text-gray-500 mt-1">Преди 1 седмица</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Обновление
                    </Badge>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-2 w-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Създаден партньор профил</p>
                      <p className="text-xs text-gray-500 mt-1">Преди 2 месеца</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Създаване
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats (placeholder) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Статистики</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Общо продажби</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">24</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Продукти</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">156</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Последна продажба</span>
                  </div>
                  <span className="text-sm text-gray-600">Днес</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Бързи действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Phone className="h-4 w-4 mr-2" />
                  Обади се
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Mail className="h-4 w-4 mr-2" />
                  Изпрати имейл
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Виж продажби
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <StoreIcon className="h-4 w-4 mr-2" />
                  Управление на магазини
                </Button>
              </CardContent>
            </Card>

            {/* Partner Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Статус на партньора</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Статус</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {partner.active !== false ? "Активен" : "Неактивен"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Тип партньор</span>
                    <Badge variant="outline">Стандартен</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Създаден</span>
                    <span className="text-sm text-gray-600">{partner.createdAt ? new Date(partner.createdAt).toLocaleDateString('bg-BG') : '-'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 