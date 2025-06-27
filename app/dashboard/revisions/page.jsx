"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';

export default function RevisionsListPage() {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRevisions = async () => {
      const res = await fetch('/api/revisions');
      let data = await res.json();
      // Flatten for DataTable
      data = data.map(rev => ({
        ...rev,
        standName: rev.stand?.name || '-',
        partnerName: rev.partner?.name || '-',
        userName: rev.user?.name || rev.user?.email || '-',
      }));
      console.log('Fetched revisions:', data); // DEBUG LOG
      setRevisions(data);
      setLoading(false);
    };
    fetchRevisions();
  }, []);

  const columns = [
    {
      accessorKey: 'standName',
      header: 'Щанд',
      cell: ({ row }) => (
        <a
          href={`/dashboard/stands/${row.original.stand?.id}`}
          className="text-blue-600 underline hover:text-blue-800"
        >
          {row.original.standName}
        </a>
      ),
    },
    {
      accessorKey: 'partnerName',
      header: 'Партньор',
    },
    {
      accessorKey: 'userName',
      header: 'Потребител',
    },
    {
      accessorKey: 'createdAt',
      header: 'Дата',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      accessorKey: 'missingProducts',
      header: 'Липсващи продукти',
      cell: ({ row }) => row.original.missingProducts?.length || 0,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/revisions/${row.original.id}`)}>
          Виж
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Продажби</h1>
      </div>
      <DataTable
        columns={columns}
        data={revisions}
        searchKey="standName"
        filterableColumns={[
          { id: 'standName', title: 'Щанд' },
          { id: 'partnerName', title: 'Партньор' },
          { id: 'userName', title: 'Потребител' },
        ]}
      />
    </div>
  );
} 