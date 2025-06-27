"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await fetch('/api/invoices');
        if (!res.ok) throw new Error('Failed to fetch invoices');
        const data = await res.json();
        setInvoices(data);
      } catch (error) {
        toast.error('Failed to load invoices.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  const columns = [
    {
      accessorKey: 'invoiceNumber',
      header: '№ на фактура',
    },
    {
      accessorKey: 'revisionNumber',
      header: '№ на продажба',
      cell: ({ row }) => row.original.revisionNumber || '-',
    },
    {
      accessorKey: 'partnerName',
      header: 'Партньор',
      cell: ({ row }) => row.original.partnerName || '-',
    },
    {
        accessorKey: 'issuedAt',
        header: 'Дата на издаване',
        cell: ({ row }) => new Date(row.original.issuedAt).toLocaleString('bg-BG'),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="outline" onClick={() => router.push(`/dashboard/invoices/${row.original.id}`)}>
          Преглед
        </Button>
      ),
    },
  ];

  if (loading) return <div>Зареждане...</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Фактури</h1>
      </div>
      <DataTable columns={columns} data={invoices} searchKey="invoiceNumber" />
    </div>
  );
} 