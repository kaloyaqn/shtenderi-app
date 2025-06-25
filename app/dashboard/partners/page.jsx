'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
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

export default function PartnersPage() {
  const router = useRouter()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [partnerToDelete, setPartnerToDelete] = useState(null)

  const columns = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        const partner = row.original;
        return (
          <a
            href={`/dashboard/partners/${partner.id}`}
            className="text-blue-600 underline hover:text-blue-800"
          >
            {partner.id}
          </a>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Име на фирмата",
    },
    {
      accessorKey: "bulstat",
      header: "Булстат",
    },
    {
      accessorKey: "contactPerson",
      header: "Лице за контакт",
    },
    {
      accessorKey: "phone",
      header: "Телефон",
    },
    {
      accessorKey: "stores",
      header: "Магазини",
      cell: ({ row }) => {
        const stores = row.original.stores
        return <div>{stores?.length || 0}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const partner = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/dashboard/partners/${partner.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setPartnerToDelete(partner)
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

  const handleDelete = async () => {
    if (!partnerToDelete) return

    try {
      const response = await fetch(`/api/partners/${partnerToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete partner')
      }

      // Refresh the data
      fetchPartners()
    } catch (error) {
      console.error('Error deleting partner:', error)
      // You might want to show an error toast here
    } finally {
      setDeleteDialogOpen(false)
      setPartnerToDelete(null)
    }
  }

  useEffect(() => {
    let isMounted = true;

    const fetchPartners = async () => {
        try {
            const response = await fetch('/api/partners');
            if (!response.ok) throw new Error('Failed to fetch partners');
            const partners = await response.json();
            if (isMounted) {
                setData(partners);
            }
        } catch (error) {
            console.error('Error fetching partners:', error);
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    };

    fetchPartners();

    return () => {
        isMounted = false;
    };
  }, []);

  if (loading) {
    return <div>Зареждане...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Партньори</h1>
        <Button onClick={() => router.push('/dashboard/partners/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Добави партньор
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        searchKey="name"
        filterableColumns={[
          {
            id: "id",
            title: "ID",
          },
          {
            id: "name",
            title: "Име на фирмата",
          },
          {
            id: "bulstat",
            title: "Булстат",
          },
          {
            id: "contactPerson",
            title: "Лице за контакт",
          },
          {
            id: "phone",
            title: "Телефон",
          },
        ]}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Изтриване на партньор</AlertDialogTitle>
            <AlertDialogDescription>
              Сигурни ли сте, че искате да изтриете партньор {partnerToDelete?.name}?
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