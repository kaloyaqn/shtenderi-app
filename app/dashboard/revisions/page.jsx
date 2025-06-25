"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function RevisionsListPage() {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRevisions = async () => {
      const res = await fetch('/api/revisions');
      const data = await res.json();
      setRevisions(data);
      setLoading(false);
    };
    fetchRevisions();
  }, []);

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Ревизии</h1>
      {loading ? (
        <div>Зареждане...</div>
      ) : (
        <table className="w-full border rounded">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 text-left">Щанд</th>
              <th className="p-2 text-left">Партньор</th>
              <th className="p-2 text-left">Потребител</th>
              <th className="p-2 text-left">Дата</th>
              <th className="p-2 text-left">Липсващи продукти</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {revisions.map(rev => (
              <tr key={rev.id}>
                <td className="p-2">{rev.stand?.name || '-'}</td>
                <td className="p-2">{rev.partner?.name || '-'}</td>
                <td className="p-2">{rev.user?.name || rev.user?.email || '-'}</td>
                <td className="p-2">{new Date(rev.createdAt).toLocaleString()}</td>
                <td className="p-2">{rev.missingProducts?.length || 0}</td>
                <td className="p-2 text-right">
                  <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/revisions/${rev.id}`)}>Виж</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 