'use client'

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react";
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
import CreateStandPage from "./create/page";
import LoadingScreen from "@/components/LoadingScreen";
import TableLink from "@/components/ui/table-link";

export default function Stands() {
    const [stands, setStands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [standToDelete, setStandToDelete] = useState(null)
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'ADMIN';

    const fetchStands = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/stands")
            if (!res.ok) throw new Error('Failed to fetch stands')
            const data = await res.json();
            setStands(data);
        } catch (err) {
            console.error('Error fetching stands', err);
            setStands([]); // Ensure stands is an empty array on error
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (session) { // Only fetch stands if session is available
            fetchStands();
        }
    }, [session])

    const handleDelete = async () => {
        if (!standToDelete || !isAdmin) return
    
        try {
          const response = await fetch(`/api/stands/${standToDelete.id}`, {
            method: 'DELETE',
          })
    
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to delete stand')
          }
    
          fetchStands() // Refresh the data
        } catch (error) {
          console.error('Error deleting stand:', error)
        } finally {
          setDeleteDialogOpen(false)
          setStandToDelete(null)
        }
    }

    const columns = [
        {
            accessorKey: 'name',
            header: 'Име на щендер',
            cell: ({ row }) => {
                const stand = row.original;
                return (
                  <TableLink
                    href={`/dashboard/stands/${stand.id}`}
                  >
                    {stand.name}
                  </TableLink>
                );
            },
        },
        {
            accessorKey: '_count.standProducts',
            header: 'Брой продукти',
        },
        // We might want to show the store name here later
        {
            id: "actions",
            cell: ({ row }) => {
              const stand = row.original
              return (
                <div className="flex items-center gap-2">
                  <Button
                    variant="table"
                    size="icon"
                    onClick={() => router.push(`/dashboard/stands/${stand.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="table"
                    size="icon"
                    onClick={() => {
                        setStandToDelete(stand)
                        setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-2 w-2" />
                  </Button>
                </div>
              )
            },
          },
    ]

    if (loading) {
        return <LoadingScreen />
    }
    
    if (!loading && stands.length === 0) {
        return (
            <div className="">
                <div className="flex md:flex-row flex-col w-full justify-between md:items-center mb-2">
                    <h1 className="md:text-xl text-xl md:mb-0 mb-2 font-bold">Щендери</h1>
                    {isAdmin && (
                        <Button onClick={() => router.push('/dashboard/stands/create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Добави щендер
                        </Button>
                    )}
                </div>
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold">
                        {isAdmin ? "Няма намерени щендери" : "Нямате достъп до щендери"}
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        {isAdmin ? "Създайте нов щендер, за да започнете." : "Моля, свържете се с администратор, за да ви бъде даден достъп."}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="">

    <div className="flex justify-between items-center pb-4 border-b mb-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900">Щендери</h1>
          <p className="text-base text-gray-600">
            Управление на щендери и зареждане на стока
          </p>
        </div>
        {isAdmin && (
                    <Button onClick={() => router.push('/dashboard/stands/create')}>
                        <Plus className="h-4 w-4" />
                        Добави щендер
                    </Button>
                )}
      </div>
            <DataTable 
                columns={columns}
                data={stands}
                searchKey="name"
            />
            
            {isAdmin && (
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Изтриване на щанд</AlertDialogTitle>
                            <AlertDialogDescription>
                            Сигурни ли сте, че искате да изтриете щанд {standToDelete?.name}?
                            Това действие не може да бъде отменено.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Отказ</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Изтрий</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    )
}