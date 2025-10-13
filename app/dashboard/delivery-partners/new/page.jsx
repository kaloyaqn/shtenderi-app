"use client";
import BasicHeader from "@/components/BasicHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PartnerNewPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", bulstat: "", bankAccountBG: "", bankAccountEUR: "" });

  const submit = async () => {
    try {
      const res = await fetch('/api/delivery-partners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      const p = await res.json();
      toast.success('Създаден доставчик');
      router.push(`/dashboard/delivery-partners/${p.id}`);
    } catch {
      toast.error('Грешка при създаване');
    }
  };

  return (
    <div className="container mx-auto">
      <BasicHeader title="Нов доставчик" subtitle="Създаване на доставчик" />
      <Card>
        <CardContent className="p-4 space-y-2">
          <Input placeholder="Име" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Булстат" value={form.bulstat} onChange={(e) => setForm({ ...form, bulstat: e.target.value })} />
          <Input placeholder="Банкова сметка BG" value={form.bankAccountBG} onChange={(e) => setForm({ ...form, bankAccountBG: e.target.value })} />
          <Input placeholder="Банкова сметка EUR" value={form.bankAccountEUR} onChange={(e) => setForm({ ...form, bankAccountEUR: e.target.value })} />
          <Button onClick={submit}>Създай</Button>
        </CardContent>
      </Card>
    </div>
  );
}


