"use client"

import { useEffect, useState, useRef } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function CreateUserDialog({ open, onOpenChange, onUserCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [creating, setCreating] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Грешка при създаване');
      toast.success('Потребителят е добавен!');
      setForm({ name: '', email: '', password: '', role: 'USER' });
      onUserCreated();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Добави потребител</h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="block mb-1 font-medium">Име</label>
            <input name="name" value={form.name} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Имейл *</label>
            <input name="email" value={form.email} onChange={handleChange} required className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Парола *</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Роля *</label>
            <select name="role" value={form.role} onChange={handleChange} className="border rounded px-2 py-1 w-full">
              <option value="USER">Потребител</option>
              <option value="ADMIN">Администратор</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отказ</Button>
            <Button type="submit" disabled={creating}>{creating ? 'Добавяне...' : 'Добави'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  if (status === 'loading') return <div>Зареждане на сесия...</div>;
  console.log('Current session:', session);
  if (!session || session.user?.role !== 'ADMIN') {
    if (typeof window !== 'undefined') router.replace('/dashboard');
    return <div className="text-red-500 text-center py-10">Нямате достъп до тази страница.</div>;
  }
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`/api/users/${userToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Грешка при изтриване');
      toast.success('Потребителят е изтрит!');
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const columns = [
    { accessorKey: 'name', header: 'Име' },
    { accessorKey: 'email', header: 'Имейл' },
    { accessorKey: 'role', header: 'Роля', cell: ({ row }) => row.original.role === 'ADMIN' ? 'Администратор' : 'Потребител' },
    { accessorKey: 'createdAt', header: 'Създаден', cell: ({ row }) => new Date(row.original.createdAt).toLocaleString() },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => { setUserToDelete(row.original); setDeleteDialogOpen(true); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Потребители</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Добави потребител
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        filterableColumns={[{ id: 'email', title: 'Имейл' }]}
      />
      <CreateUserDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onUserCreated={fetchUsers} />
      {/* Simple delete dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Изтриване на потребител</h2>
            <p className="mb-4">Сигурни ли сте, че искате да изтриете потребител <b>{userToDelete?.name}</b>?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Отказ</Button>
              <Button variant="destructive" onClick={handleDelete}>Изтрий</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 