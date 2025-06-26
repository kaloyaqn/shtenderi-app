"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { PrintableRevision } from './_components/printable-revision';

export default function RevisionDetailPage() {
  const params = useParams();
  const { revisionId } = params;
  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

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
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Детайли за ревизия</h1>
        <Button onClick={handlePrint}>Принтирай</Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {/* Render the printable component but keep it visually hidden */}
        <div style={{ display: 'none' }}>
            <PrintableRevision ref={componentRef} revision={revision} />
        </div>

        <div className="space-y-4">
            <div><strong>Щанд:</strong> {revision.stand?.name || 'N/A'}</div>
            <div><strong>Магазин:</strong> {revision.stand?.store?.name || 'N/A'}</div>
            <div><strong>Партньор:</strong> {revision.partner?.name || 'N/A'}</div>
            <div><strong>Ревизор:</strong> {revision.user?.name || revision.user?.email || 'N/a'}</div>
            <div><strong>Дата:</strong> {new Date(revision.createdAt).toLocaleString('bg-BG')}</div>
        </div>

        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Липсващи продукти:</h2>
            {revision.missingProducts?.length > 0 ? (
            <ul className="space-y-2">
                {revision.missingProducts.map((mp) => (
                <li key={mp.id} className="p-3 bg-red-50 rounded-md">
                    <div className="font-semibold">{mp.product?.name} ({mp.product?.barcode})</div>
                    <div className="text-sm text-red-700">Липсващи: {mp.missingQuantity}</div>
                </li>
                ))}
            </ul>
            ) : (
            <p>Няма регистрирани липси.</p>
            )}
        </div>

      </div>

      <div className="flex gap-2 mt-6">
        <Button variant="outline" onClick={() => router.push(`/dashboard/revisions/${revisionId}/edit`)}>Редактирай</Button>
        <Button variant="ghost" onClick={() => router.push('/dashboard/revisions')}>Назад</Button>
      </div>
    </div>
  );
} 