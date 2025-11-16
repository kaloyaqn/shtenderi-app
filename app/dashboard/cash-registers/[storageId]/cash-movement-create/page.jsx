'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/session-context';
import BasicHeader from '@/components/BasicHeader';
import Link from 'next/link';

export default function CashMovementCreatePage() {
  const { storageId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('DEPOSIT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch(`/api/cash-registers/${storageId}/cash-movements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseFloat(amount),
        type,
        reason,
        userId: session?.user?.id,
      }),
    });
    if (res.ok) {
      router.push(`/dashboard/cash-registers/${storageId}`);
    } else {
      const data = await res.json();
      setError(data.error || 'Грешка при създаване на движение по касата');
    }
    setLoading(false);
  }

  return (
    <div className="container mx-auto max-w-md">
      <BasicHeader title="Ново движение по каса" subtitle="Внасяне или теглене на пари в касата">
  
      </BasicHeader>
      <form className="mt-6 p-4 border rounded bg-gray-50" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Сума</label>
          <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Тип</label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue placeholder="Избери тип" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DEPOSIT">Служебно въведени</SelectItem>
              <SelectItem value="WITHDRAWAL">Служебно изведени</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mb-4">
          <label className="block mb-1">Основание</label>
          <Input type="text" value={reason} onChange={e => setReason(e.target.value)} required />
        </div>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        <Button type="submit" disabled={loading}>{loading ? 'Обработка...' : 'Създай движение'}</Button>
      </form>
    </div>
  );
} 