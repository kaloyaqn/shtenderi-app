"use client";

import BasicHeader from "@/components/BasicHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import TableLink from "@/components/ui/table-link";
import { fetcher } from "@/lib/utils";
import { useCommand } from "@/components/command-provider";
import { Donut, Filter, X } from "lucide-react";
import { useQueryState } from "nuqs";
import useSWR from "swr";
import LoadingScreen from "@/components/LoadingScreen";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { IconBox, IconBoxModel2Off, IconBrandFoursquare, IconFileSad, IconMoodEmpty } from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function ReportDelivery() {
  const [productId, setProductId] = useQueryState("product", {
    defaultValue: "",
  });
  const [dateFrom, setDateFrom] = useQueryState("dateFrom",{
    defaultValue: "",
  });
  const [dateTo, setDateTo] = useQueryState("dateTo",{
    defaultValue: "",
  });

  const { openProductPicker } = useCommand();

  const { data, isLoading, error } = useSWR(
    `/api/reports/delivery?product=${productId}&dateFrom=${dateFrom}&dateTo=${dateTo}`,
    fetcher,
  );

  const handlePickProduct = () => {
    openProductPicker({
      onSelect: (product) => {
        setProductId(product.id);
      },
      presetQuery: productId || "",
    });
  };
  const columns = [
    {
      id: "delivery",
      accessorKey: "delivery.number",
      header: "Дост. №",
      cell: ({ row }) => {
        const deliveryId = row.original.deliveryId;
        const delivery_number = row.original.delivery.number;

        return (
          <TableLink href={`/dashboard/deliveries/${deliveryId}`}>
            {delivery_number}
          </TableLink>
        );
      },
    },
    {
      id: "product.name",
      accessorKey: "product.name",
      header: "Име",
    },
    {
      id: "barcode",
      accessorKey: "barcode",
      header: "Баркод",
    },
    {
      id: "unitPrice",
      accessorKey: "unitPrice",
      header: "Дост.цена",
      cell: ({ row }) => {
        return <>{row.original.unitPrice || 0} лв.</>;
      },
    },
    {
      id: "clientPrice",
      accessorKey: "clientPrice",
      header: "Продажна цена",
      cell: ({ row }) => {
        return <>{row.original.clientPrice || 0} лв.</>;
      },
    },
    {
      id: "quantity",
      accessorKey: "quantity",
      header: "Бройки",
      cell: ({ row }) => {
        return <>{row.original.quantity || 0} бр.</>;
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Статуси",
      cell: ({ row }) => {

        const deliverystatus = row.original.delivery.status;
        const paidStatus = row.original.delivery.paidStatus;

        return <>
          <div className="flex items-center gap-2">
            {deliverystatus == "ACCEPTED" && (
              <Badge variant="success">
              Приета
              </Badge>
            )}

            {deliverystatus == "DRAFT" && (
              <Badge variant="destructive">
                Неприета
              </Badge>
            )}

            {paidStatus == "NOT_PAID" && (
              <Badge variant="destructive">
                Неплатена
              </Badge>
            )}

            {deliverystatus == "PAID" && (
              <Badge variant="success">
                Платена
              </Badge>
            )}
          </div>
        </>;
      },
    },
    {
      id: "acceptedAt",
      accessorKey: "delivery.acceptedAt",
      header: "Дата на приемане",
      cell: ({ row }) => {

        const date = new Date(row.original.delivery.acceptedAt);

        return <>
          <div className="flex items-center gap-2">
            {date.toLocaleDateString("BG-bg") || "-"}
          </div>
        </>;
      },
    },
    // payment status, deliveryStatus,acceptedAt
  ];

  return (
    <>
      <BasicHeader
        title="Справка доставка"
        subtitle="Виж продукти в доставката"
      >
        <Popover>
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
                <Button variant="outline" onClick={handlePickProduct}>
                  {productId ? `${data?.[0]?.product?.name ?? "Избери продукт "}` : "Избери продукт (Ctrl+K)"}
                </Button>

                <div className="flex items-center gap-2">
                  <div className="grid gap-2 w-full">
                    <Label>Дата от</Label>
                    <Input  type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value) } />
                  </div>

                  <div className="grid gap-2 w-full">
                    <Label>Дата до</Label>
                    <Input  type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value) } />
                  </div>
                </div>


                <Button className={"mt-2"} variant="outline">
                  <Filter /> Филтрирай
                </Button>


                <Button className={"mt-2"} variant="secondary" onClick={() => {
                  setDateFrom("")
                  setDateTo("")
                  setProductId("")
                }}>
                  <X /> Изчисти филтри
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </BasicHeader>

      {productId !== "" && (
        <div className="flex gap-2 w-full mb-2">

          {data?.totalCount !== undefined && (
            <Card className='w-full'>
              <CardContent>
                <CardTitle>Общо количество</CardTitle>
                <h3 className="text-2xl mt-3 font-bold">
                  {data.totalCount ?? 0}
                </h3>
              </CardContent>
            </Card>
          )}
          {data?.acceptedCount !== undefined && (
            <Card className='w-full'>
              <CardContent>
                <CardTitle>Общо прието количество</CardTitle>
                <h3 className="text-2xl text-green-700 mt-3 font-bold">
                  {data.acceptedCount ?? 0}
                </h3>
              </CardContent>
            </Card>
          )}
          {data?.draftCount !== undefined && (
            <Card className='w-full'>
              <CardContent>
                <CardTitle>Общо неприето количество</CardTitle>
                <h3 className="text-2xl text-red-700 mt-3 font-bold">
                  {data.draftCount ?? 0}
                </h3>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {productId === "" ? (
        <>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconBox />
              </EmptyMedia>
              <EmptyTitle>Изберете продукт</EmptyTitle>
              <EmptyDescription>Натиснете Ctrl + K или от менюто филтри, за да изберете продукт</EmptyDescription>
              <Button variant="outline" onClick={handlePickProduct}>
                {productId ? `${data?.[0]?.product?.name ?? "Избери продукт"}` : "Избери продукт"}
              </Button>
            </EmptyHeader>

          </Empty>
        </>
      ) : isLoading ? (
        <LoadingScreen />
      ) : (
        <DataTable columns={columns} data={data.delivery_products} />
      )}
    </>
  );
}
