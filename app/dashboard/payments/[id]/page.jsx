'use client'

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import BasicHeader from '@/components/BasicHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import LoadingScreen from '@/components/LoadingScreen';

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/payments/${id}`);
        if (!res.ok) throw new Error('Failed to fetch payment');
        const data = await res.json();
        setPayment(data);
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
  if (!payment) return <div className="p-8">Плащането не е намерено.</div>;

  return (
    <div className="container mx-auto py-10">
      <BasicHeader title={`Плащане: ${payment.id}`} subtitle={payment.invoice ? `Фактура: ${payment.invoice.invoiceNumber}` : ''} hasBackButton />
      <Card className="max-w-lg mx-auto mb-8">
        <CardHeader>
          <CardTitle>Детайли за плащане</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2"><b>Сума:</b> {payment.amount.toFixed(2)} лв.</div>
          <div className="mb-2"><b>Метод:</b> {payment.method === 'CASH' ? 'В брой' : 'Банка'}</div>
          <div className="mb-2"><b>Каса:</b> {payment.cashRegister?.name || '-'}</div>
          <div className="mb-2"><b>Фактура:</b> {payment.invoice?.invoiceNumber || '-'}</div>
          <div className="mb-2"><b>Партньор:</b> {payment.invoice?.partnerName || '-'}</div>
          <div className="mb-2"><b>Дата:</b> {new Date(payment.createdAt).toLocaleString('bg-BG')}</div>
          <div className="mb-2"><b>Създадено от:</b> {payment.createdBy?.name || payment.createdBy?.email || '-'}</div>
        </CardContent>
      </Card>
    </div>
  );
} 