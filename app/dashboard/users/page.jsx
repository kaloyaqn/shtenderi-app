'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
import BasicHeader from '@/components/BasicHeader';

// CreateUserDialog component
function CreateUserDialog({ open, onOpenChange, onUserCreated }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create user');
      }
      toast.success('Потребителят е създаден успешно!');
      onUserCreated();
      onOpenChange(false);
      setFormData({ name: '', email: '', password: '', role: 'USER' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };
  
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Създай нов потребител</h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
                <label className="block mb-1 font-medium">Име</label>
                <input name="name" value={formData.name} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
            </div>
            <div>
                <label className="block mb-1 font-medium">Имейл *</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} required className="border rounded px-2 py-1 w-full" />
            </div>
            <div>
                <label className="block mb-1 font-medium">Парола *</label>
                <input name="password" type="password" value={formData.password} onChange={handleChange} required className="border rounded px-2 py-1 w-full" />
            </div>
            <div>
                <label className="block mb-1 font-medium">Роля *</label>
                <select name="role" value={formData.role} onChange={handleChange} className="border rounded px-2 py-1 w-full">
                    <option value="USER">Потребител</option>
                    <option value="ADMIN">Администратор</option>
                </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отказ</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Запис...' : 'Запази'}</Button>
            </div>
        </form>
      </div>
    </div>
  );
}


// Main UsersPage component
export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [session]);

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
        const response = await fetch(`/api/users/${userToDelete.id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete user');
        }
        toast.success('Потребителят е изтрит.');
        fetchUsers();
    } catch (error) {
        toast.error(error.message);
    } finally {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
    }
  };

  const columns = [
    { accessorKey: 'name', header: 'Име' },
    { accessorKey: 'email', header: 'Имейл' },
    { accessorKey: 'role', header: 'Роля' },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/users/${user.id}/edit`)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setUserToDelete(user);
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
  
  if (session?.user?.role !== 'ADMIN') {
    return <div className="p-4">Достъп отказан.</div>;
  }

  if (loading) {
    return <div>Зареждане...</div>;
  }

  return (
    <div className="container mx-auto">
      {/* <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Потребители</h1>

      </div> */}
      <BasicHeader title={`Потребители`} subtitle={`Управлявай потребители`}>
      <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="" />
          Добави потребител
        </Button>
      </BasicHeader>
      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        filterableColumns={[{ id: 'email', title: 'Имейл' }]}
      />
      <CreateUserDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onUserCreated={fetchUsers} />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Изтриване на потребител</AlertDialogTitle>
            <AlertDialogDescription>
              Сигурни ли сте, че искате да изтриете {userToDelete?.name}?
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