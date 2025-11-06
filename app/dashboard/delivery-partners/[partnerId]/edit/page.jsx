"use client";

import { useEffect, useState } from "react";
import BasicHeader from "@/components/BasicHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DeliveryPartnerEditPage() {
  const { partnerId } = useParams();
  const router = useRouter();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!partnerId) return;
    fetch(`/api/delivery-partners/${partnerId}`).then(r => r.json()).then(setForm);
  }, [partnerId]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/delivery-partners/${partnerId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const j = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(j?.error || 'Грешка при запис');
      toast.success('Записано');
      router.push(`/dashboard/delivery-partners/${partnerId}`);
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (!form) return null;

  return (
    <div className="container mx-auto">
      <BasicHeader title={`Доставчик: ${form.name}`} subtitle="Редакция" />
      <Card>
        <CardContent className="p-4 space-y-2">
          <Input placeholder="Име" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Булстат" value={form.bulstat || ''} onChange={(e) => setForm({ ...form, bulstat: e.target.value })} />
          <Input placeholder="Лице за контакт" value={form.contactPerson || ''} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
          <Input placeholder="Имейл" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Телефон" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input placeholder="Адрес" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input placeholder="Държава" value={form.country || ''} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            <Input placeholder="Град" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <Input placeholder="МОЛ" value={form.mol || ''} onChange={(e) => setForm({ ...form, mol: e.target.value })} />
          <Input placeholder="Банкова сметка BG" value={form.bankAccountBG || ''} onChange={(e) => setForm({ ...form, bankAccountBG: e.target.value })} />
          <Input placeholder="Банкова сметка EUR" value={form.bankAccountEUR || ''} onChange={(e) => setForm({ ...form, bankAccountEUR: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>{saving ? 'Запис...' : 'Запази'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


