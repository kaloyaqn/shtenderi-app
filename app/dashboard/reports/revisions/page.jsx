"use client";

import BasicHeader from "@/components/BasicHeader";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, X } from "lucide-react";
import { useQueryState } from "nuqs";
import useSWR from "swr";
import LoadingScreen from "@/components/LoadingScreen";
import TableLink from "@/components/ui/table-link";
import { fetcher, multiFetcher } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";
import { useState } from "react";
import { useProductFilter } from "@/hooks/use-product-filter";

export default function RevisionNegativesReport() {
  const [dateFrom, setDateFrom] = useQueryState("dateFrom");
  const [dateTo, setDateTo] = useQueryState("dateTo");
  const [storageId, setStorageId] = useQueryState("storageId");
  const [userId, setUserId] = useQueryState("userId");
  const [productId, setProductId] = useQueryState("productId");
  const [productPcode, setProductPcode] = useQueryState("pcode");
  const [productSearch, setProductSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useQueryState("filters", {
    defaultValue: false,
    parse: (v) => v === "1",
    serialize: (v) => (v ? "1" : null),
  });

  const query = new URLSearchParams();
  if (dateFrom) query.set("dateFrom", dateFrom);
  if (dateTo) query.set("dateTo", dateTo);
  if (storageId) query.set("storageId", storageId);
  if (userId) query.set("userId", userId);
  if (productId) query.set("productId", productId);
  if (productPcode) query.set("pcode", productPcode);

  const { data, isLoading } = useSWR(
    [
      `/api/storage-revisions/list${query.toString() ? `?${query.toString()}` : ""}`,
      "/api/storages",
      "/api/users",
    ],
    multiFetcher
  );

  const revisions = data?.[0]?.revisions || [];
  const storages = data?.[1] || [];
  const users = data?.[2] || [];
  const { data: productResults = [] } = useSWR(
    productSearch.length > 1
      ? `/api/products/search?q=${encodeURIComponent(productSearch)}`
      : null,
    fetcher
  );
  const { productInputRef, openProductPicker } = useProductFilter({
    onProductSelect: (product) => {
      setProductId(product?.id || null);
      setProductPcode(null);
      setIsFilterOpen(false);
    },
    onShortcut: () => setIsFilterOpen(true),
  });

  // Flatten negative changes
  const rows = revisions.flatMap((rev) =>
    (rev.products || [])
      .filter((p) => (p.checkedQuantity - p.originalQuantity) < 0)
      .map((p) => ({
        id: `${rev.id}-${p.id}`,
        revisionId: rev.id,
        productId: p.product?.id,
        productName: p.product?.name || "-",
        barcode: p.product?.barcode || "-",
        pcode: p.product?.pcode || p.pcode || "-",
        missing: Math.abs(p.checkedQuantity - p.originalQuantity),
        date: rev.createdAt,
        storageName: rev.storage?.name || "-",
        storageId: rev.storage?.id,
        userName: rev.user?.name || rev.user?.email || "-",
        userId: rev.user?.id,
      }))
  );

  const filteredRows = rows.filter((r) => {
    const matchesProduct = !productId || r.productId === productId;
    const matchesPcode =
      !productPcode ||
      (r.pcode &&
        r.pcode.toString().toLowerCase().includes(productPcode.toLowerCase()));
    return matchesProduct && matchesPcode;
  });
  const totalMissing = filteredRows.reduce((sum, row) => sum + (row.missing || 0), 0);

  const columns = [
    {
      accessorKey: "productName",
      header: "Продукт",
      cell: ({ row }) => (
        <div className="flex flex-col max-w-[240px]">
          <span className="font-medium text-sm truncate">
            {row.original.productName}
          </span>
          <span className="text-[11px] text-muted-foreground truncate">
            {row.original.barcode}
          </span>
          <span className="text-[11px] text-muted-foreground truncate">
            {row.original.pcode}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: "Дата",
      cell: ({ row }) => (
        row.original.date ? (
          <TableLink href={`/dashboard/storage-revisions/${row.original.revisionId}`}>
            {new Date(row.original.date).toLocaleString("bg-BG")}
          </TableLink>
        ) : (
          "-"
        )
      ),
    },
    {
      accessorKey: "missing",
      header: "Липсващи бр.",
      cell: ({ row }) => (
        <span className="text-red-600 font-semibold">
          {row.original.missing}
        </span>
      ),
    },
    {
      accessorKey: "storageName",
      header: "Обект / Склад",
      cell: ({ row }) =>
        row.original.storageId ? (
          <TableLink href={`/dashboard/storage-revisions/${row.original.revisionId}`}>
            {row.original.storageName}
          </TableLink>
        ) : (
          row.original.storageName
        ),
    },
    {
      accessorKey: "userName",
      header: "Извършил",
      cell: ({ row }) => row.original.userName || "-",
    },
  ];

  return (
    <>
      <BasicHeader
        title="Справка ревизии (намаления)"
        subtitle="Негативни промени по складови ревизии"
      >
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter /> Филтри
            </Button>
          </PopoverTrigger>
          <PopoverContent padding={0} sideOffset={0} className="w-sm">
            <div>
              <div className="w-full p-4 bg-gray-50 border-b border-b-gray-300 rounded-t-md">
                <h4 className="leading-none font-medium">Филтри</h4>
                <p className="text-muted-foreground text-sm">
                  Избери филтрите
                </p>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label>Склад</Label>
                  <Combobox
                    placeholder="Всички складове"
                    value={storageId || ""}
                    onValueChange={(val) => setStorageId(val || null)}
                    options={[
                      { key: "ALL", value: "", label: "Всички складове" },
                      ...storages.map((s) => ({
                        key: s.id,
                        value: s.id,
                        label: s.name,
                      })),
                    ]}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Потребител</Label>
                  <Combobox
                    placeholder="Всички потребители"
                    value={userId || ""}
                    onValueChange={(val) => setUserId(val || null)}
                    options={[
                      { key: "ALL", value: "", label: "Всички потребители" },
                      ...users.map((u) => ({
                        key: u.id,
                        value: u.id,
                        label: u.name || u.email || u.id,
                      })),
                    ]}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Продукт</Label>
                  <Combobox
                    placeholder="Избери продукт"
                    value={productId || ""}
                    onValueChange={(val) => {
                      setProductId(val || null);
                      if (val) setProductPcode(null);
                    }}
                    onSearchChange={(val) => setProductSearch(val)}
                    options={[
                      ...(productResults || []).map((p) => ({
                        key: p.id,
                        value: p.id,
                        label: `${p.name || "-"} ${p.pcode ? `— ${p.pcode}` : ""}`,
                        searchValue: `${p.name} ${p.pcode || ""} ${p.barcode || ""}`,
                      })),
                    ]}
                    emptyText="Потърси по име, pcode или баркод (мин. 2 символа)"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="productPcode">Продуктов код</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="productPcode"
                      ref={productInputRef}
                      type="text"
                      placeholder="Филтър по продуктов код (Ctrl+K)"
                      value={productPcode || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProductPcode(val || null);
                        if (val) setProductId(null);
                      }}
                      className="min-w-[220px]"
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        openProductPicker(
                          productPcode ? String(productPcode) : ""
                        )
                      }
                    >
                      Търси
                    </Button>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Ctrl/Cmd + K за избор от номенклатура
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="grid gap-2 w-full">
                    <Label htmlFor="dateFrom">Дата от</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={dateFrom || ""}
                      onChange={(e) => setDateFrom(e.target.value || null)}
                    />
                  </div>
                  <div className="grid gap-2 w-full">
                    <Label htmlFor="dateTo">Дата до</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={dateTo || ""}
                      onChange={(e) => setDateTo(e.target.value || null)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    <Filter /> Филтрирай
                  </Button>
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => {
                      setDateFrom(null);
                      setDateTo(null);
                      setStorageId(null);
                      setUserId(null);
                      setProductId(null);
                      setProductPcode(null);
                    }}
                  >
                    <X /> Изчисти
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </BasicHeader>

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <div className="mb-4 rounded-md border bg-muted/30 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Общо липсващи бр.</span>
            <span className="font-semibold text-red-600">{totalMissing}</span>
          </div>
          <DataTable
            data={filteredRows}
            columns={columns}
            initialSorting={[{ id: "date", desc: true }]}
            rowClassName={() =>
              "text-sm [&>td]:py-2 [&>td]:px-3 [&>td]:align-top"
            }
          />
        </>
      )}
    </>
  );
}

function SelectLike({
  options = [],
  value,
  onChange,
  labelAccessor = "name",
  fallbackAccessor,
}) {
  return (
    <select
      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      value={value || ""}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">Всички</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt[labelAccessor] || (fallbackAccessor ? opt[fallbackAccessor] : opt.id)}
        </option>
      ))}
    </select>
  );
}
