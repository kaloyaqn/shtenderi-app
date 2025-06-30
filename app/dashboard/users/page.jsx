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

function EditUserDialog({ open, onOpenChange, user, onUserUpdated }) {
  const [stands, setStands] = useState([]);
  const [partners, setPartners] = useState([]);
  const [selectedStands, setSelectedStands] = useState([]);
  const [selectedPartners, setSelectedPartners] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      // Fetch stands and set selected
      fetch('/api/stands')
        .then(res => res.json())
        .then(data => setStands(data));
      setSelectedStands(user.stands?.map(s => s.id) || []);
      
      // Fetch partners and set selected
      fetch('/api/partners')
        .then(res => res.json())
        .then(data => setPartners(data));
      setSelectedPartners(user.partners?.map(p => p.id) || []);
    }
  }, [open, user]);

  const handleStandChange = (e) => {
    const value = e.target.value;
    setSelectedStands(prev =>
      prev.includes(value)
        ? prev.filter(id => id !== value)
        : [...prev, value]
    );
  };

  const handlePartnerChange = (e) => {
    const value = e.target.value;
    setSelectedPartners(prev =>
      prev.includes(value)
        ? prev.filter(id => id !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Update stands
      await fetch(`/api/users/${user.id}/stands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ standIds: selectedStands }),
      });
      
      // Update partners
      await fetch(`/api/users/${user.id}/partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerIds: selectedPartners }),
      });

      toast.success('Достъпът е обновен!');
      onUserUpdated();
      onOpenChange(false);
    } catch (err) {
      toast.error('Грешка при запис');
    } finally {
      setSaving(false);
    }
  };

  if (!open || !user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Редактирай потребител</h2>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="block mb-1 font-medium">Име</label>
            <input name="name" value={user.name} onChange={handleChange} className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Имейл *</label>
            <input name="email" value={user.email} onChange={handleChange} required className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Парола *</label>
            <input name="password" type="password" value={user.password} onChange={handleChange} required className="border rounded px-2 py-1 w-full" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Роля *</label>
            <select name="role" value={user.role} onChange={handleChange} className="border rounded px-2 py-1 w-full">
              <option value="USER">Потребител</option>
              <option value="ADMIN">Администратор</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Щендери (достъп)</label>
            <div className="max-h-40 overflow-y-auto border rounded p-2">
              {stands.map(stand => (
                <label key={stand.id} className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    value={stand.id}
                    checked={selectedStands.includes(stand.id)}
                    onChange={handleStandChange}
                  />
                  {stand.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Партньори (достъп)</label>
            <div className="max-h-40 overflow-y-auto border rounded p-2">
              {partners.map(partner => (
                <label key={partner.id} className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    value={partner.id}
                    checked={selectedPartners.includes(partner.id)}
                    onChange={handlePartnerChange}
                  />
                  {partner.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отказ</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Запис...' : 'Запази'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
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