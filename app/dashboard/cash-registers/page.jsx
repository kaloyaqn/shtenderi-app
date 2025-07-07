'use client'

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import LoadingScreen from '@/components/LoadingScreen';
import BasicHeader from '@/components/BasicHeader';
import { DataTable } from '@/components/ui/data-table';
import { useRouter } from 'next/navigation';
import { Edit } from 'lucide-react';

export default function CashRegistersPage() {
  const [registers, setRegisters] = useState([]);
  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', storageId: '' });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [regRes, stRes] = await Promise.all([
          fetch('/api/cash-registers'),
          fetch('/api/storages'),
        ]);
        let regData = await regRes.json();
        let stData = await stRes.json();
        if (!Array.isArray(regData)) regData = [];
        if (!Array.isArray(stData)) stData = [];
        setRegisters(regData);
        setStorages(stData);
      } catch (err) {
        setError('Грешка при зареждане на данни');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleFormChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/cash-registers', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id: editId }),
      });
      if (!res.ok) throw new Error('Грешка при запис');
      setShowForm(false);
      setForm({ name: '', storageId: '' });
      setEditId(null);
      // Refresh
      const regRes = await fetch('/api/cash-registers');
      let regData = await regRes.json();
      if (!Array.isArray(regData)) regData = [];
      setRegisters(regData);
    } catch (err) {
      setError('Грешка при запис');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = reg => {
    setForm({ name: reg.name, storageId: reg.storageId });
    setEditId(reg.id);
    setShowForm(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Сигурни ли сте, че искате да изтриете тази каса?')) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/cash-registers?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Грешка при изтриване');
      setRegisters(registers.filter(r => r.id !== id));
    } catch (err) {
      setError('Грешка при изтриване');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Име на каса',
    },
    {
      accessorKey: 'storage',
      header: 'Склад',
      cell: ({ row }) => row.original.storage?.name || '-',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="table" onClick={() => router.push(`/dashboard/cash-registers/${row.original.id}/edit`)}><Edit /></Button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingScreen />;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="">
      <BasicHeader
        title="Каси"
        subtitle="Управлявай всички каси и банки."
        button_text="Добави каса"
        onClick={() => router.push('/dashboard/cash-registers/create')}
      />
      {showForm && (
        <Card className="mb-6 max-w-lg">
          <CardHeader>
            <CardTitle>{editId ? 'Редакция на каса' : 'Нова каса'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block mb-1">Име на каса</label>
                <Input name="name" value={form.name} onChange={handleFormChange} required />
              </div>
              <div>
                <label className="block mb-1">Склад</label>
                <Select name="storageId" value={form.storageId} onChange={handleFormChange} required className="w-full">
                  <option value="">Изберете склад</option>
                  {storages.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>{saving ? 'Запис...' : 'Запиши'}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditId(null); }}>Отказ</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      <DataTable
        columns={columns}
        data={registers}
        searchKey="name"
        filterableColumns={[
          { id: 'name', title: 'Име на каса' },
          { id: 'storage', title: 'Склад' },
        ]}
      />
    </div>
  );
} 