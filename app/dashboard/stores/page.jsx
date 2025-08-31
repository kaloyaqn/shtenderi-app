'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, PlusIcon } from "lucide-react"
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
import BasicHeader from "@/components/BasicHeader"
import LoadingScreen from "@/components/LoadingScreen"
import TableLink from "@/components/ui/table-link"

export default function StoresPage() {
  const router = useRouter()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [storeToDelete, setStoreToDelete] = useState(null)

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
      accessorKey: "contact",
      header: "Лице за контакт",
    },
    {
      accessorKey: "phone",
      header: "Телефон",
    },
    {
      accessorKey: "partner",
      header: "Партньор",
      cell: ({ row }) => row.original.partner?.name || "-",
      filterFn: (row, columnId, filterValue) => {
        const partner = row.original.partner;
        if (!partner || !partner.name) return false;
        return partner.name.toLowerCase().includes(filterValue.toLowerCase());
      },
    },
    {
      accessorKey: "stands",
      header: "Щендери",
      cell: ({ row }) => Array.isArray(row.original.stands) ? row.original.stands.length : 0,
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
    try {
      const response = await fetch('/api/stores')
      if (!response.ok) throw new Error('Failed to fetch stores')
      const stores = await response.json()
      setData(stores)
    } catch (error) {
      console.error('Error fetching stores:', error)
    } finally {
      setLoading(false)
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
    fetchStores()
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="">
      {/* <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Магазини</h1>
        <Button onClick={() => router.push('/dashboard/stores/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Добави магазин
        </Button>
      </div> */}

      <BasicHeader title={"Магазини"}
      subtitle={"Управлявай твоите магазини"}
      button_text={'Добави магазин'}
      button_icon={<PlusIcon/>}
      onClick={() => router.push('/dashboard/stores/create')}

      />
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