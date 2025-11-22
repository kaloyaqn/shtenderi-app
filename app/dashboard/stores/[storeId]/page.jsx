"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Edit,
  Phone,
  Building,
  MapPin,
  ExternalLink,
  Mail,
  Activity,
  TrendingUp,
  Package,
  Activity as City,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import BasicHeader from "@/components/BasicHeader"
import LoadingScreen from "@/components/LoadingScreen"
import { DataTable } from "@/components/ui/data-table"
import TableLink from "@/components/ui/table-link"
import useSWR from "swr"
import { fetcher } from "@/lib/utils"

export default function StoreViewPage({ params }) {
  const router = useRouter()
  const { storeId } = use(params)

  const { data: store, isLoading, error } = useSWR(`/api/stores/${storeId}`, fetcher)

  const standColumns = [
    {
      accessorKey: "name",
      header: "Име на щендер",
      cell: ({ row }) => {
        const stand = row.original
        return (
          <span className="flex items-center gap-2">
            <TableLink href={`/dashboard/stands/${stand.id}`}>{stand.name}</TableLink>
            {stand.region && (
              <Badge variant="outline" className="text-xs">
                {stand?.region?.name}
              </Badge>
            )}
          </span>
        )
      },
    },
    {
      accessorKey: "_count.standProducts",
      header: "Брой продукти",
    },
  ]

  if (isLoading) return <LoadingScreen />
  if (error) return <div className="text-red-500">Грешка: {error}</div>
  if (!store) return <div>Магазинът не е намерен.</div>

  return (
    <div className="">
      {/* Header */}
      <BasicHeader
        hasBackButton={true}
        title={store.name}
        subtitle={`${store.city?.name || ""}, ${store.address || ""}`}
      >
        <Button variant="outline" onClick={() => router.push(`/dashboard/stores/${store.id}/edit`)}>
          <Edit className="h-4 w-4" />
          Редактирай
        </Button>
      </BasicHeader>

      {/* Main Content */}
      <div className="">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Store Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-xl font-bold">
                      {store.name?.slice(0, 2).toUpperCase() || "М"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{store.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        ID: {store.id}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        {store.active !== false ? "Активен" : "Неактивен"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Адрес</p>
                        <p className="text-base">{store.address || "-"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <City className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Град</p>
                        <p className="text-base">{store.city?.name || "-"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Телефон</p>
                        <a href={`tel:${store.phone || ""}`} className="text-base text-blue-600 hover:text-blue-800">
                          {store.phone || "-"}
                        </a>
                      </div>
                    </div>
                    {store.contact && (
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Лице за контакт</p>
                          <p className="text-base">{store.contact}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partner Information */}
            {store.partner && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Building className="h-5 w-5 mr-2 text-gray-700" />
                    Партньор
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Building className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <a
                            href={`/dashboard/partners/${store.partner.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm underline decoration-2 underline-offset-2 flex items-center group"
                          >
                            {store.partner.name}
                            <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                          <p className="text-xs text-gray-500 mt-1">
                            {store.partner.bulstat && `Булстат: ${store.partner.bulstat}`}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        Партньор
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Revenue Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="h-5 w-5 mr-2 text-gray-700" />
                  Обороти
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Общо оборот за магазин</p>
                  <h3 className="text-3xl font-bold text-gray-900">{store.revenue ? `${store.revenue} лв.` : "-"}</h3>
                </div>
              </CardContent>
            </Card>

            {/* Stands/Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Package className="h-5 w-5 mr-2 text-gray-700" />
                  Щендери
                  <Badge variant="outline" className="ml-2 text-xs">
                    {store.stands?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {store.stands && store.stands.length > 0 ? (
                  <DataTable columns={standColumns} data={store.stands} searchKey="name" />
                ) : (
                  <div className="text-gray-500 text-sm">Няма щендери</div>
                )}
              </CardContent>
            </Card>

            {/* Activity */}
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
                      <p className="text-sm font-medium text-gray-900">Нова продажба</p>
                      <p className="text-xs text-gray-500 mt-1">Преди 2 часа</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Продажба
                    </Badge>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Обновена информация за магазин</p>
                      <p className="text-xs text-gray-500 mt-1">Преди 1 седмица</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Обновление
                    </Badge>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="h-2 w-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Създаден магазин</p>
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
            {/* Store Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Статистика на магазин</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Щендери</span>
                    <span className="text-lg font-semibold">{store.stands?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Общо продукти</span>
                    <span className="text-lg font-semibold">
                      {store.stands
                        ?.reduce((sum, stand) => sum + (stand._count?.standProducts || 0), 0)
                        .toLocaleString("bg-BG") || 0}
                    </span>
                  </div>
                  <div className="h-px bg-gray-200"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Статус</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {store.active !== false ? "Активен" : "Неактивен"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
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
                  <Package className="h-4 w-4 mr-2" />
                  Управление на щендери
                </Button>
              </CardContent>
            </Card>

            {/* Store Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Детайли на магазин</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {store.city && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Град</span>
                      <span className="text-sm font-medium">{store.city.name}</span>
                    </div>
                  )}
                  {store.createdAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Създаден</span>
                      <span className="text-sm font-medium">
                        {new Date(store.createdAt).toLocaleDateString("bg-BG")}
                      </span>
                    </div>
                  )}
                  {store.isMain && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Тип</span>
                      <Badge variant="outline" className="text-xs">
                        Основен магазин
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
