  "use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import BasicHeader from "@/components/BasicHeader";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Filter, X } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import TableLink from "@/components/ui/table-link";
import { Combobox } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/lib/utils";

export default function UnpaidInvoicesReport() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [partnerId, setPartnerId] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [partners, setPartners] = useState([]);

  const query = new URLSearchParams();
  if (partnerId) query.set("partnerId", partnerId);
  else if (partnerName) query.set("partnerName", partnerName);
  if (dateFrom) query.set("dateFrom", dateFrom);
  if (dateTo) query.set("dateTo", dateTo);
  if (paymentMethod) query.set("paymentMethod", paymentMethod);

  const { data, isLoading } = useSWR(
    `/api/reports/unpaid-invoices${query.toString() ? `?${query.toString()}` : ""}`,
    fetcher
  );

  useEffect(() => {
    fetch("/api/partners")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        const opts = (data || []).map((p) => ({
          value: p.id,
          label: p.name || p.id,
        }));
        setPartners(opts);
      })
      .catch(() => {});
  }, []);

  const resetFilters = () => {
    setPartnerId("");
    setPartnerName("");
    setDateFrom("");
    setDateTo("");
    setPaymentMethod("");
  };

  const columns = [
    {
      accessorKey: "invoiceNumber",
      header: "№ фактура",
      cell: ({ row }) => (
        <TableLink href={`/dashboard/invoices/${row.original.id}`}>
          {row.original.invoiceNumber}
        </TableLink>
      ),
    },
    {
      accessorKey: "partnerName",
      header: "Партньор",
      cell: ({ row }) => row.original.partnerName || "-",
    },
    {
      accessorKey: "totalValue",
      header: "Сума",
      cell: ({ row }) => `${Number(row.original.totalValue || 0).toFixed(2)} лв.`,
    },
    {
      accessorKey: "paymentStatus",
      header: "Статус",
      cell: ({ row }) => {
        const status = row.original.paymentStatus || "UNPAID";
        const map = {
          PAID: { label: "Платена", variant: "success" },
          PARTIALLY_PAID: { label: "Частично", variant: "outline" },
          UNPAID: { label: "Неплатена", variant: "destructive" },
        };
        const info = map[status] || map.UNPAID;
        return <Badge variant={info.variant}>{info.label}</Badge>;
      },
    },
    {
      accessorKey: "paymentMethod",
      header: "Метод",
      cell: ({ row }) => (row.original.paymentMethod === "CASH" ? "В брой" : "Банка"),
    },
  ];

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="container mx-auto">
      <BasicHeader
        title="Неплатени фактури"
        subtitle="Всички неплатени и частично платени фактури"
      >
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Филтри
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 space-y-3" align="end">
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold">Филтри</p>
              <Button variant="ghost" size="icon" onClick={() => { resetFilters(); setIsFilterOpen(false); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              <Label>Партньор</Label>
              <Combobox
                options={partners}
                value={partnerId}
                onValueChange={(val) => setPartnerId(val)}
                placeholder="Избери партньор"
                searchPlaceholder="Търси..."
              />
              <Input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Име на партньор"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="dateFrom">От дата</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dateTo">До дата</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="paymentMethod">Метод</Label>
              <select
                id="paymentMethod"
                className="border rounded px-2 py-2 text-sm w-full"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="">Всички</option>
                <option value="CASH">В брой</option>
                <option value="BANK">Банка</option>
              </select>
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={resetFilters}>Изчисти</Button>
              <Button variant="default" size="sm" onClick={() => setIsFilterOpen(false)}>Готово</Button>
            </div>
          </PopoverContent>
        </Popover>
      </BasicHeader>

      <DataTable
        columns={columns}
        data={data || []}
        searchKey="invoiceNumber"
      />
    </div>
  );
}
