'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, UserIcon } from "lucide-react"
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
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import TableLink from "@/components/ui/table-link"
import LoadingScreen from "@/components/LoadingScreen"
import BasicHeader from "@/components/BasicHeader"
import NoAcess from "@/components/NoAccess"

export default function PartnersPage() {
  const router = useRouter()
  const { data: session } = useSession()
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
          <TableLink
            href={`/dashboard/partners/${partner.id}`}
          >
            {partner.id}
          </TableLink>
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
        if (session?.user?.role !== 'ADMIN') return null;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="table"
              onClick={() => router.push(`/dashboard/partners/${partner.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="table"
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

  const fetchPartners = async () => {
    try {
        const response = await fetch('/api/partners');
        if (!response.ok) {
          if (response.status === 401) {
            toast.error('Моля, влезте в системата');
          } else {
            throw new Error('Failed to fetch partners');
          }
          return;
        }
        const partners = await response.json();
        setData(partners);
    } catch (error) {
        console.error('Error fetching partners:', error);
        toast.error('Грешка при зареждане на партньори');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (session) { // Fetch only when session is available
      fetchPartners();
    }
  }, [session]);

  if (loading) {
    return <LoadingScreen />
  }
  
  const userIsAdmin = session?.user?.role === 'ADMIN';

  if (!loading && data.length === 0 && !userIsAdmin) {
    return (
      <NoAcess 
      icon={<UserIcon className="h-12 w-12 text-gray-400" />}
      help_text={`Ако имате нужда от помощ, свържете се с администратор.`}
      subtitlte={`
        Нямате зачислени партньори. За добавяне на нови партньори се свържете с администратор.
        `}
      title= {userIsAdmin ? "Няма намерени партньори" : "Нямате зачислени партньори"}
      />
    );
  }
  return (
    <div className="">
      {/* <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Партньори</h1>
        {userIsAdmin && (
          <Button onClick={() => router.push('/dashboard/partners/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Добави партньор
          </Button>
        )}
      </div> */}


      <BasicHeader
      title={'Партньори'}
      subtitle={'Управлявай партньорите си.'}
      >
      {userIsAdmin && (
          <Button onClick={() => router.push('/dashboard/partners/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Добави партньор
          </Button>
        )}

      </BasicHeader>

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