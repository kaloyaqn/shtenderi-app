"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';

export default function RevisionDetailPage() {
  const params = useParams();
  const { revisionId } = params;
  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRevision = async () => {
      const res = await fetch(`/api/revisions/${revisionId}`);
      const data = await res.json();
      setRevision(data);
      setLoading(false);
    };
    fetchRevision();
  }, [revisionId]);

  if (loading) return <div>Зареждане...</div>;
  if (!revision) return <div>Ревизията не е намерена.</div>;

  const columns = [
    {
      accessorKey: 'name',
      header: 'Име',
      cell: ({ row }) => row.original.product?.name || '-',
    },
    {
      accessorKey: 'barcode',
      header: 'Баркод',
      cell: ({ row }) => row.original.product?.barcode || '-',
    },
    {
      accessorKey: 'missingQuantity',
      header: 'Брой',
      cell: ({ row }) => row.original.missingQuantity,
    },
  ];

  // Flatten data for DataTable
  const data = revision.missingProducts.map(mp => ({
    ...mp,
    name: mp.product?.name || '-',
    barcode: mp.product?.barcode || '-',
  }));

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">Детайли за ревизия</h1>
      <div className="mb-4">
        <b>Щанд:</b> {revision.stand?.name || '-'}<br/>
        <b>Партньор:</b> {revision.partner?.name || '-'}<br/>
        <b>Потребител:</b> {revision.user?.name || revision.user?.email || '-'}<br/>
        <b>Дата:</b> {new Date(revision.createdAt).toLocaleString()}<br/>
      </div>
      <h2 className="text-lg font-semibold mb-2">Липсващи продукти</h2>
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        filterableColumns={[
          { id: 'name', title: 'Име' },
          { id: 'barcode', title: 'Баркод' },
        ]}
      />
      <div className="flex gap-2 mt-6">
        <Button variant="outline" onClick={() => router.push(`/dashboard/revisions/${revisionId}/edit`)}>Редактирай</Button>
        <Button variant="ghost" onClick={() => router.push('/dashboard/revisions')}>Назад</Button>
      </div>
    </div>
  );
} 