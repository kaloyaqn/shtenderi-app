"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ArrowLeft, Package, Store, Search, Plus, Minus, Trash2 } from "lucide-react";
import useSWR from "swr";
import BasicHeader from "@/components/BasicHeader";
import { useSession } from "@/lib/session-context";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminVirtualSalePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [sourceStorageId, setSourceStorageId] = useState("");
  const [destinationStandId, setDestinationStandId] = useState("");
  const [selectedProducts, setSelectedProducts] = useState(new Map());
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const barcodeInputRef = useRef(null);
  const initializedFromUrl = useRef(false);

  // Auto-select storage from URL params (only once on mount)
  useEffect(() => {
    const storageIdFromUrl = searchParams.get("sourceStorageId");
    if (storageIdFromUrl && !initializedFromUrl.current) {
      setSourceStorageId(storageIdFromUrl);
      initializedFromUrl.current = true;
    }
  }, [searchParams]);

  // Check if user is admin
  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="container mx-auto space-y-4">
        <BasicHeader title="Достъп отказан" />
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Само администратори имат достъп до тази функция</p>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch storages and stands
  const { data: storages = [] } = useSWR("/api/storages", fetcher);
  const { data: stands = [] } = useSWR("/api/stands", fetcher);

  // Fetch storage products when storage is selected
  useEffect(() => {
    if (sourceStorageId) {
      fetchStorageProducts();
    } else {
      setSelectedProducts(new Map());
    }
  }, [sourceStorageId]);

  // Get all products from storage for display
  const allStorageProducts = Array.from(selectedProducts.entries()).map(([productId, data]) => ({
    productId,
    product: data.product,
    availableQuantity: data.availableQuantity,
    selectedQuantity: data.selectedQuantity,
  }));

  // Filter products based on search term
  const filteredStorageProducts = allStorageProducts.filter(({ product }) => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(search) ||
      product.barcode.toLowerCase().includes(search) ||
      (product.pcode && product.pcode.toLowerCase().includes(search))
    );
  });

  const fetchStorageProducts = async () => {
    try {
      const response = await fetch(`/api/storage-revisions?storageId=${sourceStorageId}`);
      if (!response.ok) throw new Error("Failed to fetch storage products");
      const products = await response.json();
      
      // Initialize selected products map
      const initialProducts = new Map();
      products.forEach((sp) => {
        initialProducts.set(sp.productId, {
          product: sp.product,
          availableQuantity: sp.quantity,
          selectedQuantity: 0,
        });
      });
      setSelectedProducts(initialProducts);
    } catch (error) {
      console.error("Error fetching storage products:", error);
      toast.error("Грешка при зареждане на продуктите");
    }
  };

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcodeInput.trim() || !sourceStorageId) return;

    const barcode = barcodeInput.trim();
    setBarcodeInput("");

    // Find product by barcode
    const productEntry = Array.from(selectedProducts.entries()).find(
      ([_, data]) => data.product.barcode === barcode
    );

    if (productEntry) {
      const [productId, data] = productEntry;
      if (data.selectedQuantity < data.availableQuantity) {
        setSelectedProducts(
          new Map(
            selectedProducts.set(productId, {
              ...data,
              selectedQuantity: data.selectedQuantity + 1,
            })
          )
        );
        toast.success(`Добавен ${data.product.name} (${data.selectedQuantity + 1})`);
      } else {
        toast.error(`Няма достатъчно количество за ${data.product.name}`);
      }
    } else {
      toast.error(`Продукт с баркод ${barcode} не съществува в склада`);
    }

    // Focus back to barcode input
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 0) return;
    
    const product = selectedProducts.get(productId);
    if (newQuantity > product.availableQuantity) {
      toast.error(`Няма достатъчно количество. Доступно: ${product.availableQuantity}`);
      return;
    }

    setSelectedProducts(
      new Map(
        selectedProducts.set(productId, {
          ...product,
          selectedQuantity: newQuantity,
        })
      )
    );
  };

  const removeProduct = (productId) => {
    const newMap = new Map(selectedProducts);
    const product = newMap.get(productId);
    newMap.set(productId, {
      ...product,
      selectedQuantity: 0,
    });
    setSelectedProducts(newMap);
  };

  const getSelectedProductsList = () => {
    return Array.from(selectedProducts.entries())
      .filter(([_, data]) => data.selectedQuantity > 0)
      .map(([productId, data]) => ({
        productId,
        quantity: data.selectedQuantity,
      }));
  };

  const handleConfirmSale = async () => {
    const productsList = getSelectedProductsList();
    if (productsList.length === 0) {
      toast.error("Изберете поне един продукт");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/virtual-sale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceStorageId,
          destinationStandId,
          products: productsList,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create virtual sale");
      }

      toast.success("Виртуалната продажба е създадена успешно!");
      setShowConfirmDialog(false);
      
      // Redirect to the created revision
      const responseData = await response.json();
      if (responseData.revision?.id) {
        router.push(`/dashboard/revisions/${responseData.revision.id}`);
      } else {
        // Fallback: redirect to revisions list
        router.push("/dashboard/storage-revisions");
      }
    } catch (error) {
      console.error("Error creating virtual sale:", error);
      toast.error(error.message || "Грешка при създаване на виртуалната продажба");
      setIsLoading(false);
    }
  };

  const selectedProductsList = getSelectedProductsList();
  const sourceStorage = storages.find((s) => s.id === sourceStorageId);
  const destinationStand = stands.find((s) => s.id === destinationStandId);

  return (
    <div className="container mx-auto space-y-4">
        <BasicHeader 
          title="Админ виртуална продажба" 
          subtitle="Създаване на продажба без физическо чекиране"
          hasBackButton={true}
        />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Storage and Stand Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Избор на склад и щанд
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="source-storage">Изходен склад</Label>
              <Select value={sourceStorageId} onValueChange={setSourceStorageId}>
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

            <div className="grid gap-2">
              <Label htmlFor="destination-stand">Дестинационен щанд</Label>
              <Select value={destinationStandId} onValueChange={setDestinationStandId}>
                <SelectTrigger>
                  <SelectValue placeholder="Избери щанд" />
                </SelectTrigger>
                <SelectContent>
                  {stands.map((stand) => (
                    <SelectItem key={stand.id} value={stand.id}>
                      {stand.name} - {stand.store?.partner?.name || 'Без партньор'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {sourceStorage && destinationStand && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Резюме</h3>
                <div className="text-sm space-y-1">
                  <div>От склад: <strong>{sourceStorage.name}</strong></div>
                  <div>Към щанд: <strong>{destinationStand.name}</strong></div>
                  <div>Партньор: <strong>{destinationStand.store?.partner?.name || 'Без партньор'}</strong></div>
                  <div>Избрани продукти: <strong>{selectedProductsList.length}</strong></div>
                </div>
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
                  disabled={!sourceStorageId || !destinationStandId}
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={!sourceStorageId || !destinationStandId || !barcodeInput.trim()}>
                <Search className="h-4 w-4 mr-2" />
                Добави продукт
              </Button>
            </form>

            {selectedProductsList.length > 0 && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={!sourceStorageId || !destinationStandId}
                    className="flex-1"
                  >
                    Създай виртуална продажба
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Products Table */}
      {selectedProductsList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Избрани продукти за продажба</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Продукт</TableHead>
                  <TableHead>Баркод</TableHead>
                  <TableHead>Доступно количество</TableHead>
                  <TableHead>Избрано количество</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedProductsList.map(({ productId, quantity }) => {
                  const product = selectedProducts.get(productId);
                  return (
                    <TableRow key={productId}>
                      <TableCell className="font-medium">
                        {product.product.name}
                      </TableCell>
                      <TableCell>{product.product.barcode}</TableCell>
                      <TableCell>{product.availableQuantity}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(productId, quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="min-w-[2rem] text-center">
                            {quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(productId, quantity + 1)}
                            disabled={quantity >= product.availableQuantity}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeProduct(productId)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Storage Products Table */}
      {sourceStorageId && allStorageProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Продукти в склада: {sourceStorage?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              Това са всички продукти, налични в склада. Можете да изберете продукти чрез сканиране или да добавите директно.
            </div>
            
            {/* Search Input */}
            <div className="mb-4 flex items-center gap-4">
              <Input
                placeholder="Търси по име, баркод или код..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
              {searchTerm && (
                <span className="text-sm text-muted-foreground">
                  Показва {filteredStorageProducts.length} от {allStorageProducts.length} продукта
                </span>
              )}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Продукт</TableHead>
                  <TableHead>Баркод</TableHead>
                  <TableHead>Код</TableHead>
                  <TableHead>Налично количество</TableHead>
                  <TableHead>Избрано количество</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStorageProducts.map(({ productId, product, availableQuantity, selectedQuantity }) => (
                  <TableRow key={productId}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.barcode}</TableCell>
                    <TableCell>{product.pcode || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{availableQuantity}</Badge>
                    </TableCell>
                    <TableCell>
                      {selectedQuantity > 0 ? (
                        <Badge variant="default">{selectedQuantity}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(productId, selectedQuantity + 1)}
                          disabled={selectedQuantity >= availableQuantity || !destinationStandId}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        {selectedQuantity > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(productId, selectedQuantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Потвърди виртуална продажба</AlertDialogTitle>
            <AlertDialogDescription>
              Ще се създаде продажба с избраните продукти. Количествата ще се намалят от склада,
              но няма да се променят наличностите на щанда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <div className="font-semibold">От склад:</div>
                <div>{sourceStorage?.name}</div>
              </div>
              <div>
                <div className="font-semibold">Към щанд:</div>
                <div>{destinationStand?.name}</div>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Продукт</TableHead>
                    <TableHead>Баркод</TableHead>
                    <TableHead>Количество</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedProductsList.map(({ productId, quantity }) => {
                    const product = selectedProducts.get(productId);
                    return (
                      <TableRow key={productId}>
                        <TableCell className="font-medium">
                          {product.product.name}
                        </TableCell>
                        <TableCell>{product.product.barcode}</TableCell>
                        <TableCell>{quantity}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Отказ</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSale} disabled={isLoading}>
              {isLoading ? "Създава..." : "Потвърди"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
