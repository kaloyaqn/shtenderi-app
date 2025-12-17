"use client";

import BasicHeader from "@/components/BasicHeader";
import { DataTable } from "@/components/ui/data-table";
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
import LoadingScreen from "@/components/LoadingScreen";
import TableLink from "@/components/ui/table-link";
import { useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientsRevenueReport() {
  const [dateFrom, setDateFrom] = useQueryState("dateFrom");
  const [dateTo, setDateTo] = useQueryState("dateTo");
  const [regionId, setRegionId] = useQueryState("regionId");
  const [partnerQuery, setPartnerQuery] = useQueryState("partner");
  const [isFilterOpen, setIsFilterOpen] = useQueryState("filters", {
    defaultValue: false,
    parse: (v) => v === "1",
    serialize: (v) => (v ? "1" : null),
  });

  const query = new URLSearchParams();
  if (dateFrom) query.set("dateFrom", dateFrom);
  if (dateTo) query.set("dateTo", dateTo);
  if (regionId) query.set("regionId", regionId);
  if (partnerQuery) query.set("partner", partnerQuery);

  const { data, isLoading } = useSWR(
    [
      `/api/reports/clients${query.toString() ? `?${query.toString()}` : ""}`,
      "/api/regions",
    ],
    multiFetcher
  );

  const clients = data?.[0]?.clients || [];
  const regions = data?.[1] || [];
  const topClients = clients.slice(0, 8);
  const [showChart, setShowChart] = useState(true);

  const formatMoney = (value) =>
    new Intl.NumberFormat("bg-BG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);

  const RevenueTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const client = payload[0]?.payload;
    return (
      <div className="rounded-md border bg-white px-3 py-2 shadow">
        <div className="text-xs font-semibold mb-1">
          {client?.partnerName || label}
        </div>
        <div className="text-xs text-gray-700">
          {`Оборот: ${formatMoney(client?.revenueBgn)} лв.`}
        </div>
        <div className="text-xs text-gray-700">
          {`Оборот: ${formatMoney(client?.revenueEur)} €`}
        </div>
      </div>
    );
  };

  const columns = [
    {
      accessorKey: "partnerName",
      header: "Клиент",
      cell: ({ row }) => (
        <TableLink href={`/dashboard/partners/${row.original.partnerId}`}>
          {row.original.partnerName}
        </TableLink>
      ),
    },
    // {
    //   accessorKey: "partnerId",
    //   header: "Код",
    // },
    {
      accessorKey: "regionName",
      header: "Регион",
    },
    {
      accessorKey: "cities",
      header: "Градове",
      cell: ({ row }) => row.original.cities?.join(", ") || "-",
    },
    {
      accessorKey: "soldAmount",
      header: "Закупено (лв.)",
      cell: ({ row }) => formatMoney(row.original.soldAmount),
    },
    {
      accessorKey: "returnedAmount",
      header: "Върнато (лв.)",
      cell: ({ row }) => formatMoney(row.original.returnedAmount),
    },
    {
      accessorKey: "revenueBgn",
      header: "Оборот (лв.)",
      cell: ({ row }) => (
        <span className="font-semibold">
          {formatMoney(row.original.revenueBgn)}
        </span>
      ),
    },
    {
      accessorKey: "revenueEur",
      header: "Оборот (€)",
      cell: ({ row }) => formatMoney(row.original.revenueEur),
    },
  ];

  return (
    <>
      <BasicHeader
        title="Справка оборот по клиенти"
        subtitle="Закупено - върнато по клиенти и региони"
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
                  <Label htmlFor="partnerQuery">Клиент</Label>
                  <Input
                    id="partnerQuery"
                    type="text"
                    placeholder="Име или код на клиент"
                    value={partnerQuery || ""}
                    onChange={(e) => setPartnerQuery(e.target.value || null)}
                  />
                </div>

                <div className="w-full grid gap-2">
                  <Label>Регион</Label>
                  <Combobox
                    placeholder="Избери регион"
                    onValueChange={(value) => setRegionId(value)}
                    value={regionId}
                    options={regions.map((region) => ({
                      key: region.id,
                      value: region.id,
                      label: region.name,
                    }))}
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
                      setRegionId(null);
                      setPartnerQuery(null);
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
        {isLoading ? (
          <LoadingScreen />
        ) : (
          <>
            <Card className="mb-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Топ клиенти по оборот (лв.)</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowChart((prev) => !prev)}
                >
                  {showChart ? "Скрий" : "Покажи"}
                </Button>
              </CardHeader>
              {showChart && (
                <CardContent style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topClients}
                      layout="vertical"
                      margin={{ top: 10, right: 20, bottom: 10, left: 80 }}
                      barSize={18}
                    >
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="partnerName"
                        tick={{ fontSize: 11 }}
                        width={180}
                      />
                      <RechartsTooltip content={<RevenueTooltip />} />
                      <Bar dataKey="revenueBgn" fill="#22c55e" radius={[4, 4, 4, 4]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              )}
            </Card>

            <DataTable
              data={clients}
              columns={columns}
              initialSorting={[{ id: "revenueBgn", desc: true }]}
            />
          </>
        )}
      </div>
    </>
  );
}
