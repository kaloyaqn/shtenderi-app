"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Save, Eye, Package, ArrowLeft } from "lucide-react";
import useSWR from "swr";
import BasicHeader from "@/components/BasicHeader";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function CreateStorageRevisionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedStorageId, setSelectedStorageId] = useState("");
  const [storageProducts, setStorageProducts] = useState([]);
  const [checkedProducts, setCheckedProducts] = useState(new Map());
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showChangesDialog, setShowChangesDialog] = useState(false);
  const [changes, setChanges] = useState([]);
  const barcodeInputRef = useRef(null);
  const [lastScannedId, setLastScannedId] = useState(null);

  // Fetch storages
  const { data: storages = [] } = useSWR("/api/storages", fetcher);

  // Auto-select storage from URL params
  useEffect(() => {
    const storageIdFromUrl = searchParams.get("storageId");
    if (storageIdFromUrl && storageIdFromUrl !== selectedStorageId) {
      setSelectedStorageId(storageIdFromUrl);
    }
  }, [searchParams, selectedStorageId]);

  // Fetch storage products when storage is selected
  useEffect(() => {
    if (selectedStorageId) {
      fetchStorageProducts();
    } else {
      setStorageProducts([]);
      setCheckedProducts(new Map());
    }
  }, [selectedStorageId]);

  const fetchStorageProducts = async () => {
    try {
      const response = await fetch(`/api/storage-revisions?storageId=${selectedStorageId}`);
      if (!response.ok) throw new Error("Failed to fetch storage products");
      const products = await response.json();
      setStorageProducts(products);
      
      // Initialize checked products with original quantities
      const initialChecked = new Map();
      products.forEach((sp) => {
        initialChecked.set(sp.productId, {
          product: sp.product,
          originalQuantity: sp.quantity,
          checkedQuantity: 0,
        });
      });
      setCheckedProducts(initialChecked);
    } catch (error) {
      console.error("Error fetching storage products:", error);
      toast.error("Грешка при зареждане на продуктите");
    }
  };

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim() || !selectedStorageId) return;

    const barcode = barcodeInput.trim();
    setBarcodeInput("");

    // Check if product exists in storage
    const existingProduct = storageProducts.find(
      (sp) => sp.product.barcode === barcode
    );

    if (existingProduct) {
      // Product exists in storage, increment checked quantity (immutable update)
      const current = checkedProducts.get(existingProduct.productId);
      if (current) {
        const next = new Map(checkedProducts);
        const nextQty = (current.checkedQuantity || 0) + 1;
        next.set(existingProduct.productId, {
          ...current,
          checkedQuantity: nextQty,
        });
        setCheckedProducts(next);
        setLastScannedId(existingProduct.productId);
        toast.success(`Добавен ${existingProduct.product.name} (${nextQty})`);
      }
    } else {
      // Product doesn't exist in storage, show error
      toast.error(`Продукт с баркод ${barcode} не съществува в склада`);
    }

    // Focus back to barcode input
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  const updateCheckedQuantity = (productId, newQuantity) => {
    if (newQuantity < 0) return;
    
    const current = checkedProducts.get(productId);
    if (!current) return;
    const next = new Map(checkedProducts);
    next.set(productId, {
      ...current,
      checkedQuantity: newQuantity,
    });
    setCheckedProducts(next);
  };

  const calculateChanges = () => {
    const changesList = [];
    checkedProducts.forEach((product, productId) => {
      const difference = product.checkedQuantity - product.originalQuantity;
      if (difference !== 0) {
        changesList.push({
          productId,
          product: product.product,
          originalQuantity: product.originalQuantity,
          checkedQuantity: product.checkedQuantity,
          difference,
        });
      }
    });
    return changesList;
  };

  const handleShowChanges = () => {
    const changesList = calculateChanges();
    if (changesList.length === 0) {
      toast.info("Няма промени за запазване");
      return;
    }
    setChanges(changesList);
    setShowChangesDialog(true);
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const checkedProductsList = Array.from(checkedProducts.entries()).map(
        ([productId, product]) => ({
          productId,
          originalQuantity: product.originalQuantity,
          checkedQuantity: product.checkedQuantity,
        })
      );

      const response = await fetch("/api/storage-revisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storageId: selectedStorageId,
          checkedProducts: checkedProductsList,
        }),
      });

      if (!response.ok) throw new Error("Failed to save storage revision");

      toast.success("Ревизията е запазена успешно!");
      setShowChangesDialog(false);
      
      // Navigate back to revisions list
      router.push("/dashboard/storage-revisions");
    } catch (error) {
      console.error("Error saving storage revision:", error);
      toast.error("Грешка при запазване на ревизията");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedStorage = storages.find((s) => s.id === selectedStorageId);

  return (
    <div className="container mx-auto space-y-4">
        <BasicHeader 
          title="Нова складова ревизия" 
          subtitle="Избери склад, чекирай продуктите, обнови наличностите"
          hasBackButton={true}
        />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Storage Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Избор на склад
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="storage">Склад</Label>
              <Select value={selectedStorageId} onValueChange={setSelectedStorageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Избери склад" />
                </SelectTrigger>
                <SelectContent>
                  {storages.map((storage) => (
                    <SelectItem key={storage.id} value={storage.id}>
                      {storage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStorage && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">
                  Продукти в склада: {selectedStorage.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Общо продукти: {storageProducts.length}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Barcode Scanning */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Сканиране на продукти
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleBarcodeSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="barcode">Баркод</Label>
                <Input
                  ref={barcodeInputRef}
                  id="barcode"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Сканирай или въведи баркод"
                  disabled={!selectedStorageId}
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={!selectedStorageId || !barcodeInput.trim()}>
                <Search className="h-4 w-4 mr-2" />
                Добави продукт
              </Button>
            </form>

            {checkedProducts.size > 0 && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={handleShowChanges}
                    variant="outline"
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Покажи промени
                  </Button>
                  <Button
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Запазва..." : "Запази промени"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      {checkedProducts.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Проверени продукти</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search in checked list */}
            <div className="mb-4">
              <Input
                placeholder="Търси по име, баркод или код..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Продукт</TableHead>
                  <TableHead>Баркод</TableHead>
                  <TableHead>Код</TableHead>
                  <TableHead>Оригинално количество</TableHead>
                  <TableHead>Проверено количество</TableHead>
                  <TableHead>Промяна</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from(checkedProducts.entries())
                  .sort((a, b) => {
                    if (!lastScannedId) return 0;
                    if (a[0] === lastScannedId) return -1;
                    if (b[0] === lastScannedId) return 1;
                    return 0;
                  })
                  .filter(([_, p]) => {
                    if (!searchTerm.trim()) return true;
                    const s = searchTerm.toLowerCase();
                    return (
                      p.product.name?.toLowerCase().includes(s) ||
                      p.product.barcode?.toLowerCase().includes(s) ||
                      p.product.pcode?.toLowerCase().includes(s)
                    );
                  })
                  .map(([productId, product]) => {
                  const difference = product.checkedQuantity - product.originalQuantity;
                  return (
                    <TableRow key={productId}>
                      <TableCell className="font-medium">
                        {product.product.name}
                      </TableCell>
                      <TableCell>{product.product.barcode}</TableCell>
                      <TableCell>{product.product.pcode || "-"}</TableCell>
                      <TableCell>{product.originalQuantity}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateCheckedQuantity(productId, product.checkedQuantity - 1)
                            }
                          >
                            -
                          </Button>
                          <span className="min-w-[2rem] text-center">
                            {product.checkedQuantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateCheckedQuantity(productId, product.checkedQuantity + 1)
                            }
                          >
                            +
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {difference !== 0 && (
                          <Badge variant={difference > 0 ? "default" : "destructive"}>
                            {difference > 0 ? "+" : ""}{difference}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newMap = new Map(checkedProducts);
                            newMap.delete(productId);
                            setCheckedProducts(newMap);
                          }}
                        >
                          Премахни
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Full Storage Products (quick add like virtual sale) */}
      {selectedStorageId && storageProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Всички продукти в склада
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <Input
                placeholder="Търси по име, баркод или код..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Продукт</TableHead>
                  <TableHead>Баркод</TableHead>
                  <TableHead>Код</TableHead>
                  <TableHead>Оригинално</TableHead>
                  <TableHead>Проверено</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storageProducts
                  .filter((sp) => {
                    if (!searchTerm.trim()) return true;
                    const s = searchTerm.toLowerCase();
                    return (
                      sp.product.name?.toLowerCase().includes(s) ||
                      sp.product.barcode?.toLowerCase().includes(s) ||
                      sp.product.pcode?.toLowerCase().includes(s)
                    );
                  })
                  .map((sp) => {
                    const cp = checkedProducts.get(sp.productId);
                    const checkedQty = cp?.checkedQuantity || 0;
                    return (
                      <TableRow key={sp.id}>
                        <TableCell className="font-medium">{sp.product.name}</TableCell>
                        <TableCell>{sp.product.barcode}</TableCell>
                        <TableCell>{sp.product.pcode || "-"}</TableCell>
                        <TableCell>{sp.quantity}</TableCell>
                        <TableCell>
                          <Badge variant={checkedQty > 0 ? "default" : "outline"}>{checkedQty}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCheckedQuantity(sp.productId, Math.max(0, checkedQty - 1))}
                            >
                              -
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCheckedQuantity(sp.productId, checkedQty + 1)}
                            >
                              +
                            </Button>
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

      {/* Changes Dialog */}
      <AlertDialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Промени в склада</AlertDialogTitle>
            <AlertDialogDescription>
              Следните промени ще бъдат приложени към склада:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Продукт</TableHead>
                  <TableHead>Баркод</TableHead>
                  <TableHead>От</TableHead>
                  <TableHead>Към</TableHead>
                  <TableHead>Промяна</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changes.map((change) => (
                  <TableRow key={change.productId}>
                    <TableCell className="font-medium">
                      {change.product.name}
                    </TableCell>
                    <TableCell>{change.product.barcode}</TableCell>
                    <TableCell>{change.originalQuantity}</TableCell>
                    <TableCell>{change.checkedQuantity}</TableCell>
                    <TableCell>
                      <Badge variant={change.difference > 0 ? "default" : "destructive"}>
                        {change.difference > 0 ? "+" : ""}{change.difference}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Отказ</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveChanges} disabled={isLoading}>
              {isLoading ? "Запазва..." : "Запази промени"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
