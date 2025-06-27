'use client'

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
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

export default function Stands() {
    const [stands, setStands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [standToDelete, setStandToDelete] = useState(null)
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const router = useRouter();

    const fetchStands = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/stands")
            if (!res.ok) throw new Error('Failed to fetch stands')
            const stands = await res.json();
            setStands(stands);
        } catch (err) {
            console.error('Error fetching stands', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchStands();
    }, [])

    const handleDelete = async () => {
        if (!standToDelete) return
    
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
                  <a
                    href={`/dashboard/stands/${stand.id}`}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {stand.name}
                  </a>
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
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/dashboard/stands/${stand.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        setStandToDelete(stand)
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

    if (loading) {
        return <div>Зареждане...</div>
    }

    return (
        <>
            <div className="flex md:flex-row flex-col w-full justify-between md:items-center mb-2">
                <h1 className="md:text-3xl text-xl md:mb-0 mb-2 font-bold">Щендери</h1>
                <Button onClick={() => router.push('/dashboard/stands/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Добави щендер
                </Button>



                </div>
            <DataTable 
                columns={columns}
                data={stands}
                searchKey="name"
            />

            
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
        </>
    )
}