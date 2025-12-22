"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import BasicHeader from "@/components/BasicHeader";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import LoadingScreen from "@/components/LoadingScreen";
import { fetcher } from "@/lib/utils";

export default function MinQuantityReport() {
  const [storageId, setStorageId] = useState("");
  const { data: storages = [] } = useSWR("/api/storages", fetcher);

  const { data, isLoading } = useSWR(
    storageId ? `/api/reports/min-quantity?storageId=${storageId}` : null,
    fetcher
  );

  const rows = Array.isArray(data) ? data : [];

  const totals = useMemo(() => {
    const below = rows.filter((r) => (r.quantity || 0) < (r.minQty || 0));
    return {
      count: rows.length,
      belowCount: below.length,
    };
  }, [rows]);

  const columns = [
    { accessorKey: "pcode", header: "PCODE" },
    { accessorKey: "barcode", header: "EAN" },
    { accessorKey: "name", header: "Продукт" },
    { accessorKey: "minQty", header: "Мин." },
    { accessorKey: "quantity", header: "Наличност" },
    {
      accessorKey: "diff",
      header: "Разлика",
      cell: ({ row }) => {
        const diff = row.original.diff;
        const cls =
          diff < 0
            ? "text-red-600 font-semibold"
            : diff === 0
            ? "text-amber-600 font-semibold"
            : "text-green-600";
        return <span className={cls}>{diff}</span>;
      },
    },
  ];

  if (isLoading && storageId) return <LoadingScreen />;

  return (
    <div className="container mx-auto">
      <BasicHeader title="Минимални количества" subtitle="Продукти под или около минималното количество" />

      <div className="mb-4 space-y-2 max-w-md">
        <Label>Склад</Label>
        <Combobox
          options={(storages || []).map((s) => ({ value: s.id, label: s.name || s.id }))}
          value={storageId}
          onValueChange={(val) => setStorageId(val)}
          placeholder="Избери склад"
          searchPlaceholder="Търси склад..."
        />
      </div>

      {!storageId ? (
        <div className="text-sm text-gray-600">Изберете склад, за да видите данни.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="border rounded-lg p-3 bg-white">
              <div className="text-gray-500">Редове</div>
              <div className="text-lg font-semibold">{totals.count}</div>
            </div>
            <div className="border rounded-lg p-3 bg-white">
              <div className="text-gray-500">Под минимум</div>
              <div className="text-lg font-semibold">{totals.belowCount}</div>
            </div>
          </div>

          <DataTable columns={columns} data={rows} searchKey="name" />
        </>
      )}
    </div>
  );
}
