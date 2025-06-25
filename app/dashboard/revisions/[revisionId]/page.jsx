"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

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

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Детайли за ревизия</h1>
      <div className="mb-4">
        <b>Щанд:</b> {revision.stand?.name || '-'}<br/>
        <b>Партньор:</b> {revision.partner?.name || '-'}<br/>
        <b>Потребител:</b> {revision.user?.name || revision.user?.email || '-'}<br/>
        <b>Дата:</b> {new Date(revision.createdAt).toLocaleString()}<br/>
      </div>
      <h2 className="text-lg font-semibold mb-2">Липсващи продукти</h2>
      <table className="w-full border rounded mb-6">
        <thead>
          <tr className="bg-muted">
            <th className="p-2 text-left">Име</th>
            <th className="p-2 text-left">Баркод</th>
            <th className="p-2 text-left">Брой</th>
          </tr>
        </thead>
        <tbody>
          {revision.missingProducts.map(mp => (
            <tr key={mp.id}>
              <td className="p-2">{mp.product?.name || '-'}</td>
              <td className="p-2">{mp.product?.barcode || '-'}</td>
              <td className="p-2">{mp.missingQuantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button variant="outline" onClick={() => router.push(`/dashboard/revisions/${revisionId}/edit`)}>Редактирай</Button>
      <Button variant="ghost" className="ml-2" onClick={() => router.push('/dashboard/revisions')}>Назад</Button>
    </div>
  );
} 