"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Pencil, Trash2, PlusIcon, Warehouse, WarehouseIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import BasicHeader from "@/components/BasicHeader";
import TableLink from "@/components/ui/table-link";
import LoadingScreen from "@/components/LoadingScreen";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import CreateStorageForm from "@/components/forms/storage/create";
import { Input } from "@/components/ui/input";
import NoAcess from "@/components/NoAccess";
import { useIsMobile } from "@/hooks/use-mobile";

export default function StoragesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isMobile = useIsMobile();
  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [storageToDelete, setStorageToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [storageToEdit, setStorageToEdit] = useState(null);
  const [editName, setEditName] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const fetchStorages = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/storages");
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Моля, влезте в системата.");
        } else {
          throw new Error("Failed to fetch storages");
        }
        return;
      }
      const data = await response.json();
      setStorages(data);
    } catch (error) {
      console.error("Error fetching storages:", error);
      toast.error("Failed to load storages.");
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
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to delete storage");
        }
        await fetchStorages(); // Refresh data
      },
      {
        loading: "Deleting storage...",
        success: "Storage deleted successfully!",
        error: (err) => err.message,
      }
    );

    setDeleteDialogOpen(false);
    setStorageToDelete(null);
  };

  const openEditDialog = (storage) => {
    setStorageToEdit(storage);
    setEditName(storage.name);
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editName.trim()) {
      toast.error("Моля, въведете име на склад.");
      return;
    }
    setEditLoading(true);
    try {
      const res = await fetch(`/api/storages/${storageToEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) throw new Error("Грешка при редакция на склад.");
      toast.success("Складът е обновен успешно!");
      setEditDialogOpen(false);
      setStorageToEdit(null);
      setEditName("");
      await fetchStorages();
    } catch (err) {
      toast.error(err.message || "Грешка при редакция на склад.");
    } finally {
      setEditLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Име",
      cell: ({ row }) => (
        <TableLink href={`/dashboard/storages/${row.original.id}`}>
          {row.original.name}
        </TableLink>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Създаден на",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("bg-BG"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const storage = row.original;
        if (session?.user?.role !== "ADMIN") return null;
        return (
          <div className="flex items-center gap-2">
            <Button variant="table" onClick={() => openEditDialog(storage)}>
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

  const userIsAdmin = session?.user?.role === "ADMIN";

  if (loading) return <LoadingScreen />;

  if (!loading && storages.length === 0 && !userIsAdmin) {
    return <NoAcess title={`Нямате зачислени складове`} 
    subtitlte={`
                  В момента няма налични складове в системата. За добавяне на нови складове се свържете с администратор.
      `}
      help_text={`                  Складовете се управляват от администратор. Свържете се с него за достъп до складови операции.
`}
    icon={<><WarehouseIcon className="h-12 w-12 text-gray-400" /></>}/>;
  }

  if (isMobile) {
    return (
      <div className="p-2">
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
          title={"Складове"}
          subtitle={"Вижте всички складове, които са Ви начислени"}
        >
        </BasicHeader>
      )}
        <div className="flex flex-col gap-2 mt-4">
          {storages.map((storage) => (
            <div key={storage.id} className="border rounded-lg p-3 flex flex-col gap-1 bg-white shadow-sm">
              <div className="flex gap-2">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Warehouse className="h-5 w-5 text-gray-600" />
                    </div>

              <div>
              <div className="font-semibold text-base">{storage.name}</div>
              <div className="text-xs text-gray-500">Създаден на: {new Date(storage.createdAt).toLocaleDateString("bg-BG")}</div>
             
              </div>

              </div>


               <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={() => router.push(`/dashboard/storages/${storage.id}`)}
              >
                Виж детайли
              </Button>
            </div>
          ))}
        </div>
        {userIsAdmin && (
          <Button className="fixed bottom-6 right-6 rounded-full shadow-lg" size="icon" onClick={() => setCreateDialogOpen(true)}>
            <PlusIcon />
          </Button>
        )}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Създаване на склад</DialogTitle>
            </DialogHeader>
            <CreateStorageForm
              onSuccess={async () => {
                await fetchStorages();
                setCreateDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
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
          title={"Складове"}
          subtitle={"Вижте всички складове, които са Ви начислени"}
        >
          <Button>test</Button>
        </BasicHeader>
      )}

      <DataTable
        columns={columns}
        data={storages}
        searchKey="name"
        loading={loading}
        filterableColumns={[{ id: "name", title: "Име" }]}
      />

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Създаване на склад</DialogTitle>
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
            <AlertDialogTitle>
              Наистина ли искате да изтриете този склад?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Това действие не може да бъде отменено. Това ще изтрие за
              постоянно склада и всички свързани с него продукти.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отказ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Изтрий</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирай склад</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Име на склад"
              disabled={editLoading}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={editLoading}
            >
              Отказ
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={editLoading || !editName.trim()}
            >
              {editLoading ? "Запазване..." : "Запази"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
