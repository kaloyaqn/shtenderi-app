"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import TableLink from "@/components/ui/table-link";
import { Eye, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BasicHeader from "@/components/BasicHeader";
import LoadingScreen from "@/components/LoadingScreen";

export default function RefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      fetch("/api/refunds")
        .then((res) => {
          if (!res.ok) {
            if (res.status === 401) toast.error("Моля, влезте в системата.");
            else toast.error("Грешка при зареждане на рекламации.");
            return Promise.reject(new Error("Failed to fetch"));
          }
          return res.json();
        })
        .then(setRefunds)
        .catch((err) => console.error("Fetch error:", err))
        .finally(() => setLoading(false));
    }
  }, [session]);

  const columns = [
    {
      accessorKey: "id",
      header: "id",
    },
    {
      accessorKey: "createdAt",
      header: "Дата",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString("bg-BG"),
    },
    {
      accessorKey: "user",
      header: "Потребител",
      cell: ({ row }) => row.original.user?.name || row.original.user?.email || "-",
    },
    {
      accessorKey: "sourceType",
      header: "Източник",
      cell: ({ row }) => {
        const { sourceType, sourceId, sourceName } = row.original;
        let href = "#";
        if (sourceType === "STAND") href = `/dashboard/stands/${sourceId}`;
        else if (sourceType === "STORAGE") href = `/dashboard/storages/${sourceId}`;
        return (
          <span>
            {sourceType}
            <br />
            <TableLink href={href} className="text-blue-600 hover:underline text-xs">
              {sourceName}
            </TableLink>
          </span>
        );
      },
    },
    {
      accessorKey: "refundProducts",
      header: "Продукти",
      cell: ({ row }) => (
        <ul className="list-disc pl-4">
          {/* {row.original.refundProducts.map((rp) => (
            <li key={rp.id}>
              {rp.product?.name || "-"} <span className="text-xs text-gray-500">({rp.product?.barcode || "-"})</span> — <b>{rp.quantity}</b> бр.
            </li>
          ))} */}

          <Badge variant="outline">
          {row.original.refundProducts.length} бр.
          </Badge>
        </ul>
      ),
    },
    {
      id: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <Link href={`/dashboard/refunds/${row.original.id}`} className="">
          <Button  variant='table'>
            <Eye /> Виж
          </Button>
        </Link>
      ),
    },
  ];

  if (loading) return <LoadingScreen />;

  const userIsAdmin = session?.user?.role === 'ADMIN';

  if (!loading && refunds.length === 0 && !userIsAdmin) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-3xl font-bold mb-6">Върщания и рекламации</h1>
        <p>Нямате рекламации от зачислените Ви щандове или складове.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <BasicHeader title="Връщания и рекламации" subtitle="Управление на продажби и зареждане на стока"/>
      <DataTable columns={columns} data={refunds} searchKey="user.email" />
    </div>
  );
} 