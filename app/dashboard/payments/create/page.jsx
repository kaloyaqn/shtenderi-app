import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BasicHeader from '@/components/BasicHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingScreen from '@/components/LoadingScreen';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

export default function PaymentCreatePage() {
  const [form, setForm] = useState({ invoiceId: '', amount: '', method: 'CASH', cashRegisterId: '' });
  const [invoices, setInvoices] = useState([]);
  const [cashRegisters, setCashRegisters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [invRes, regRes] = await Promise.all([
          fetch('/api/invoices'),
          fetch('/api/cash-registers'),
        ]);
        const invData = await invRes.json();
        const regData = await regRes.json();
        setInvoices(Array.isArray(invData) ? invData : []);
        setCashRegisters(Array.isArray(regData) ? regData : []);
      } catch {
        setError('Грешка при зареждане на данни');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleInvoiceChange = value => setForm(f => ({ ...f, invoiceId: value }));
  const handleMethodChange = value => setForm(f => ({ ...f, method: value, cashRegisterId: '' }));
  const handleCashRegisterChange = value => setForm(f => ({ ...f, cashRegisterId: value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: form.invoiceId,
          amount: parseFloat(form.amount),
          method: form.method,
          cashRegisterId: form.method === 'CASH' ? form.cashRegisterId : undefined,
        }),
      });
      if (!res.ok) throw new Error('Грешка при създаване');
      router.push('/dashboard/payments');
      router.refresh();
    } catch (err) {
      setError('Грешка при създаване');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="container mx-auto py-10">
      <BasicHeader title="Ново плащане" subtitle="Създай ново плащане." hasBackButton />
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Ново плащане</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Фактура</label>
              <Select value={form.invoiceId} onValueChange={handleInvoiceChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Изберете фактура" />
                </SelectTrigger>
                <SelectContent>
                  {invoices.map(inv => (
                    <SelectItem key={inv.id} value={inv.id}>№{inv.invoiceNumber} - {inv.partnerName} ({inv.totalValue.toFixed(2)} лв.)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1">Сума</label>
              <Input name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-1">Начин на плащане</label>
              <Select value={form.method} onValueChange={handleMethodChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Изберете метод" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">В брой</SelectItem>
                  <SelectItem value="BANK">По банка</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.method === 'CASH' && (
              <div>
                <label className="block mb-1">Каса</label>
                <Select value={form.cashRegisterId} onValueChange={handleCashRegisterChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Изберете каса" />
                  </SelectTrigger>
                  <SelectContent>
                    {cashRegisters.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>{saving ? 'Създаване...' : 'Създай'}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Отказ</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 