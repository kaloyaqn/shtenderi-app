'use client'

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import LoadingScreen from '@/components/LoadingScreen';
import { DataTable } from '@/components/ui/data-table';
import PaymentCreateModal from './_PaymentCreateModal';
import BasicHeader from '@/components/BasicHeader';
import { useRouter } from 'next/navigation';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchPayments() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/payments');
        if (!res.ok) throw new Error('Failed to fetch payments');
        const data = await res.json();
        setPayments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Грешка при зареждане на данни');
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  const columns = [
    {
      accessorKey: 'amount',
      header: 'Сума',
      cell: ({ row }) => row.original.amount.toFixed(2) + ' лв.',
    },
    {
      accessorKey: 'method',
      header: 'Метод',
      cell: ({ row }) => row.original.method === 'CASH' ? 'В брой' : 'Банка',
    },
    {
      accessorKey: 'cashRegister',
      header: 'Каса',
      cell: ({ row }) => row.original.cashRegister?.name || '-',
    },
    {
      accessorKey: 'invoice',
      header: 'Фактура',
      cell: ({ row }) => row.original.invoice?.invoiceNumber || '-',
    },
    {
      accessorKey: 'partner',
      header: 'Партньор',
      cell: ({ row }) => row.original.invoice?.partnerName || '-',
    },
    {
      accessorKey: 'createdAt',
      header: 'Дата',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString('bg-BG'),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/payments/${row.original.id}`)}>Детайли</Button>
          <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/payments/${row.original.id}/edit`)}>Редакция</Button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingScreen />;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="container mx-auto py-10">
      <BasicHeader
        title="Плащания"
        subtitle="Управлявай всички плащания."
        button_text="Добави плащане"
        onClick={() => router.push('/dashboard/payments/create')}
      />
      <DataTable
        columns={columns}
        data={payments}
        searchKey="invoice.invoiceNumber"
      />
    </div>
  );
} 