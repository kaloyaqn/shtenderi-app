"use client";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/refunds")
      .then((res) => res.json())
      .then(setRefunds)
      .finally(() => setLoading(false));
  }, []);

  const columns = [
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
            <Link href={href} className="text-blue-600 hover:underline text-xs">
              {sourceName}
            </Link>
          </span>
        );
      },
    },
    {
      accessorKey: "refundProducts",
      header: "Продукти",
      cell: ({ row }) => (
        <ul className="list-disc pl-4">
          {row.original.refundProducts.map((rp) => (
            <li key={rp.id}>
              {rp.product?.name || "-"} <span className="text-xs text-gray-500">({rp.product?.barcode || "-"})</span> — <b>{rp.quantity}</b> бр.
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <Link href={`/dashboard/refunds/${row.original.id}`} className="">
          <Button variant='outline'>
            Виж
          </Button>
        </Link>
      ),
    },
  ];

  if (loading) return <div>Зареждане...</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Върщания и рекламации</h1>
      <DataTable columns={columns} data={refunds} searchKey="user.email" />
    </div>
  );
} 