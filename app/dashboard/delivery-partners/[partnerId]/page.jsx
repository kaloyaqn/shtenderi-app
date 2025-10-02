"use client";
import { useEffect, useState } from "react";
import BasicHeader from "@/components/BasicHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PartnerDetailPage() {
  const { partnerId } = useParams();
  const router = useRouter();
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!partnerId) return;
    fetch(`/api/delivery-partners/${partnerId}`).then(r => r.json()).then(setForm);
  }, [partnerId]);

  const save = async () => {
    try {
      const res = await fetch(`/api/delivery-partners/${partnerId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      toast.success('Записано');
    } catch { toast.error('Грешка при запис'); }
  };

  if (!form) return null;

  return (
    <div className="container mx-auto">
      <BasicHeader title={`Доставчик: ${form.name}`} subtitle="Редакция" />
      <Card>
        <CardContent className="p-4 space-y-2">
          <Input placeholder="Име" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Булстат" value={form.bulstat || ''} onChange={(e) => setForm({ ...form, bulstat: e.target.value })} />
          <Input placeholder="Банкова сметка BG" value={form.bankAccountBG || ''} onChange={(e) => setForm({ ...form, bankAccountBG: e.target.value })} />
          <Input placeholder="Банкова сметка EUR" value={form.bankAccountEUR || ''} onChange={(e) => setForm({ ...form, bankAccountEUR: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={save}>Запази</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


