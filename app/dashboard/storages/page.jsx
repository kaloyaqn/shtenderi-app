'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function StoragesPage() {
  const router = useRouter();
  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storageToDelete, setStorageToDelete] = useState(null);

  const fetchStorages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/storages');
      if (!response.ok) throw new Error('Failed to fetch storages');
      const data = await response.json();
      setStorages(data);
    } catch (error) {
      console.error('Error fetching storages:', error);
      toast.error('Failed to load storages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorages();
  }, []);

  const handleDelete = async () => {
    if (!storageToDelete) return;

    await toast.promise(
      async () => {
        const response = await fetch(`/api/storages/${storageToDelete.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete storage');
        }
        await fetchStorages(); // Refresh data
      },
      {
        loading: 'Deleting storage...',
        success: 'Storage deleted successfully!',
        error: (err) => err.message,
      }
    );

    setDeleteDialogOpen(false);
    setStorageToDelete(null);
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Име',
      cell: ({ row }) => (
        <a
          href={`/dashboard/storages/${row.original.id}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {row.original.name}
        </a>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Създаден на',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('bg-BG'),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const storage = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/dashboard/storages/${storage.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setStorageToDelete(storage);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="md:py-10 py-5">
      <div className="flex justify-between items-center mb-8">
        <h1 className="md:text-3xl text-xl font-bold">Складове</h1>
        <Button onClick={() => router.push('/dashboard/storages/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Създай склад
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={storages}
        searchKey="name"
        loading={loading}
        filterableColumns={[{ id: 'name', title: 'Име' }]}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Наистина ли искате да изтриете този склад?</AlertDialogTitle>
            <AlertDialogDescription>
              Това действие не може да бъде отменено. Това ще изтрие за постоянно склада и всички свързани с него продукти.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отказ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Изтрий</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 