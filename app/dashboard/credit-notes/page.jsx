"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { toast } from 'sonner';
import BasicHeader from '@/components/BasicHeader';
import { EyeIcon } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

export default function CreditNotesPage() {
  const [creditNotes, setCreditNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchCreditNotes() {
      try {
        const res = await fetch('/api/credit-notes');
        if (!res.ok) throw new Error('Failed to fetch credit notes');
        const data = await res.json();
        setCreditNotes(data);
      } catch (error) {
        toast.error('Failed to load credit notes.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchCreditNotes();
  }, []);

  const columns = [
    {
      accessorKey: 'creditNoteNumber',
      header: '№ на кредитно известие',
    },
    {
      accessorKey: 'invoiceNumber',
      header: '№ на фактура',
      cell: ({ row }) => row.original.invoice?.invoiceNumber || '-',
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
        <Button variant="table" onClick={() => router.push(`/dashboard/credit-notes/${row.original.id}`)}>
         <EyeIcon /> Виж
        </Button>
      ),
    },
  ];

  if (loading) return <LoadingScreen />;

  return (
    <div className="container mx-auto">
      <BasicHeader title="Кредитни известия" subtitle={"Всичко нужно за твоите кредитни известия"} />
      <DataTable columns={columns} data={creditNotes} searchKey="creditNoteNumber" />
    </div>
  );
} 
