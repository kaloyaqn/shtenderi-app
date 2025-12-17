"use client";

import BasicHeader from "@/components/BasicHeader";
import { fetcher } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Filter, X } from "lucide-react";
import { useQueryState } from "nuqs";

import useSWR from "swr";
import { useState } from "react";
import { useProductFilter } from "@/hooks/use-product-filter";
import LoadingScreen from "@/components/LoadingScreen";

export default function ChannelReport() {
  const [dateFrom, setDateFrom] = useQueryState("dateFrom");
  const [dateTo, setDateTo] = useQueryState("dateTo");
  const [productQuery, setProductQuery] = useQueryState("product");
  const [productPcode, setProductPcode] = useQueryState("pcode");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { productInputRef, openProductPicker } = useProductFilter({
    onProductSelect: (product) => {
      setProductQuery(product?.name || null);
      setProductPcode(product?.pcode || null);
      setIsFilterOpen(false);
    },
    onShortcut: () => setIsFilterOpen(true),
  });

  const query = new URLSearchParams();
  if (dateFrom) query.set("dateFrom", dateFrom);
  if (dateTo) query.set("dateTo", dateTo);
  if (productQuery) query.set("product", productQuery);
  if (productPcode) query.set("pcode", productPcode);

  const { data, isLoading } = useSWR(
    `/api/reports/channel${query.toString() ? `?${query.toString()}` : ""}`,
    fetcher
  );

  // if (isLoading || !data) return <div className="p-4">Зареждане...</div>;

  const products = data?.products ?? [];

  const channelSet = new Set();

  products.forEach((product) => {
    product.stores.forEach((store) => {
      if (store.channelName) channelSet.add(store.channelName);
    });
  });

  const channels = Array.from(channelSet);

  const safeChannels = channels.map((ch) => ({
    label: ch,
    key: ch.replace(/\s+/g, "_").toLowerCase(), // safe key (no spaces)
  }));

  // -------------------------------------------------
  // 2) Define columns with Tooltip per channel
  // -------------------------------------------------
  const columns = [
    {
      accessorKey: "productName",
      header: "Продукт",
    },
    {
      accessorKey: "totalAllSegments",
      header: "Общо (всички сегменти)",
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.totalAllSegments}</span>
      ),
    },

    ...safeChannels.map((ch) => ({
      accessorKey: ch.key,
      header: ch.label,

      cell: ({ row }) => {
        const qty = row.original[ch.key];
        const productName = row.original.productName;
        const stores = row.original.stores || [];

        const storesForChannel = stores.filter(
          (s) => s.channelName === ch.label
        );

        const [open, setOpen] = useState(false);

        // If no qty in this channel, you can either show 0 or "-"
        if (!qty) {
          return <span className="text-muted-foreground">0</span>;
        }

        return (
          <TooltipProvider delayDuration={200}>
            <Tooltip open={open} onOpenChange={setOpen}>
              <TooltipTrigger asChild>
                <span className="underline decoration-dotted cursor-pointer">
                  {qty}
                </span>
              </TooltipTrigger>

              <TooltipContent side="top" className="min-w-[260px]">
                <div className="font-semibold mb-1">{productName}</div>
                <div className="text-xs text-muted-foreground mb-1">
                  Канал: {ch.label}
                </div>

                {storesForChannel.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Няма продажби в този канал
                  </div>
                ) : (
                  <ul className="text-sm space-y-1">
                    {storesForChannel.map((s) => (
                      <li key={s.storeId} className="flex justify-between">
                        <span>{s.storeName}</span>
                        <span className="font-mono">{s.qty}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    })),
  ];

  // -------------------------------------------------
  // 3) Build rows: per product, per channel total
  // -------------------------------------------------
  const rows = products.map((product) => {
    const row = {
      productName: product.productName,
      stores: product.stores, // keep all stores for this product
      totalAllSegments: product.totalAllSegments ?? 0,
    };

    // Initialize each channel's qty to 0
    safeChannels.forEach((ch) => {
      row[ch.key] = 0;
    });

    // For each store, add its qty into its channel column
    product.stores.forEach((store) => {
      const safeKey = store.channelName.replace(/\s+/g, "_").toLowerCase();
      if (row[safeKey] !== undefined) {
        row[safeKey] += store.qty;
      }
    });

    return row;
  });

  return (
    <>
      <BasicHeader
        title="Справка на успеха"
        subtitle="Направи справка на успеха"
      >
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
                <div className="grid gap-2">
                  <Label htmlFor="productQuery">Продукт</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="productQuery"
                      ref={productInputRef}
                      type="text"
                      placeholder="Филтър по продукт (Ctrl+K)"
                      value={productQuery || ""}
                      onChange={(e) => setProductQuery(e.target.value || null)}
                      className="min-w-[220px]"
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        openProductPicker(
                          productQuery ? String(productQuery) : ""
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
                      setProductQuery(null);
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

      <div className="">
        {isLoading || !data ? (
          <LoadingScreen />
        ) : (
          <DataTable data={rows} columns={columns} />
        )}
      </div>
    </>
  );
}
