"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "sonner";
import TableLink from "@/components/ui/table-link";
import { IconDetails, IconEye, IconRowRemove } from "@tabler/icons-react";
import { RefreshCcw, X } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import LoadingScreen from "@/components/LoadingScreen";
import BasicHeader from "@/components/BasicHeader";
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Package,
  MoreHorizontal,
  Menu,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { useQueryState } from "nuqs";

export default function RevisionsListPage() {
  const [revisions, setRevisions] = useState([]);
  // const [stats, setStats] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: session } = useSession();
  // const [invoices, setInvoices] = useState({});

  // Move all hooks here, before any return
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filterPartner, setFilterPartner] = useState("");
  const [filterUser, setFilterUser] = useState("");

  // Filters
  const [standId, setStandId] = useQueryState("stand");
  const [partnerId, setPartnerId] = useQueryState("partner");
  const [invoiceId, setInvoiceId] = useQueryState("invoice");
  const [storeId, setStoreId] = useQueryState("store");
  const [userId, setUserId] = useQueryState("user");
  const [filterSource, setFilterSource] = useQueryState("source");
  const [statusFilter, setStatusFilter] = useQueryState("status");
  const [dateFrom, setDateFrom] = useQueryState("dateFrom", { defaultValue: "" });
  const [dateTo, setDateTo] = useQueryState("dateTo", {defaultValue: ""});

  const {
    data: stands,
    isLoading: standsLoading,
    error: standError,
    mutate: mutateStands,
  } = useSWR(`/api/stands`, fetcher);

  const {
    data: partners,
    isLoading: partnersLoading,
    error: partnersError,
    mutate: mutatePartners
  } = useSWR(`/api/partners`, fetcher);

  const {
    data: stores,
    isLoading: storesLoading,
    error: storesError,
    mutate: mutateStores
  } = useSWR(`/api/stores`, fetcher);

  const {
    data: invoices,
    isLoading: invoicesLoading,
    error: invoicesError,
    mutate: mutateInvoices
  } = useSWR(`/api/invoices`, fetcher);

  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
    mutate: mutateUsers
  } = useSWR('/api/users', fetcher);


  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    mutate: mutateStats
  } = useSWR('/api/stats', fetcher);


  // const fetchStats = async () => {
  //   try {
  //     const res = await fetch("/api/stats");
  //     if (!res.ok) {
  //       toast.error("Грешка при взимането на статистики");
  //     }
  //     let data = await res.json();
  //     console.log(data);
  //     setStats(data);
  //   } catch (err) {
  //     toast.error(err.message);
  //     throw Error(err);
  //   }
  // };


  const revisionsKey = session
    ? (() => {
        let url = `/api/revisions?stand=${standId}`;
        const params = [];
        if (statusFilter) params.push(`status=${statusFilter}`);
        if (params.length) url += `?${params.join("&")}`;
        return url;
      })()
    : null;

  const {
    data: revisionsData,
    error: revisionsError,
    isLoading: revisionsLoading,
  } = useSWR(`/api/revisions?stand=${standId}&store=${storeId}&invoice=${invoiceId}&parnter=${partnerId}&user=${userId}&status=${statusFilter}&source=${filterSource}&dateFrom=${dateFrom}&dateTo=${dateTo}`, fetcher);

  useEffect(() => {
    if (revisionsError) {
      toast.error("Грешка при зареждане на продажби.");
      console.error("Failed to fetch revisions:", revisionsError);
      setLoading(false);
      return;
    }
    if (revisionsData) {
      console.log(revisionsData);
      const flattened = revisionsData.map((rev) => ({
        ...rev,
        standName: rev.stand?.name || "-",
        partnerName: rev.partner?.name || "-",
        userName: rev.user?.name || rev.user?.email || "-",
      }));
      console.log("Fetched revisions:", flattened);
      setRevisions(flattened);
      setLoading(false);
    }
  }, [revisionsData, revisionsError, revisionsKey]);

  // // Fetch all invoices for the revisions
  // useEffect(() => {
  //   async function fetchInvoicesForRevisions() {
  //     const revisionNumbers = Array.from(
  //       new Set(revisions.map((r) => r.number))
  //     );
  //     if (revisionNumbers.length === 0) return;
  //     const params = new URLSearchParams();
  //     revisionNumbers.forEach((n) => params.append("revisionNumber", n));
  //     const res = await fetch(`/api/invoices?${params.toString()}`);
  //     const data = await res.json();
  //     // Map revisionNumber to invoice
  //     const invoiceMap = {};
  //     data.forEach((inv) => {
  //       invoiceMap[inv.revisionNumber] = inv;
  //     });
  //     setInvoices(invoiceMap);
  //   }
  //   fetchInvoicesForRevisions();
  // }, [revisions]);

  const columns = [

    {
      accessorKey: "number",
      header: "№",
      cell: ({ row }) => row.original.number,
    },
    {
      accessorKey: "createdAt",
      header: "Дата",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      accessorKey: "partnerName",
      header: "Партньор",
    },
    {
      accessorKey: "missingProductsTotalPrice",
      header: "Цена",
      cell: ({row}) => {
        return (
          <>
          {row.original.missingProductsTotalPrice.toFixed(2)} лв.
          </>
        )
      }
    },
    {
      accessorKey: "source",
      header: "Източник",
      cell: ({ row }) => {
        const stand = row.original.stand;
        const storage = row.original.storage;
        if (storage) {
          return (
            <TableLink href={`/dashboard/storages/${storage.id}`}>
              {storage.name}
            </TableLink>
          );
        } else if (stand) {
          return (
            <TableLink href={`/dashboard/stands/${stand.id}`}>
              {stand.name}
            </TableLink>
          );
        } else {
          return <span className="text-gray-400">-</span>;
        }
      },
    },
    {
      accessorKey: "type",
      header: "Тип",
      cell: ({ row }) => {
        const type = row.original.type;
        if (!type) return null;
        return (
          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 border ${
              type === "import"
                ? "border-blue-400 text-blue-700"
                : type === "admin"
                ? "border-red-400 text-red-700 bg-red-100!"
                : "border-gray-300 text-gray-600"
            }`}
          >
            {type === "import" ? "Импорт" : type === "admin" ? "Виртуална" : "Ръчно"}
          </span>

        );
      },
    },


    {
      accessorKey: "userName",
      header: "Потребител",
    },

    // {
    //   accessorKey: "missingProducts",
    //   header: "кол.",
    //   cell: ({ row }) => row.original.missingProducts?.length || 0,
    // },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => {
        const type = row.original.status;
        if (!type) return null;

        let variant = "destructive";
        if (type === "PAID") {
          variant = "success";
        }
        return (
          <>
            <Badge variant={variant}>
              {type === "NOT_PAID" ? "Неплатена" : "Платена"}
            </Badge>
          </>
        );
      },
    },
    {
      accessorKey: "invoice.invoiceNumber",
      header: "Фактура",
      cell: ({ row }) => {
        const revInvoice = row.original.invoice;
        return revInvoice ? (
          <TableLink href={`/dashboard/invoices/${revInvoice.id}`}>
            {revInvoice.invoiceNumber}
          </TableLink>
        ) : (
          "-"
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="table"
          onClick={() => router.push(`/dashboard/revisions/${row.original.id}`)}
        >
          <IconEye /> Виж
        </Button>
      ),
    },
  ];

  const userIsAdmin = session?.user?.role === "ADMIN";
  // if (loading) return <LoadingScreen />;
  if (!loading && revisions.length === 0 && !userIsAdmin) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-3xl font-bold mb-4">Продажби</h1>
        <p className="text-gray-50">
          Нямате продажби от зачислените Ви щандове.
        </p>
      </div>
    );
  }

  // Filter and search for mobile
  const filteredRevisions = revisions.filter((rev) => {
    const matchesSearch =
      !searchTerm ||
      rev.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.partnerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.standName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource =
      !filterSource ||
      rev.standName?.toLowerCase().includes(filterSource.toLowerCase());
    const matchesPartner =
      !filterPartner ||
      rev.partnerName?.toLowerCase().includes(filterPartner.toLowerCase());
    const matchesUser =
      !filterUser ||
      rev.userName?.toLowerCase().includes(filterUser.toLowerCase());
    return matchesSearch && matchesSource && matchesPartner && matchesUser;
  });

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-3">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Продажби</h1>
              <p className="text-xs text-gray-500">Управление на транзакции</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-3 space-y-3">
          {/* Mobile Search and Filters */}
          <Card className={'py-0'}>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                  <Input
                    placeholder="Търсене на потребител..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 h-8 text-sm bg-white border-gray-300"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-gray-600 h-7 text-xs"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-3 h-3 mr-1" />
                  Допълнителни филтри
                </Button>

                {showFilters && (
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <Input
                      placeholder="Източник..."
                      value={filterSource}
                      onChange={(e) => setFilterSource(e.target.value)}
                      className="bg-white border-gray-300 h-8 text-sm"
                    />
                    <Input
                      placeholder="Партньор..."
                      value={filterPartner}
                      onChange={(e) => setFilterPartner(e.target.value)}
                      className="bg-white border-gray-300 h-8 text-sm"
                    />
                    <Input
                      placeholder="Потребител..."
                      value={filterUser}
                      onChange={(e) => setFilterUser(e.target.value)}
                      className="bg-white border-gray-300 h-8 text-sm"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mobile Sales Cards */}
          <div className="space-y-3">
            {filteredRevisions.map((sale) => (
              <Card key={sale.id} className="border border-gray-200 py-0">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 bg-gray-100 rounded-md flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-700">
                          №{sale.number}
                        </span>
                      </div>
                      <div>
                        {/* Source: link to stand or storage if available, else dash */}
                        {sale.storage ? (
                          <a
                            href={`/dashboard/storages/${sale.storage.id}`}
                            className="font-medium text-blue-700 text-xs underline"
                          >
                            {sale.storage.name}
                          </a>
                        ) : sale.stand ? (
                          <a
                            href={`/dashboard/stands/${sale.stand.id}`}
                            className="font-medium text-blue-700 text-xs underline"
                          >
                            {sale.stand.name}
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Тип:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 border ${
                          sale.type === "import"
                            ? "border-blue-400 text-blue-700"
                            : "border-gray-300 text-gray-600"
                        }`}
                      >
                        {sale.type === "import" ? "Импорт" : "Ръчно"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Партньор:</span>
                      <span className="text-xs text-gray-900">
                        {sale.partnerName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Потребител:</span>
                      <span className="text-xs font-medium text-gray-900">
                        {sale.userName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Дата:</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-2 h-2 text-gray-400" />
                        <span className="text-xs text-gray-700">
                          {new Date(sale.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-gray-100 rounded-md flex items-center justify-center">
                        <Package className="w-2 h-2 text-gray-600" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Продадени: {" "}

                        <b className="text-sm font-bold text-gray-900">
                        {sale.missingProducts?.length || 0}
                        </b>


                        </span>
                        <p className="text-sm font-bold text-gray-900">
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="table"
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/revisions/${sale.id}`)
                      }
                    >
                      Преглед
                    </Button>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-gray-100 rounded-md flex items-center justify-center">
                        <Package className="w-2 h-2 text-gray-600" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Фактура: {" "}

                        {(() => {
                          const invoice = invoices[sale.number];
                          return invoice ? (
                            <a
                              href={`/dashboard/invoices/${invoice.id}`}
                              className="text-xs text-blue-700 underline"
                            >
                              {invoice.invoiceNumber}
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          );
                        })()}
                        </span>

                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredRevisions.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Няма намерени продажби.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <BasicHeader
        title="Продажби"
        subtitle="Управление на продажби и зареждане на стока"
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline'>
              <Filter /> Филтри
            </Button>
          </PopoverTrigger>
          <PopoverContent padding={0} className='w-md'>
            <div>
              <div className="w-full p-4 bg-gray-50 border-b border-b-gray-300 rounded-t-md">
                <h4 className="leading-none font-medium">Филтри</h4>
                <p className="text-muted-foreground text-sm ">
                  Избери филтрите
                </p>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="w-full grid gap-2">
                    <Label>Стелаж</Label>
                    <Combobox
                      placeholder="Избери стелаж"
                      value={standId}
                      onValueChange={(v) => setStandId(v)}
                      options={stands?.map((stand) => ({
                        key: stand.id,
                        value: stand.id,
                        label: stand.name,
                      }))}
                    />

                  </div>

                  <div className="w-full grid gap-2">
                    <Label>Магазин</Label>
                    <Combobox
                      placeholder="Избери магазин"
                      value={storeId}
                      onValueChange={(v) => setStoreId(v)}
                      options={stores?.map((store) => ({
                        key: store.id,
                        value: store.id,
                        label: store.name,
                      }))}
                    />

                  </div>

                  {!invoicesLoading && (
                    <div className="w-full grid gap-2">
                      <Label>Фактура</Label>
                      <Combobox
                        placeholder="Избери фактура"
                        value={invoiceId}
                        onValueChange={(value) => setInvoiceId(value)}
                        options={invoices.map((invoice) => ({
                          key: invoice.id,
                          value: invoice.id,
                          label: invoice.invoiceNumber.toString(),
                        }))}
                      />
                    </div>
                  )}

                  {!partnersLoading && (
                    <div className="w-full grid gap-2">
                      <Label>Партньор</Label>
                      <Combobox
                        placeholder="Избери партньор"
                        value={partnerId}
                        onValueChange={(value) => setPartnerId(value)}
                        options={partners.map((partner) => ({
                          key: partner.id,
                          value: partner.id,
                          label: partner.name,
                        }))}
                      />
                    </div>
                  )}

                  <div className="w-full grid gap-2">
                    <Label>Потребител</Label>
                    <Combobox
                      placeholder="Избери потребител"
                      value={userId}
                      onValueChange={(v) => setUserId(v)}
                      options={users?.map((user) => ({
                        key: user.id,
                        value: user.id,
                        label: user.name || user.email,
                      }))}
                    />

                  </div>

                  <div className="w-full grid gap-2">
                    <Label>Статус</Label>
                    <Select
                      value={statusFilter || "all"}
                      onValueChange={(value) => {
                        const newValue = value === "all" ? "" : value;
                        setStatusFilter(newValue);
                      }}>
                      <SelectTrigger className=" w-full md:mb-0 mb-2">
                        {statusFilter === "NOT_PAID"
                          ? "Неплатена"
                          : statusFilter === "PAID"
                          ? "Платена"
                          : "Всички"}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Всички</SelectItem>
                        <SelectItem value="NOT_PAID">Неплатена</SelectItem>
                        <SelectItem value="PAID">Платена</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full grid gap-2">
                    <Label>Тип</Label>
                    <Select
                      value={filterSource || "all"}
                      onValueChange={(value) => {
                        const newValue = value === "all" ? "" : value;
                        setFilterSource(newValue);
                      }}>
                      <SelectTrigger className=" w-full md:mb-0 mb-2">
                        {filterSource === "import"
                          ? "Импорт"
                          : filterSource === "manual"
                          ? "Ръчно"
                          : "Всички"}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Всички</SelectItem>
                        <SelectItem value="import">Импорт</SelectItem>
                        <SelectItem value="manual">Ръчно</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full grid gap-2">
                    <Label>Дата от - до</Label>
                    <div className="flex w-full gap-2">


                      <Input
                       value={dateFrom}
                       onChange={(e) => setDateFrom(e.target.value)}
                        type="date"></Input>
                      <Input
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}

                        type="date"></Input>

                    </div>
                  </div>



                  {/* <Combobox
                    options={cities.map((city) => ({
                      key: city.id,
                      value: city.id,
                      label: city.name,
                    }))}
                    placeholder="Избери град"
                    onValueChange={(value) => setCityId(value)}
                    value={cityId}
                  />*/}

                  <div className="flex flex-col gap">
                    <Button className={"mt-2"} variant="outline">
                      <Filter /> Филтрирай
                    </Button>
                    <Button
                      onClick={() => {
                      setInvoiceId("");
                      setStandId("");
                      setStoreId("");
                      setUserId("");
                      setFilterSource("");
                      setStatusFilter("");
                      setDateFrom("");
                      setDateTo("");
                      }}
                      className={"mt-2"} variant="secondary">
                      <X /> Изчисти
                    </Button>
                  </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </BasicHeader>

      {!statsLoading && userIsAdmin &&  (
          <div className="my-4 md:flex-row flex-col flex justify-between items-center gap-2">
            <Card className="w-full">
              <CardContent>
                <CardTitle className="text-lg">Продажби</CardTitle>
                <h1 className="text-xl font-bold mt-1">
                  {stats && stats.totalSalesValue} лв.
                </h1>
              </CardContent>
            </Card>
            <Card className="w-full">
              <CardContent>
                <CardTitle className="text-lg">Продажби {"(30 дни)"}</CardTitle>
                <h1 className="text-xl font-bold mt-1">
                  {stats && stats.salesLast30Days} лв.
                </h1>
              </CardContent>
            </Card>
            <Card className="w-full">
              <CardContent>
                <CardTitle className="text-lg">
                  Брой продажби {"(30 дни)"}
                </CardTitle>
                <h1 className="text-xl font-bold mt-1">
                  {stats && stats.salesCountLast30Days}
                </h1>
              </CardContent>
            </Card>{" "}
            <Card className="w-full">
              <CardContent>
                <CardTitle className="text-lg">Продукти (30 дни)</CardTitle>
                <h1 className="text-xl font-bold mt-1">
                  {stats && stats.itemsSoldLast30Days}
                </h1>
              </CardContent>
            </Card>
          </div>
        )}

      {/* Render DataTable with extraFilters for status */}
      <DataTable
        columns={columns}
        data={revisions}
        searchKey="source"
        filterableColumns={[
          { id: "source", title: "Източник" },
          { id: "partnerName", title: "Партньор" },
          { id: "userName", title: "Потребител" },
        ]}
        extraFilters={
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) => {
              const newValue = value === "all" ? "" : value;
              setStatusFilter(newValue);
              const params = new URLSearchParams(
                Array.from(searchParams.entries())
              );
              if (newValue) {
                params.set("status", newValue);
              } else {
                params.delete("status");
              }
              router.replace(
                `/dashboard/revisions${
                  params.toString() ? `?${params.toString()}` : ""
                }`,
                { shallow: true }
              );
            }}
          >
            <SelectTrigger className="md:max-w-sm w-full md:mb-0 mb-2">
              {statusFilter === "NOT_PAID"
                ? "Неплатена"
                : statusFilter === "PAID"
                ? "Платена"
                : "Всички"}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички</SelectItem>
              <SelectItem value="NOT_PAID">Неплатена</SelectItem>
              <SelectItem value="PAID">Платена</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
