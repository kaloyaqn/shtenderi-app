"use client";

import BasicHeader from "@/components/BasicHeader";
import { fetcher } from "@/lib/utils";

import useSWR from "swr";
import { useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTable } from "@/components/ui/data-table";

export default function ChannelReport() {
  const { data, isLoading } = useSWR(`/api/reports/channel`, fetcher);

  if (isLoading || !data) return <div className="p-4">Зареждане...</div>;

  const products = data.products;

  // -------------------------------------------------
  // 1) Collect unique channels from API response
  // -------------------------------------------------
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

    ...safeChannels.map((ch) => ({
      accessorKey: ch.key,
      header: ch.label,

      cell: ({ row }) => {
        const qty = row.original[ch.key]; // total qty for this product in this channel
        const productName = row.original.productName;
        const stores = row.original.stores || [];

        // 💡 Only stores from THIS channel
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
      />

      <div className="p-4">
        <DataTable data={rows} columns={columns} />
      </div>
    </>
  );
}
