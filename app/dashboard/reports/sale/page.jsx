"use client";

import BasicHeader from "@/components/BasicHeader";
import LoadingScreen from "@/components/LoadingScreen";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import TableLink from "@/components/ui/table-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Combobox } from "@/components/ui/combobox";
import { Filter, X } from "lucide-react";
import { useQueryState } from "nuqs";
import useSWR from "swr";
import { multiFetcher } from "@/lib/utils";
import { useProductFilter } from "@/hooks/use-product-filter";

export default function SalesReport() {
  const [dateFrom, setDateFrom] = useQueryState("dateFrom");
  const [dateTo, setDateTo] = useQueryState("dateTo");
  const [partnerId, setPartnerId] = useQueryState("partnerId");
  const [barcode, setBarcode] = useQueryState("barcode");
  const [productName, setProductName] = useQueryState("productName");
  const [productPcode, setProductPcode] = useQueryState("pcode");
  const [isFilterOpen, setIsFilterOpen] = useQueryState("filters", {
    defaultValue: false,
    parse: (v) => v === "1",
    serialize: (v) => (v ? "1" : null),
  });

  const { productInputRef, openProductPicker } = useProductFilter({
    onProductSelect: (product) => {
      setProductName(product?.name || null);
      setProductPcode(product?.pcode || null);
      setIsFilterOpen(false);
    },
    onShortcut: () => setIsFilterOpen(true),
  });

  const query = new URLSearchParams();
  if (dateFrom) query.set("dateFrom", dateFrom);
  if (dateTo) query.set("dateTo", dateTo);
  if (partnerId) query.set("partnerId", partnerId);
  if (barcode) query.set("barcode", barcode);
  if (productName) query.set("productName", productName);
  if (productPcode) query.set("pcode", productPcode);

  const { data, isLoading } = useSWR(
    [
      `/api/reports/sales${query.toString() ? `?${query.toString()}` : ""}`,
      "/api/partners",
    ],
    multiFetcher
  );

  const salesData = data?.[0] || {};
  const partners = data?.[1] || [];

  const sales = [
    ...(salesData.missingProducts || []),
    ...(salesData.refundProducts || []),
  ];

  const columns = [
    {
      id: "typeAndSource",
      header: "Тип",
      cell: ({ row }) => {
        const type = row.original.type;
        const revisionType = row.original.revision?.type;
        return (
          <div className="flex flex-col gap-1">
            <Badge variant={type === "missing" ? "success" : "destructive"}>
              {type === "missing" ? "Продаден" : "Върнат"}
            </Badge>
            {revisionType && (
              <Badge
                className={`px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 border ${
                  revisionType === "import"
                    ? "border-blue-400 text-blue-700"
                    : "border-gray-300 text-gray-600"
                }`}
              >
                {revisionType === "import" ? "Импорт" : "Продажба"}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "revision.createdAt",
      header: "Дата",
      cell: ({ row }) => {
        const date =
          row.original.type === "missing"
            ? row.original.revision?.createdAt
            : row.original.refund?.createdAt;
        return date ? new Date(date).toLocaleString() : "-";
      },
    },
    {
      accessorKey: "partner",
      header: "Партньор",
      cell: ({ row }) => {
        let partner = null;
        if (row.original.type === "missing") {
          partner = row.original.revision?.partner;
        } else if (row.original.type === "refund") {
          partner = row.original.partner;
        }
        return partner?.id ? (
          <TableLink href={`/dashboard/partners/${partner.id}`}>
            {partner.name}
          </TableLink>
        ) : (
          "-"
        );
      },
    },
    {
      accessorKey: "product.name",
      header: "Продукт",
      cell: ({ row }) => {
        const p = row.original.product;
        return (
          <div className="flex flex-col max-w-[220px]">
            <span className="truncate font-medium text-sm">{p?.name || "-"}</span>
            <span className="text-[11px] text-muted-foreground truncate">
              {p?.barcode || "-"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "missingQuantity",
      header: "Бр.",
      cell: ({ row }) => {
        if (!row.original) return "-";
        if (row.original.type === "missing") {
          return row.original.missingQuantity || 0;
        } else {
          return row.original.quantity || 0;
        }
      },
    },
    {
      accessorKey: "deliveryPrice",
      header: "Дост. (ср. лв.)",
      cell: ({ row }) => {
        const unitDelivery = row.original.product?.deliveryPrice || 0;
        const qty =
          row.original.type === "missing"
            ? row.original.missingQuantity || 0
            : row.original.quantity || 0;
        const totalDelivery = unitDelivery * qty;
        return `${totalDelivery.toFixed(2)} лв.`;
      },
    },
    {
      accessorKey: "revision.priceAtSale",
      header: "Продажна",
      cell: ({ row }) => {
        let price;
        if (row.original.type === "missing") {
          price = row.original.priceAtSale;
        } else {
          price = row.original.priceAtRefund;
        }
        if (!price && row.original.product && row.original.product.clientPrice) {
          price = row.original.product.clientPrice;
        }
        const qty =
          row.original.type === "missing"
            ? row.original.missingQuantity || 0
            : row.original.quantity || 0;
        const totalClient = (price || 0) * qty;
        return price !== undefined ? `${totalClient.toFixed(2)} лв.` : "-";
      },
    },
    {
      accessorKey: "revision.number",
      header: "№ прод.",
      cell: ({ row }) => {
        return row.original.revision ? (
          <TableLink href={`/dashboard/revisions/${row.original.revision.id}`}>
            {row.original.revision.number}
          </TableLink>
        ) : (
          "-"
        );
      },
    },
    {
      accessorKey: "invoice",
      header: "Фактура",
      cell: ({ row }) => {
        return row.original.invoice ? (
          <TableLink href={`/dashboard/revisions/${row.original?.invoice?.id}`}>
            {row.original?.invoice?.invoiceNumber}
          </TableLink>
        ) : (
          "-"
        );
      },
    },
  ];

  return (
    <>
      <BasicHeader title="Справка продажба" subtitle="Закупено - върнато">
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter /> Филтри
            </Button>
          </PopoverTrigger>
          <PopoverContent padding={0} sideOffset={0} className="w-sm">
            <div className="">
              <div className="w-full p-4 bg-gray-50 border-b border-b-gray-300 rounded-t-md">
                <h4 className="leading-none font-medium">Филтри</h4>
                <p className="text-muted-foreground text-sm ">
                  Избери филтрите
                </p>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="w-full grid gap-2">
                  <Label>Партньор</Label>
                  <Combobox
                    placeholder="Избери партньор"
                    onValueChange={(value) => setPartnerId(value)}
                    value={partnerId}
                    options={partners.map((partner) => ({
                      key: partner.id,
                      value: partner.id,
                      label: partner.name,
                    }))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="productQuery">Продукт</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="productQuery"
                      ref={productInputRef}
                      type="text"
                      placeholder="Филтър по продукт (Ctrl+K)"
                      value={productName || ""}
                      onChange={(e) => setProductName(e.target.value || null)}
                      className="min-w-[220px]"
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        openProductPicker(productName ? String(productName) : "")
                      }
                    >
                      Търси
                    </Button>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Ctrl/Cmd + K за избор от номенклатура
                  </span>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="productPcode">Продуктов код</Label>
                  <Input
                    id="productPcode"
                    type="text"
                    placeholder="Филтър по продуктов код"
                    value={productPcode || ""}
                    onChange={(e) => setProductPcode(e.target.value || null)}
                    className="min-w-[220px]"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="barcode">Баркод</Label>
                  <Input
                    id="barcode"
                    type="text"
                    placeholder="Баркод"
                    value={barcode || ""}
                    onChange={(e) => setBarcode(e.target.value || null)}
                  />
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

                <Button
                  className="mt-2 w-full"
                  variant="outline"
                  onClick={() => setIsFilterOpen(false)}
                >
                  <Filter /> Филтрирай
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => {
                      setDateFrom(null);
                      setDateTo(null);
                      setPartnerId(null);
                      setProductName(null);
                      setProductPcode(null);
                      setBarcode(null);
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
        <DataTable
          data={sales}
          columns={columns}
          initialSorting={[{ id: "revision.createdAt", desc: true }]}
          rowClassName={() =>
            "text-sm [&>td]:py-2 [&>td]:px-3 [&>td]:align-top"
          }
        />
      )}
    </>
  );
}
