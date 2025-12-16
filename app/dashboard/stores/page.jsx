'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQueryState } from "nuqs"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, PlusIcon, Filter } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Combobox } from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"
import BasicHeader from "@/components/BasicHeader"
import LoadingScreen from "@/components/LoadingScreen"
import TableLink from "@/components/ui/table-link"

export default function StoresPage() {
  const router = useRouter()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [storeToDelete, setStoreToDelete] = useState(null)

  // Filters (synced to URL like stands page)
  const [name, setName] = useQueryState("name")
  const [cityId, setCityId] = useQueryState("cityId")
  const [channelId, setChannelId] = useQueryState("channelId")
  const [partnerId, setPartnerId] = useQueryState("partnerId")

  const [cities, setCities] = useState([])
  const [channels, setChannels] = useState([])
  const [partners, setPartners] = useState([])

  const columns = [
    {
      accessorKey: "name",
      header: "Име на магазин",
      cell: ({ row }) => {
        const store = row.original;
        return (
          <TableLink
            href={`/dashboard/stores/${store.id}`}
          >
            {store.name}
          </TableLink>
        );
      },
    },
    {
      accessorKey: "city.name",
      header: "Град",
    },
    {
      accessorKey: "partner",
      header: "Партньор",
      cell: ({ row }) => (
        <TableLink href={`/dashboard/partners/${row.original.partner.id}`}>
        {row.original.partner?.name || "-"}
        </TableLink>
      ),
      filterFn: (row, columnId, filterValue) => {
        const partner = row.original.partner;
        if (!partner || !partner.name) return false;
        return partner.name.toLowerCase().includes(filterValue.toLowerCase());
      },
    },
    {
      accessorKey: "channel.name",
      header: "Сегмент/Канал",
    },
    {
      accessorKey: "stands",
      header: "Щендери",
      cell: ({ row }) => Array.isArray(row.original.stands) ? row.original.stands.length : 0,
    },
    {
      accessorKey: "contact",
      header: "Лице за контакт",
    },
    {
      accessorKey: "phone",
      header: "Телефон",
    },


    {
      id: "actions",
      cell: ({ row }) => {
        const store = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="table"
              onClick={() => router.push(`/dashboard/stores/${store.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="table"
              onClick={() => {
                setStoreToDelete(store)
                setDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const fetchStores = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (cityId) params.set("city", cityId)
      if (channelId) params.set("channel", channelId)
      if (partnerId) params.set("partner", partnerId)
      if (name) params.set("name", name)

      const query = params.toString()
      const response = await fetch(`/api/stores${query ? `?${query}` : ""}`)
      if (!response.ok) throw new Error('Failed to fetch stores')
      const stores = await response.json()
      setData(stores)
    } catch (error) {
      console.error('Error fetching stores:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFilterData = async () => {
    try {
      const [citiesRes, channelsRes, partnersRes] = await Promise.all([
        fetch('/api/cities'),
        fetch('/api/channels'),
        fetch('/api/partners'),
      ])

      if (citiesRes.ok) {
        setCities(await citiesRes.json())
      }
      if (channelsRes.ok) {
        setChannels(await channelsRes.json())
      }
      if (partnersRes.ok) {
        setPartners(await partnersRes.json())
      }
    } catch (error) {
      console.error("Error fetching filter data:", error)
    }
  }

  const handleDelete = async () => {
    if (!storeToDelete) return
    try {
      const response = await fetch(`/api/stores/${storeToDelete.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete store')
      }
      fetchStores()
    } catch (error) {
      console.error('Error deleting store:', error)
    } finally {
      setDeleteDialogOpen(false)
      setStoreToDelete(null)
    }
  }

  useEffect(() => {
    fetchFilterData()
  }, [])

  useEffect(() => {
    fetchStores()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityId, channelId, partnerId, name])

  if (loading && data.length === 0) {
    return <LoadingScreen />
  }

  return (
    <div className="">
      <BasicHeader
        title={"Магазини"}
        subtitle={"Управлявай твоите магазини"}
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter /> Филтри
            </Button>
          </PopoverTrigger>
          <PopoverContent padding={0} sideOffset={0} className="w-md">
            <div className="">
              <div className="w-full p-4 bg-gray-50 border-b border-b-gray-300 rounded-t-md">
                <h4 className="leading-none font-medium">Филтри</h4>
                <p className="text-muted-foreground text-sm ">
                  Избери филтрите за магазини
                </p>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="w-full grid gap-2">
                  <Label>Име на магазин</Label>
                  <Input
                    placeholder="Въведи име на магазин"
                    value={name || ""}
                    onChange={(e) =>
                      setName(e.target.value === "" ? null : e.target.value)
                    }
                  />
                </div>

                <div className="w-full grid gap-2">
                  <Label>Град</Label>
                  <Combobox
                    options={cities.map((city) => ({
                      key: city.id,
                      value: city.id,
                      label: city.name,
                    }))}
                    placeholder="Избери град"
                    onValueChange={(value) => setCityId(value)}
                    value={cityId}
                  />
                </div>

                <div className="w-full grid gap-2">
                  <Label>Сегмент / Канал</Label>
                  <Combobox
                    options={channels.map((channel) => ({
                      key: channel.id,
                      value: channel.id,
                      label: channel.name,
                    }))}
                    placeholder="Избери сегмент/канал"
                    onValueChange={(value) => setChannelId(value)}
                    value={channelId}
                  />
                </div>

                <div className="w-full grid gap-2">
                  <Label>Партньор</Label>
                  <Combobox
                    options={partners.map((partner) => ({
                      key: partner.id,
                      value: partner.id,
                      label: partner.name,
                    }))}
                    placeholder="Избери партньор"
                    onValueChange={(value) => setPartnerId(value)}
                    value={partnerId}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button onClick={() => router.push('/dashboard/stores/create')}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Добави магазин
        </Button>
      </BasicHeader>

      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        filterableColumns={[
          { id: "name", title: "Име на магазин" },
          { id: "contact", title: "Лице за контакт" },
          { id: "phone", title: "Телефон" },
          { id: "partner", title: "Партньор" },
        ]}
      />
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Изтриване на магазин</AlertDialogTitle>
            <AlertDialogDescription>
              Сигурни ли сте, че искате да изтриете този магазин?
              Това действие не може да бъде отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отказ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Изтрий</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
