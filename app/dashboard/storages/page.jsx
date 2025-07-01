'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Plus, Pencil, Trash2, PlusIcon } from 'lucide-react';
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
import BasicHeader from '@/components/BasicHeader';
import TableLink from '@/components/ui/table-link';
import LoadingScreen from '@/components/LoadingScreen';
import {Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CreateStorageForm from '@/components/forms/storage/create';

export default function StoragesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [storageToDelete, setStorageToDelete] = useState(null);

  const fetchStorages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/storages');
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Моля, влезте в системата.');
        } else {
          throw new Error('Failed to fetch storages');
        }
        return;
      }
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
    if (session) {
      fetchStorages();
    }
  }, [session]);

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
        <TableLink
          href={`/dashboard/storages/${row.original.id}`}
        >
          {row.original.name}
        </TableLink>
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
        if (session?.user?.role !== 'ADMIN') return null;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="table"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="table"
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

  const userIsAdmin = session?.user?.role === 'ADMIN';

  if (loading) return <LoadingScreen />

  if (!loading && storages.length === 0 && !userIsAdmin) {
    return (
      <div className="md:py-10 py-5 text-center">
        <h1 className="md:text-3xl text-xl font-bold mb-4">Складове</h1>
        <p>Нямате зачислени складове. Моля, свържете се с администратор.</p>
      </div>
    );
  }

  return (
    <div className="">      
        {userIsAdmin && (
                <BasicHeader 
                title="Складове"
                subtitle="Вижте всички складове, които са Ви начислени."
                button_text={"Добави склад"}
                button_icon={<PlusIcon />}
                onClick={() => setCreateDialogOpen(true)}
                />
        )}

        {!userIsAdmin && (
                  <BasicHeader 
                  title={'Складове'}
                  subtitle={"Вижте всички складове, които са Ви начислени"}
                  />
        )}

      <DataTable
        columns={columns}
        data={storages}
        searchKey="name"
        loading={loading}
        filterableColumns={[{ id: 'name', title: 'Име' }]}
      />

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Създаване на склад
            </DialogTitle>
          </DialogHeader>
          <CreateStorageForm
            onSuccess={async () => {
              await fetchStorages();
              setCreateDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

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