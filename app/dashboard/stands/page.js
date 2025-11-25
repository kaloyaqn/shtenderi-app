"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Plus,
  Pencil,
  Trash2,
  Store,
  Building,
  Package,
  Eye,
  Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/session-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CreateStandPage from "./create/page";
import LoadingScreen from "@/components/LoadingScreen";
import TableLink from "@/components/ui/table-link";
import { useIsMobile } from "@/hooks/use-mobile";
import NoAcess from "@/components/NoAccess";
import { IconLayoutRows } from "@tabler/icons-react";
import BasicHeader from "@/components/BasicHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHelpTour from "@/components/help/PageHelpTour";
import useSWR, { mutate } from "swr";
import { fetcher, multiFetcher } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { useQueryState } from "nuqs";

export default function Stands() {
  const [stands, setStands] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [standToDelete, setStandToDelete] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const isMobile = useIsMobile();

  // filters
  const [isFilterOpen, setFiltersOpen] = useState(false);
  const [name, setName] = useQueryState("name");
  const [cityId, setCityId] = useQueryState("cityId");
  const [regionId, setRegionId] = useQueryState("regionId");

  const { data, error, isLoading } = useSWR(
    [
      `/api/stands?city=${cityId}&region=${regionId}&name=${name}`,
      "/api/cities",
      "/api/regions",
    ],
    multiFetcher,
  );

  const cities = data?.[1] || [];
  const regions = data?.[2] || [];

  useEffect(() => {
    if (data) setStands(data?.[0]);
    console.log(data);
  }, [data]);

  async function fetchFilters() {}

  const handleDelete = async () => {
    if (!standToDelete || !isAdmin) return;

    try {
      const response = await fetch(`/api/stands/${standToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete stand");
      }

      mutate("/api/stands");
    } catch (error) {
      console.error("Error deleting stand:", error);
    } finally {
      setDeleteDialogOpen(false);
      setStandToDelete(null);
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Име на щендер",
      cell: ({ row }) => {
        const stand = row.original;

        return (
          <span className="flex items-center">
            <TableLink href={`/dashboard/stands/${stand.id}`}>
              {stand.name}
            </TableLink>

            {stand.region?.name && (
              <Badge variant="success">
                {stand.region?.name ? `${stand.region.name}  ` : ""}
              </Badge>
            )}
          </span>
        );
      },
    },
    {
      accessorKey: "lastCheckAt",
      header: "Чекиран",
      cell: ({ row }) => {
        return (
          <>
            <TableLink href={`/dashboard/checks/${row.original.lastCheckId}`}>
              {row.original.lastCheckAt
                ? new Date(row.original.lastCheckAt).toLocaleString("bg-BG", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })
                : ""}
            </TableLink>
          </>
        );
      },
    },
    {
      accessorKey: "store.partner.name",
      header: "партньор",
      cell: ({ row }) => {
        return (
          <TableLink
            href={`/dashboard/partners/${row.original.store.partnerId}`}
          >
            {row.original.store.partner.name}
          </TableLink>
        );
      },
    },

    {
      accessorKey: "store.name",
      header: "магазин",
      cell: ({ row }) => {
        return (
          <TableLink href={`/dashboard/stores/${row.original.store.id}`}>
            {row.original.store.name}
          </TableLink>
        );
      },
    },
    {
      header: "Търговец",
      accessorKey: "userStands",
      cell: ({ row }) => {
        const userStands = row.original.userStands || [];
        if (userStands.length === 0) return "-";
        return userStands
          .map((us) => us.user?.name || us.user?.email)
          .join(", ");
      },
    },
    // {
    //   accessorKey: "_count.standProducts",
    //   header: "Брой продукти",
    // },
    {
      accessorKey: "store.partner.percentageDiscount",
      header: "%",
      cell: ({ row }) => {
        const PD = row.original.store.partner.percentageDiscount;

        return <Badge variant={"outline"}>{PD || 0}%</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Създаден",
      cell: ({ row }) => {
        const date = row.original.createdAt;
        if (!date) return "-";
        // Format date as dd.MM.yyyy
        const d = new Date(date);
        return (
          <span>
            {d.toLocaleDateString("bg-BG", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const stand = row.original;
        if (!isAdmin) return null;
        return (
          <div className="flex items-center gap-2 md:flex-row flex-col md:justify-start justify-center w-full">
            <Button
              variant="table"
              onClick={() => router.push(`/dashboard/stands/${stand.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="table"
              onClick={() => {
                setStandToDelete(stand);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-2 w-2" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return <LoadingScreen />;
  }

  // if (!isLoading && stands.length === 0) {
  //   return (
  //     <>
  //       <NoAcess
  //         icon={<IconLayoutRows className="h-12 w-12 text-gray-400" />}
  //         help_text={`Ако имате нужда от помощ, свържете се с администратор.`}
  //         subtitlte={`
  //       Нямате зачислени щендери. За добавяне на нови складове се свържете с администратор.
  //       `}
  //         title={isAdmin ? "Няма намерени щендери" : "Нямате зачислени щендери"}
  //       />

  //       {isAdmin && (
  //         <Button onClick={() => router.push("/dashboard/stands/create")}>
  //           <Plus className="h-4 w-4" />
  //         </Button>
  //       )}
  //     </>
  //   );
  // }

  if (isMobile) {
    return (
      <div className="">
        <PageHelpTour />

        <BasicHeader
          title={isAdmin ? "Всички щендери" : "Твоите зачислени щендери"}
          subtitle={"Виж твоите зачислени щендери "}
        >
          {/* {isAdmin && (
            <Button onClick={() => router.push("/dashboard/stands/create")}>
              <Plus className="h-4 w-4" />
            </Button>
          )}*/}

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

                  <div className="w-full grid gap-2">
                    <Label>Град</Label>
                    <Combobox
                      options={cities.map((city) => ({
                        key: city.id,
                        value: city.id,
                        label: city.name,
                      }))}
                      placeholder="Избери град"
                      onValueChange={(value) => setCityId(value)}
                      value={cityId}
                    />
                  </div>

                  <Button className={"mt-2"} variant="outline">
                    <Filter /> Филтрирай
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </BasicHeader>
        <div className="space-y-3 mt-2">
          {/* Visible filter/help section for Joyride */}
          {stands.map((stand) => (
            <Card
              id="card"
              key={stand.id}
              className="border border-gray-200 shadow-sm py-0"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Store className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="min-w-0 flex items-center gap-2">
                      <h3
                        id="stand-name"
                        className="font-medium text-gray-900 text-sm whitespace-pre-line break-words"
                      >
                        {stand.name}
                      </h3>
                      {stand.region?.name && (
                        <Badge variant="success">
                          {stand.region?.name ? `${stand.region.name}  ` : ""}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    id="stand-button"
                    variant="table"
                    size="sm"
                    className="shrink-0 w-10 h-10"
                    onClick={() => router.push(`/dashboard/stands/${stand.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Партньор:</span>
                    </div>
                    <span
                      id="stand-partner"
                      className="text-gray-900 font-medium"
                    >
                      {stand.store?.partner?.name || "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Store className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Магазин:</span>
                    </div>
                    <span
                      id="stand-store"
                      className="text-gray-900 font-medium"
                    >
                      {stand.store?.name || "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Брой продукти:</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        id="stand-products"
                        className="text-gray-900 font-bold"
                      >
                        {stand._count?.standProducts ?? "-"}
                      </span>
                      {stand._count?.standProducts === 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Празен
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {isAdmin && (
          <Button
            className="fixed bottom-6 right-6 rounded-full shadow-lg"
            size="icon"
            onClick={() => router.push("/dashboard/stands/create")}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex md:flex-row flex-col justify-between items-center pb-4 border-b mb-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-900">Щендери</h1>
          <p className="text-base text-gray-600">
            Управление на щендери и зареждане на стока
          </p>
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter /> Филтри
              </Button>
            </PopoverTrigger>
            <PopoverContent padding={0} sideOffset={0} className="w-md">
              <div className="">
                <div className="w-full p-4 bg-gray-50 border-b border-b-gray-300 rounded-t-md">
                  <h4 className="leading-none font-medium">Филтри</h4>
                  <p className="text-muted-foreground text-sm ">
                    Избери филтрите
                  </p>
                </div>
                <div className="p-4 flex flex-col gap-4">
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

                  <div className="w-full grid gap-2">
                    <Label>Град</Label>
                    <Combobox
                      options={cities.map((city) => ({
                        key: city.id,
                        value: city.id,
                        label: city.name,
                      }))}
                      placeholder="Избери град"
                      onValueChange={(value) => setCityId(value)}
                      value={cityId}
                    />
                  </div>

                  <Button className={"mt-2"} variant="outline">
                    <Filter /> Филтрирай
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {isAdmin && (
            <Button onClick={() => router.push("/dashboard/stands/create")}>
              <Plus className="h-4 w-4" />
              Добави щендер
            </Button>
          )}
        </div>
      </div>

      <DataTable columns={columns} data={stands} searchKey="name" />

      {isAdmin && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Изтриване на щанд</AlertDialogTitle>
              <AlertDialogDescription>
                Сигурни ли сте, че искате да изтриете щанд {standToDelete?.name}
                ? Това действие не може да бъде отменено.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отказ</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Изтрий
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
