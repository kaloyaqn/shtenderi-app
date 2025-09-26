"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ArrowLeft, Calendar, User, Package, TrendingUp, TrendingDown, Warehouse } from "lucide-react";
import useSWR from "swr";
import BasicHeader from "@/components/BasicHeader";
import { format } from "date-fns";
import { bg } from "date-fns/locale";
import LoadingScreen from "@/components/LoadingScreen";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function StorageRevisionDetailPage({ params }) {
  const router = useRouter();
  const { id: revisionId } = params;
  const [revision, setRevision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRevision = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/storage-revisions/${revisionId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Ревизията не беше намерена");
          } else {
            throw new Error("Failed to fetch revision");
          }
          return;
        }
        const data = await response.json();
        setRevision(data);
      } catch (error) {
        console.error("Error fetching revision:", error);
        setError("Грешка при зареждане на ревизията");
      } finally {
        setLoading(false);
      }
    };

    if (revisionId) {
      fetchRevision();
    }
  }, [revisionId]);

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

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !revision) {
    return (
      <div className="container mx-auto space-y-4">
        <BasicHeader 
          title="Грешка" 
          subtitle={error || "Ревизията не беше намерена"}
        />
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error || "Ревизията не беше намерена"}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-4">
        <BasicHeader 
          title={`Ревизия - ${revision.storage.name}`} 
          subtitle={`Извършена на ${formatDate(revision.createdAt)} от ${revision.user.name || revision.user.email}`}
         hasBackButton={true}
        />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Общо продукти
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revision.stats.totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Увеличения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{revision.stats.increases}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Намаления
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{revision.stats.decreases}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Обща промяна
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-1 ${getQuantityChangeColor(revision.stats.totalQuantityChange)}`}>
              {getQuantityChangeIcon(revision.stats.totalQuantityChange)}
              {revision.stats.totalQuantityChange > 0 ? "+" : ""}{revision.stats.totalQuantityChange}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revision Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Детайли за ревизията
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Дата и час:</span>
                <span>{formatDate(revision.createdAt)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Склад:</span>
                <Badge variant="outline">{revision.storage.name}</Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Извършил ревизията:</span>
                <span>{revision.user.name || revision.user.email}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Статистика</h4>
                <div className="space-y-1 text-sm">
                  <div>Продукти с промени: {revision.stats.productsWithChanges}</div>
                  <div>Продукти без промени: {revision.stats.totalProducts - revision.stats.productsWithChanges}</div>
                  <div>Процент промени: {revision.stats.totalProducts > 0 ? Math.round((revision.stats.productsWithChanges / revision.stats.totalProducts) * 100) : 0}%</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Продукти в ревизията</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Продукт</TableHead>
                <TableHead>Баркод</TableHead>
                <TableHead>Код</TableHead>
                <TableHead>Оригинално количество</TableHead>
                <TableHead>Проверено количество</TableHead>
                <TableHead>Промяна</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revision.products.map((product) => {
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
                      {change !== 0 ? (
                        <Badge variant={change > 0 ? "default" : "destructive"}>
                          {change > 0 ? "+" : ""}{change}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Без промяна</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Products with Changes Only */}
      {revision.stats.productsWithChanges > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Продукти с промени</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Продукт</TableHead>
                  <TableHead>Баркод</TableHead>
                  <TableHead>От</TableHead>
                  <TableHead>Към</TableHead>
                  <TableHead>Промяна</TableHead>
                  <TableHead>Тип промяна</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revision.products
                  .filter((product) => product.checkedQuantity !== product.originalQuantity)
                  .map((product) => {
                    const change = product.checkedQuantity - product.originalQuantity;
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.product.name}
                        </TableCell>
                        <TableCell>{product.product.barcode}</TableCell>
                        <TableCell>{product.originalQuantity}</TableCell>
                        <TableCell>{product.checkedQuantity}</TableCell>
                        <TableCell>
                          <Badge variant={change > 0 ? "default" : "destructive"}>
                            {change > 0 ? "+" : ""}{change}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getQuantityChangeIcon(change)}
                            <span className="text-sm">
                              {change > 0 ? "Увеличение" : "Намаление"}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
