"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  User, 
  Package, 
  TrendingUp, 
  TrendingDown,
  Plus,
  RefreshCw
} from "lucide-react";
import useSWR from "swr";
import BasicHeader from "@/components/BasicHeader";
import { format } from "date-fns";
import { bg } from "date-fns/locale";
import LoadingScreen from "@/components/LoadingScreen";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function StorageRevisionsListPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [storageFilter, setStorageFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [selectedRevision, setSelectedRevision] = useState(null);

  // Build API URL with filters
  const apiUrl = `/api/storage-revisions/list?page=${page}&limit=10${
    storageFilter && storageFilter !== "all" ? `&storageId=${storageFilter}` : ""
  }${userFilter && userFilter !== "all" ? `&userId=${userFilter}` : ""}`;

  const { data, error, mutate, isLoading } = useSWR(apiUrl, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch storages and users for filters
  const { data: storages = [] } = useSWR("/api/storages", fetcher);
  const { data: users = [] } = useSWR("/api/users", fetcher);

  const revisions = data?.revisions || [];
  const pagination = data?.pagination || {};

  const handleViewDetails = async (revisionId) => {
    try {
      const response = await fetch(`/api/storage-revisions/${revisionId}`);
      if (!response.ok) throw new Error("Failed to fetch revision details");
      const revision = await response.json();
      setSelectedRevision(revision);
    } catch (error) {
      console.error("Error fetching revision details:", error);
      toast.error("Грешка при зареждане на детайлите");
    }
  };

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
      <div className="flex items-center justify-between">
        <div className="flex gap-2">

        </div>
      </div>

      <BasicHeader
      title="Складови ревизии"
      >
      <Button 
            onClick={() => router.push("/dashboard/storage-revisions/create")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Нова ревизия
          </Button>
      </BasicHeader>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Филтри
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="storage-filter">Склад</Label>
              <Select value={storageFilter} onValueChange={setStorageFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Всички складове" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всички складове</SelectItem>
                  {storages.map((storage) => (
                    <SelectItem key={storage.id} value={storage.id}>
                      {storage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="user-filter">Потребител</Label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Всички потребители" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всички потребители</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setStorageFilter("all");
                  setUserFilter("all");
                  setPage(1);
                }}
                className="w-full"
              >
                Изчисти филтри
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revisions Table */}
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
                    <TableHead>Обща промяна</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revisions.map((revision) => (
                    <TableRow key={revision.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatDate(revision.createdAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {revision.storage.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{revision.user.name || revision.user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{revision.stats.totalProducts} общо</div>
                          <div className="text-muted-foreground">
                            {revision.stats.productsWithChanges} с промени
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          {revision.stats.increases > 0 && (
                            <div className="flex items-center gap-1 text-green-600">
                              <TrendingUp className="h-3 w-3" />
                              +{revision.stats.increases}
                            </div>
                          )}
                          {revision.stats.decreases > 0 && (
                            <div className="flex items-center gap-1 text-red-600">
                              <TrendingDown className="h-3 w-3" />
                              -{revision.stats.decreases}
                            </div>
                          )}
                          {revision.stats.increases === 0 && revision.stats.decreases === 0 && (
                            <span className="text-muted-foreground">Без промени</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 font-medium ${getQuantityChangeColor(revision.stats.totalQuantityChange)}`}>
                          {getQuantityChangeIcon(revision.stats.totalQuantityChange)}
                          {revision.stats.totalQuantityChange > 0 ? "+" : ""}{revision.stats.totalQuantityChange}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewDetails(revision.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Детайли
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Детайли за ревизия</DialogTitle>
                                <DialogDescription>
                                  Склад: {revision.storage.name} | 
                                  Дата: {formatDate(revision.createdAt)} | 
                                  Потребител: {revision.user.name || revision.user.email}
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedRevision && (
                                <div className="space-y-4">
                                  {/* Summary Stats */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                                    <div className="text-center">
                                      <div className="text-2xl font-bold">{selectedRevision.stats.totalProducts}</div>
                                      <div className="text-sm text-muted-foreground">Общо продукти</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-green-600">{selectedRevision.stats.increases}</div>
                                      <div className="text-sm text-muted-foreground">Увеличения</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-red-600">{selectedRevision.stats.decreases}</div>
                                      <div className="text-sm text-muted-foreground">Намаления</div>
                                    </div>
                                    <div className="text-center">
                                      <div className={`text-2xl font-bold ${getQuantityChangeColor(selectedRevision.stats.totalQuantityChange)}`}>
                                        {selectedRevision.stats.totalQuantityChange > 0 ? "+" : ""}{selectedRevision.stats.totalQuantityChange}
                                      </div>
                                      <div className="text-sm text-muted-foreground">Обща промяна</div>
                                    </div>
                                  </div>

                                  {/* Products Table */}
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Продукт</TableHead>
                                        <TableHead>Баркод</TableHead>
                                        <TableHead>Код</TableHead>
                                        <TableHead>Оригинално</TableHead>
                                        <TableHead>Проверено</TableHead>
                                        <TableHead>Промяна</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedRevision.products.map((product) => {
                                        const change = product.checkedQuantity - product.originalQuantity;
                                        return (
                                          <TableRow key={product.id}>
                                            <TableCell className="font-medium">
                                              {product.product.name}
                                            </TableCell>
                                            <TableCell>{product.product.barcode}</TableCell>
                                            <TableCell>{product.product.pcode || "-"}</TableCell>
                                            <TableCell>{product.originalQuantity}</TableCell>
                                            <TableCell>{product.checkedQuantity}</TableCell>
                                            <TableCell>
                                              {change !== 0 && (
                                                <Badge variant={change > 0 ? "default" : "destructive"}>
                                                  {change > 0 ? "+" : ""}{change}
                                                </Badge>
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => router.push(`/dashboard/storage-revisions/${revision.id}`)}
                          >
                            Отвори
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Показване {((page - 1) * pagination.limit) + 1} - {Math.min(page * pagination.limit, pagination.total)} от {pagination.total} ревизии
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                    >
                      Предишна
                    </Button>
                    <span className="flex items-center px-3 py-2 text-sm">
                      Страница {page} от {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= pagination.totalPages}
                    >
                      Следваща
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
    </div>
  );
}