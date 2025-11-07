"use client";
import { useEffect, useMemo, useState } from "react";
import BasicHeader from "@/components/BasicHeader";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
import { Eye } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";

export default function DeliveryPartnersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/delivery-partners').then(r => r.json()).then(data => setRows(Array.isArray(data) ? data : [])).finally(() => setLoading(false));
  }, []);

  const columns = useMemo(() => ([
    { accessorKey: 'name', header: 'Име' },
    { accessorKey: 'bulstat', header: 'Булстат' },
    { accessorKey: 'bankAccountBG', header: 'IBAN BG' },
    { accessorKey: 'bankAccountEUR', header: 'IBAN EUR' },
    {
      id: 'actions', header: 'Действия', cell: ({ row }) => (
        <Link href={`/dashboard/delivery-partners/${row.original.id}`}><Button variant="table"><Eye /> Виж</Button></Link>
      )
    },
  ]), []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="container mx-auto">
      <BasicHeader title="Доставчици" subtitle="Управление на доставчици за доставки">
      <Link href="/dashboard/delivery-partners/create"><Button>Нов доставчик</Button></Link>

      </BasicHeader>
      <DataTable columns={columns} data={rows} searchKey="name" />
    </div>
  );
}


