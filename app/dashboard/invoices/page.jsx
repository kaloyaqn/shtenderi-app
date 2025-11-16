"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session-context';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { toast } from 'sonner';
import LoadingScreen from '@/components/LoadingScreen';
import BasicHeader from '@/components/BasicHeader';
import { Eye } from 'lucide-react';

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
        <Button variant="table" onClick={() => router.push(`/dashboard/invoices/${row.original.id}`)}>
          <Eye /> Виж
        </Button>
      ),
    },
  ];

  const userIsAdmin = session?.user?.role === 'ADMIN';

  if (loading) return <LoadingScreen />;

  if (!loading && invoices.length === 0 && !userIsAdmin) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-3xl font-bold mb-8">Фактури</h1>
        <p>Нямате издадени фактури за зачислените Ви щандове.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <BasicHeader title={"Фактури"} subtitle={'Виж всички твои зачислени фактури'} />
      <DataTable columns={columns} data={invoices} searchKey="invoiceNumber" />
    </div>
  );
} 