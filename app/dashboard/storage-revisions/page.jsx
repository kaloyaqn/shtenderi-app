"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Filter,
  Calendar,
  User,
  Package,
  TrendingUp,
  TrendingDown,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
import useSWR from "swr";
import BasicHeader from "@/components/BasicHeader";
import { format } from "date-fns";
import { bg } from "date-fns/locale";
import LoadingScreen from "@/components/LoadingScreen";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function StorageRevisionsListPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [storageFilter, setStorageFilter] = useState("ALL");
  const [userFilter, setUserFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const apiUrl = `/api/storage-revisions/list?page=${page}&limit=10${
    storageFilter !== "ALL" ? `&storageId=${storageFilter}` : ""
  }${userFilter !== "ALL" ? `&userId=${userFilter}` : ""}${
    dateFrom ? `&dateFrom=${dateFrom}` : ""
  }${dateTo ? `&dateTo=${dateTo}` : ""}`;

  const { data, error, mutate, isLoading } = useSWR(apiUrl, fetcher, {
    refreshInterval: 30000,
  });

  const { data: storages = [] } = useSWR("/api/storages", fetcher);
  const { data: users = [] } = useSWR("/api/users", fetcher);

  const revisions = data?.revisions || [];
  const pagination = data?.pagination || {};

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd.MM.yyyy HH:mm", { locale: bg });
  };

  const getQuantityChangeColor = (change) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getQuantityChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  if (error) {
    return (
      <div className="container mx-auto space-y-4">
        <BasicHeader
          title="Складови ревизии"
          subtitle="История на всички складови ревизии"
        />
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Грешка при зареждане на ревизиите</p>
            <Button onClick={() => mutate()} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Опитай отново
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-4">
      <BasicHeader title="Складови ревизии">
        <div className="flex items-center gap-2">
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
                    <Label htmlFor="storage-filter">Склад</Label>
                    <Combobox
                      placeholder="Всички складове"
                      value={storageFilter}
                      onValueChange={(val) => setStorageFilter(val || "ALL")}
                      options={[
                        { key: "ALL", value: "ALL", label: "Всички складове" },
                        ...storages.map((storage) => ({
                          key: storage.id,
                          value: storage.id,
                          label: storage.name,
                        })),
                      ]}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="user-filter">Потребител</Label>
                    <Combobox
                      placeholder="Всички потребители"
                      value={userFilter}
                      onValueChange={(val) => setUserFilter(val || "ALL")}
                      options={[
                        { key: "ALL", value: "ALL", label: "Всички потребители" },
                        ...users.map((user) => ({
                          key: user.id,
                          value: user.id,
                          label: user.name || user.email || user.id,
                        })),
                      ]}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="grid gap-2 w-full">
                      <Label htmlFor="dateFrom">Дата от</Label>
                      <Input
                        id="dateFrom"
                        type="date"
                        value={dateFrom || ""}
                        onChange={(e) => setDateFrom(e.target.value || "")}
                      />
                    </div>
                    <div className="grid gap-2 w-full">
                      <Label htmlFor="dateTo">Дата до</Label>
                      <Input
                        id="dateTo"
                        type="date"
                        value={dateTo || ""}
                        onChange={(e) => setDateTo(e.target.value || "")}
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
                        setStorageFilter("ALL");
                        setUserFilter("ALL");
                        setDateFrom("");
                        setDateTo("");
                        setPage(1);
                      }}
                    >
                      <X /> Изчисти
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={() => router.push("/dashboard/storage-revisions/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Нова ревизия
          </Button>
        </div>
      </BasicHeader>

      {isLoading ? (
        <LoadingScreen />
      ) : revisions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Няма намерени ревизии
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Склад</TableHead>
                <TableHead>Потребител</TableHead>
                <TableHead>Продукти</TableHead>
                <TableHead>Промени</TableHead>
                <TableHead>Детайли</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revisions.map((revision) => (
                <TableRow key={revision.id}>
                  <TableCell>{formatDate(revision.createdAt)}</TableCell>
                  <TableCell>{revision.storage?.name || "-"}</TableCell>
                  <TableCell>{revision.user?.name || revision.user?.email}</TableCell>
                  <TableCell>{revision.stats.totalProducts}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getQuantityChangeIcon(revision.stats.totalQuantityChange)}
                      <span className={getQuantityChangeColor(revision.stats.totalQuantityChange)}>
                        {revision.stats.totalQuantityChange > 0 ? "+" : ""}
                        {revision.stats.totalQuantityChange}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/storage-revisions/${revision.id}`)}
                    >
                      <Package className="h-4 w-4 mr-1" />
                      Виж
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              Страница {pagination.page} от {pagination.totalPages || 1}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Назад
              </Button>
              <Button
                variant="outline"
                disabled={pagination.page >= (pagination.totalPages || 1)}
                onClick={() =>
                  setPage((p) => Math.min((pagination.totalPages || 1), p + 1))
                }
              >
                Напред
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
