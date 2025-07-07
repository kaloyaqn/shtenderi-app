'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BasicHeader from '@/components/BasicHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingScreen from '@/components/LoadingScreen';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

export default function CashRegisterCreatePage() {
  const [form, setForm] = useState({ name: '', storageId: '' });
  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/storages')
      .then(res => res.json())
      .then(data => setStorages(Array.isArray(data) ? data : []))
      .catch(() => setStorages([]))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleStorageChange = (value) => {
    setForm(f => ({ ...f, storageId: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/cash-registers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Грешка при създаване');
      router.push('/dashboard/cash-registers');
      router.refresh();
    } catch (err) {
      setError('Грешка при създаване');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="">
      <BasicHeader title="Нова каса" subtitle="Създай нова каса или банка." hasBackButton />
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Нова каса</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Име на каса</label>
              <Input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-1">Склад</label>
              <Select value={form.storageId} onValueChange={handleStorageChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Изберете склад" />
                </SelectTrigger>
                <SelectContent>
                  {storages.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>{saving ? 'Създаване...' : 'Създай'}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Отказ</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 