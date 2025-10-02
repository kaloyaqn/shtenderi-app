"use client";
import { useEffect, useMemo, useState } from "react";
import BasicHeader from "@/components/BasicHeader";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LoadingScreen from "@/components/LoadingScreen";
import { toast } from "sonner";

export default function DeliveriesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    try {
      const data = await fetch("/api/deliveries").then(r => r.json());
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Грешка при зареждане на доставки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const bgStatus = (s) => s === 'DRAFT' ? 'Чернова' : 'Приета';
  const bgPaid = (p) => p === 'PAID' ? 'Платена' : 'Неплатена';

  const columns = useMemo(() => ([
    { accessorKey: "number", header: "№" },
    { accessorKey: "createdAt", header: "Създадена", cell: ({ row }) => new Date(row.original.createdAt).toLocaleString('bg-BG') },
    { accessorKey: "acceptedAt", header: "Приета", cell: ({ row }) => row.original.acceptedAt ? new Date(row.original.acceptedAt).toLocaleString('bg-BG') : "-" },
    { accessorKey: "supplier.name", header: "Доставчик", cell: ({ row }) => row.original.supplier?.name || '-' },
    { accessorKey: "storage.name", header: "Склад", cell: ({ row }) => row.original.storage?.name || '-' },
    { id: "total", header: "Сума", cell: ({ row }) => {
      const sum = (row.original.products || []).reduce((acc, p) => acc + (Number(p.quantity||0) * Number(p.unitPrice||0)), 0);
      return `${sum.toFixed(2)} лв.`;
    } },
    { accessorKey: "status", header: "Статус", cell: ({ row }) => (
      <Badge className={row.original.status === 'DRAFT' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-green-100 text-green-800 border-green-200'}>
        {bgStatus(row.original.status)}
      </Badge>
    ) },
    { accessorKey: "paidStatus", header: "Плащане", cell: ({ row }) => (
      <Badge className={row.original.paidStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'}>
        {bgPaid(row.original.paidStatus)}
      </Badge>
    ) },
    {
      id: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <Link href={`/dashboard/deliveries/${row.original.id}`}>
          <Button variant="table"><Eye /> Виж</Button>
        </Link>
      ),
    },
  ]), []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="container mx-auto">
      <BasicHeader title="Доставки" subtitle="Управление на доставки">
      <Link href="/dashboard/deliveries/new"><Button>Нова доставка</Button></Link>

      </BasicHeader>
      <DataTable columns={columns} data={rows} searchKey="supplier.name" />
    </div>
  );
}


