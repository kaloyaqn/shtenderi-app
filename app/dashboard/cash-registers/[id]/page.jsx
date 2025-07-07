'use client'

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import BasicHeader from '@/components/BasicHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import LoadingScreen from '@/components/LoadingScreen';
import { Button } from '@/components/ui/button';

export default function CashRegisterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [register, setRegister] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const regRes = await fetch(`/api/cash-registers?id=${id}`);
        const regData = await regRes.json();
        setRegister(regData);
        // Fetch payments for this cash register
        const payRes = await fetch(`/api/payments?cashRegisterId=${id}`);
        const payData = await payRes.json();
        setPayments(Array.isArray(payData) ? payData : []);
      } catch {
        setError('Грешка при зареждане на данни');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (error) return <div className="text-red-500 p-8">{error}</div>;
  if (!register) return <div className="p-8">Касата не е намерена.</div>;

  return (
    <div className="container mx-auto py-10">
      <BasicHeader title={`Каса: ${register.name || '-'}`} subtitle={`Склад: ${register.storage?.name || '-'}`} hasBackButton />
      <Card className="max-w-lg mx-auto mb-8">
        <CardHeader>
          <CardTitle>Детайли за каса</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2"><b>Име:</b> {register.name}</div>
          <div className="mb-2"><b>Склад:</b> {register.storage?.name || '-'}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Плащания през тази каса</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Сума</th>
                  <th className="p-2 border">Метод</th>
                  <th className="p-2 border">Фактура</th>
                  <th className="p-2 border">Дата</th>
                  <th className="p-2 border"></th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td className="p-2 border">{p.amount.toFixed(2)} лв.</td>
                    <td className="p-2 border">{p.method === 'CASH' ? 'В брой' : 'Банка'}</td>
                    <td className="p-2 border">{p.invoice?.invoiceNumber || '-'}</td>
                    <td className="p-2 border">{new Date(p.createdAt).toLocaleString('bg-BG')}</td>
                    <td className="p-2 border">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/payments/${p.id}`)}>Детайли</Button>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={5} className="p-2 border text-center text-gray-400">Няма плащания</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 