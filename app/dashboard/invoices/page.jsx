"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await fetch('/api/invoices');
        if (!res.ok) {
          if (res.status === 401) {
            toast.error('Моля, влезте в системата.');
          } else {
            throw new Error('Failed to fetch invoices');
          }
          return;
        }
        const data = await res.json();
        setInvoices(data);
      } catch (error) {
        toast.error('Failed to load invoices.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    if (session) {
      fetchInvoices();
    }
  }, [session]);

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

  const userIsAdmin = session?.user?.role === 'ADMIN';

  if (loading) return <div>Зареждане...</div>;

  if (!loading && invoices.length === 0 && !userIsAdmin) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-3xl font-bold mb-8">Фактури</h1>
        <p>Нямате издадени фактури за зачислените Ви щандове.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Фактури</h1>
      </div>
      <DataTable columns={columns} data={invoices} searchKey="invoiceNumber" />
    </div>
  );
} 