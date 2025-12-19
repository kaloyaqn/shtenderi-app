"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Plus,
  Pencil,
  Upload,
  Barcode,
  ArrowRightLeft,
  FilePlus,
  PlusIcon,
  ImportIcon,
  Search,
  Edit,
  Trash2,
  Warehouse,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import EditQuantityDialog from "./_components/edit-quantity-dialog";
import { XMLParser } from "fast-xml-parser";
import { toast } from "sonner";
import Link from "next/link";
import { useSession } from "@/lib/session-context";
import LoadingScreen from "@/components/LoadingScreen";
import {
  IconTransfer,
  IconTransferIn,
  IconTruckReturn,
} from "@tabler/icons-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import PageHelpTour from "@/components/help/PageHelpTour";
import BasicHeader from "@/components/BasicHeader";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerTitle } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { createRegion } from "@/lib/regions/regions";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";

export default function StandDetailPage({ params }) {
  const router = useRouter();
  const { standId } = React.use(params);
  const fileInputRef = useRef();

  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productOnStandToEdit, setProductOnStandToEdit] = useState(null);
  const [productOnStandToDelete, setProductOnStandToDelete] = useState(null);
  const [importError, setImportError] = useState(null);
  const [search, setSearch] = useState("");
  const [regionId, setRegionId] = useState("");

  const [inactiveProductsPrompt, setInactiveProductsPrompt] = useState({
    open: false,
    products: [],
    toImport: [],
    fileName: "",
    prices: {},
  });

  const [fileConfirmationPrompt, setFileConfirmationPrompt] = useState({
    open: false,
    fileName: "",
    products: [],
    activate: false,
  });

  const { data: session } = useSession();
  const userIsAdmin = session?.user?.role === "ADMIN";
  const isMobile = useIsMobile();

  // SWR hooks
  const {
    data: stand,
    error: standError,
    isLoading: standLoading,
    mutate: mutateStand,
  } = useSWR(`/api/stands/${standId}`, fetcher);

  const {
    data: productsOnStand = [],
    error: productsError,
    isLoading: productsLoading,
    mutate: mutateProducts,
  } = useSWR(`/api/stands/${standId}/products`, fetcher);

  const {
    data: stats,
    error: statsError,
    mutate: mutateStats,
  } = useSWR(`/api/stands/${standId}/stats`, fetcher);

  const {
    data: regions = [],
    isLoading: regionsLoading,
    error: regionsError,
  } = useSWR("/api/regions", fetcher);

  // Set regionId when stand data loads
  useEffect(() => {
    if (stand?.region?.id && !regionId) {
      setRegionId(stand.region.id);
    }
  }, [stand?.region?.id]);

  // Reset regionId when drawer opens to current stand region
  useEffect(() => {
    if (drawerIsOpen && stand?.region?.id) {
      setRegionId(stand.region.id);
    }
  }, [drawerIsOpen, stand?.region?.id]);

  const refreshData = () => {
    mutateStand();
    mutateProducts();
    mutateStats();
  };

  const handlePriceChange = (barcode, value) => {
    const newPrice = parseFloat(value) || 0;
    setInactiveProductsPrompt((prev) => ({
      ...prev,
      prices: {
        ...prev.prices,
        [barcode]: newPrice,
      },
    }));
  };

  const handleDelete = async () => {
    if (!productOnStandToDelete) return;

    try {
      const response = await fetch(
        `/api/stands/${standId}/products/${productOnStandToDelete.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove product");
      }
      refreshData();
    } catch (err) {
      console.error("Error removing product:", err);
      toast.error(err.message);
    } finally {
      setDeleteDialogOpen(false);
      setProductOnStandToDelete(null);
    }
  };

  const handleFileConfirmation = async () => {
    if (!fileConfirmationPrompt.fileName) {
      toast.error("Filename is missing. Please try again.");
      return;
    }
    await proceedWithImport(
      fileConfirmationPrompt.products,
      fileConfirmationPrompt.activate,
      fileConfirmationPrompt.fileName
    );
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    setImportError(null);
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "",
      });
      const xml = parser.parse(text);
      const goods = xml.info?.goods?.good || [];
      const productsToImport = (Array.isArray(goods) ? goods : [goods])
        .map((good) => ({
          barcode: String(good.barcode),
          quantity: Number(good.quantity),
          name: good.name,
          clientPrice: parseFloat(good.price) || 0,
        }))
        .filter((p) => p.barcode && !isNaN(p.quantity));

      if (productsToImport.length === 0) {
        toast.error("XML файлът не съдържа продукти или е в грешен формат.");
        return;
      }

      const barcodes = productsToImport.map((p) => p.barcode);
      const checkRes = await fetch("/api/products/check-inactive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcodes }),
      });

      const { inactiveProducts } = await checkRes.json();

      if (inactiveProducts && inactiveProducts.length > 0) {
        const initialPrices = {};
        inactiveProducts.forEach((product) => {
          const matchingImportProduct = productsToImport.find(
            (p) => p.barcode === product.barcode
          );
          initialPrices[product.barcode] = matchingImportProduct?.clientPrice || 0;
        });

        setInactiveProductsPrompt({
          open: true,
          products: inactiveProducts,
          toImport: productsToImport,
          fileName: file.name,
          prices: initialPrices,
        });
      } else {
        setFileConfirmationPrompt({
          open: true,
          fileName: file.name,
          products: productsToImport,
          activate: false,
        });
      }
    } catch (err) {
      console.error("File change or check error:", err);
      setImportError(err.message);
      toast.error(err.message || "Възникна грешка при обработка на файла.");
    } finally {
      e.target.value = "";
    }
  };

  const proceedWithImport = async (
    products,
    activate = false,
    fileName,
    updatePrices = null
  ) => {
    let productsToSend = products;
    if (activate) {
      const inactiveBarcodes = new Set(
        inactiveProductsPrompt.products.map((p) => p.barcode)
      );
      productsToSend = products.map((p) =>
        inactiveBarcodes.has(p.barcode) ? { ...p, shouldActivate: true } : p
      );
    }

    if (fileName && !fileConfirmationPrompt.open && !updatePrices) {
      setFileConfirmationPrompt({
        open: true,
        fileName: fileName,
        products: productsToSend,
        activate: activate,
      });
      return;
    }

    await toast.promise(
      (async () => {
        if (!fileName) {
          throw new Error("Filename is required for import");
        }

        if (updatePrices && Object.keys(updatePrices).length > 0) {
          const updateResponse = await fetch("/api/products/update-prices", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prices: updatePrices }),
          });

          if (!updateResponse.ok) {
            const error = await updateResponse.json();
            throw new Error(error.error || "Failed to update product prices");
          }
        }

        const response = await fetch(`/api/stands/${standId}/import-xml`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: productsToSend, fileName }),
        });

        if (!response.ok) {
          const err = await response.json();
          if (err?.error?.includes("file with this name")) {
            throw new Error("Файл с това име е импортиран наскоро!");
          }
          throw new Error(err.error || "Import failed");
        }
        refreshData();
      })(),
      {
        loading: "Импортиране...",
        success: "Импортирането е успешно!",
        error: (err) => err.message || "Възникна грешка при импортиране",
      }
    );

    setFileConfirmationPrompt({
      open: false,
      fileName: "",
      products: [],
      activate: false,
    });
  };

  const editStand = async (e) => {
    e.preventDefault();
    const data = { regionId };

    try {
      const res = await fetch(`/api/stands/${standId}/region`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Грешка при редактиране на щанд");
      }

      toast.success("Успешно обновихте щендера");
      setDrawerIsOpen(false);
      mutateStand();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    {
      id: "name",
      accessorKey: "product.name",
      header: "Продукт",
    },
    {
      id: "barcode",
      accessorKey: "product.barcode",
      header: "Баркод",
    },
    {
      id: "pcode",
      accessorKey: "product.pcode",
      header: "Код",
    },
    {
      accessorKey: "product.pcd",
      header: "ПЦД",
    },
    {
      accessorKey: "effectivePrice",
      header: "Продажна цена",
      cell: ({ row }) => {
        const price = row.original.effectivePrice;
        return price !== undefined ? `${price.toFixed(2)} лв.` : "-";
      },
    },
    {
      accessorKey: "quantity",
      header: "Количество на щанда",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const standProduct = row.original;
        const canDelete = standProduct.quantity === 0;
        return (
          <div className="flex items-center gap-2 md:flex-row flex-col md:justify-start justify-center w-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setProductOnStandToEdit(standProduct);
                setEditDialogOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (canDelete) {
                  setProductOnStandToDelete(standProduct);
                  setDeleteDialogOpen(true);
                }
              }}
              disabled={!canDelete}
              title={canDelete ? "" : "Може да изтриете само продукти с количество 0"}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const isLoading = standLoading || productsLoading;
  const error = standError || productsError;

  if (isLoading) return <LoadingScreen />;
  if (error) return <div className="text-red-500">Грешка: {error.message}</div>;
  if (!stand) return <div>Щандът не е намерен.</div>;

  if (isMobile) {
    const filteredProducts = productsOnStand.filter((product) => {
      const q = search.toLowerCase();
      return (
        product.product?.name?.toLowerCase().includes(q) ||
        product.product?.barcode?.toLowerCase().includes(q)
      );
    });
    const totalProducts = filteredProducts.reduce((sum, p) => sum + p.quantity, 0);
    const outOfStockCount = filteredProducts.filter((p) => p.quantity === 0).length;

    return (
      <>
        <PageHelpTour />
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <BasicHeader
            title={`${stand.name}`}
            subtitle={"Управление на щендер и зареждане на стока"}
            hasBackButton
          />

          <div className="flex-1 p-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Card id="card">
                <CardContent className="p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{totalProducts}</p>
                  <p className="text-xs text-gray-500">Общо</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{filteredProducts.length}</p>
                  <p className="text-xs text-gray-500">Позиции</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-lg font-bold text-red-600">{outOfStockCount}</p>
                  <p className="text-xs text-gray-500">Изчерпани</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full h-12 bg-transparent"
                onClick={() =>
                  router.push(`/dashboard/resupply?mode=stand-to-storage&standid=${stand.id}`)
                }
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Изтегли стока
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 bg-transparent"
                onClick={() => router.push(`/dashboard/resupply?source=stand`)}
              >
                <IconTransfer className="h-4 w-4 mr-2" />
                Трансфер
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 bg-transparent"
                onClick={() => setDrawerIsOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Промени регион
              </Button>
              <Button
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => router.push(`/dashboard/stands/${stand.id}/revision`)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Проверка на щанд
              </Button>
            </div>

            <Drawer open={drawerIsOpen} onOpenChange={setDrawerIsOpen}>
              <DrawerContent className="p-4">
                <DrawerTitle className="text-center">Промени регион на щендер</DrawerTitle>
                <DrawerDescription className="text-center">Въведи нужните данни.</DrawerDescription>
                <form onSubmit={editStand}>
                  <div className="grid gap-2 mt-4">
                    <Label htmlFor="region">Регион на щанда</Label>
                    <Combobox
                      value={regionId}
                      onValueChange={(value) => setRegionId(value)}
                      options={regions.map((region) => ({
                        key: region.id,
                        label: region.name,
                        value: region.id,
                      }))}
                      placeholder="Избери регион"
                      emptyContent={(text) => (
                        <Button
                          variant="outline"
                          type="button"
                          className="w-full mx-4"
                          onClick={() => createRegion(text)}
                        >
                          <Plus /> Създай регион "{text}"
                        </Button>
                      )}
                    />
                  </div>
                  <Button className="mt-4 w-full">Запази</Button>
                </form>
              </DrawerContent>
            </Drawer>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Потърси..."
                className="pl-10 h-12"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Продукти</h2>
              {userIsAdmin && (
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => {}}>
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="border border-gray-200 py-0">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm mb-2 leading-tight">
                          {product.product?.name}
                        </h3>
                      </div>
                      {userIsAdmin && (
                        <div className="flex items-center space-x-2 ml-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setProductOnStandToEdit(product);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setProductOnStandToDelete(product);
                              setDeleteDialogOpen(true);
                            }}
                            disabled={product.quantity !== 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="space">
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500 mb-1">Баркод</p>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {product.product?.barcode}
                        </code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Количество на щанда</span>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={product.quantity > 0 ? "outline" : "destructive"}
                            className="font-mono text-xs"
                          >
                            {product.quantity}
                          </Badge>
                          {product.quantity === 0 && (
                            <Badge variant="secondary" className="text-xs">Изчерпан</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <EditQuantityDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            standProduct={productOnStandToEdit}
            onProductUpdated={refreshData}
          />

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Премахване на продукт</AlertDialogTitle>
                <AlertDialogDescription>
                  Сигурни ли сте, че искате да премахнете този продукт от щанда? Това действие не може да бъде отменено.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отказ</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Изтрий</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </>
    );
  }

  return (
    <div className="md:p-0 p-2">
      <div className="flex md:flex-row flex-col md:w-auto w-full justify-between items-center pb-4 border-b mb-4">
        <div className="flex flex-col md:w-auto w-full mb-2 md:mb-0">
          <h1 className="text-2xl font-bold text-left text-gray-900">{stand.name}</h1>
          <p className="text-base text-gray-600">Управление на щендер и зареждане на стока</p>
        </div>

        <div className="flex md:flex-row w-full md:w-auto flex-col items-center gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              const res = await fetch(`/api/stands/${standId}/export-xml`);
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `stand-${standId}.xml`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            }}
            className="md:flex hidden"
          >
            <FilePlus />
            Експорт
          </Button>

          <Link className="w-full" href={`/dashboard/resupply?mode=stand-to-storage&standid=${standId}`}>
            <Button variant="outline">
              <IconTruckReturn />
              Изтегли стока
            </Button>
          </Link>

          <Link className="md:w-auto w-full" href={`/dashboard/resupply?source=stand`}>
            <Button variant="outline">
              <IconTransferIn /> Презареди от склад
            </Button>
          </Link>

          <div className="h-6 w-px md:block hidden bg-gray-300"></div>

          <Link className="md:w-auto w-full" href={`/dashboard/stands/${standId}/revision`}>
            <Button>
              <Barcode />
              Проверка на щанд
            </Button>
          </Link>
        </div>
      </div>

      {userIsAdmin && (
        <div className="my-4 flex md:flex-row flex-col justify-between items-center gap-2">
          <Card className="w-full">
            <CardContent>
              <CardTitle className="text-lg">Продажби</CardTitle>
              <h1 className="text-xl font-bold mt-1">{stats?.totalSalesValue} лв.</h1>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardContent>
              <CardTitle className="text-lg">Продажби {"(30 дни)"}</CardTitle>
              <h1 className="text-xl font-bold mt-1">{stats?.salesLast30Days} лв.</h1>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardContent>
              <CardTitle className="text-lg">Брой продажби {"(30 дни)"}</CardTitle>
              <h1 className="text-xl font-bold mt-1">{stats?.salesCountLast30Days}</h1>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardContent>
              <CardTitle className="text-lg">Продукти (30 дни)</CardTitle>
              <h1 className="text-xl font-bold mt-1">{stats?.itemsSoldLast30Days}</h1>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto p-0">
        <DataTable
          columns={columns}
          data={productsOnStand}
          filterableColumns={[
            { id: "name", title: "Име на продукт" },
            { id: "barcode", title: "Баркод на продукт" },
            { id: "pcode", title: "Код на продукт" },
          ]}
        />
      </div>

      <EditQuantityDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        standProduct={productOnStandToEdit}
        onProductUpdated={refreshData}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Премахване на продукт</AlertDialogTitle>
            <AlertDialogDescription>
              Сигурни ли сте, че искате да премахнете {productOnStandToDelete?.product.name} от този щанд?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отказ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Премахни</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={inactiveProductsPrompt.open}
        onOpenChange={(open) =>
          !open && setInactiveProductsPrompt({ open: false, products: [], toImport: [], fileName: "", prices: {} })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Открити са продукти без цена</AlertDialogTitle>
            <AlertDialogDescription>
              Следните продукти от XML файла нямат зададена цена в системата (clientPrice = 0). Можете да зададете цени за тях:
              <div className="mt-4 space-y-3">
                {inactiveProductsPrompt.products.map((p) => (
                  <div key={p.barcode} className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.barcode}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Цена:</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={inactiveProductsPrompt.prices[p.barcode] || 0}
                        onChange={(e) => handlePriceChange(p.barcode, e.target.value)}
                        className="w-24 h-8 text-sm"
                        placeholder="0.00"
                      />
                      <span className="text-sm text-gray-500">лв.</span>
                    </div>
                  </div>
                ))}
              </div>
              Желаете ли да обновите цените и да продължите с импорта, или да ги пропуснете?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                const inactiveBarcodes = new Set(inactiveProductsPrompt.products.map((p) => p.barcode));
                const filteredProducts = inactiveProductsPrompt.toImport.filter(
                  (p) => !inactiveBarcodes.has(p.barcode)
                );
                proceedWithImport(filteredProducts, false, inactiveProductsPrompt.fileName);
                setInactiveProductsPrompt({ open: false, products: [], toImport: [], fileName: "", prices: {} });
              }}
            >
              Пропусни неактивните
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                proceedWithImport(
                  inactiveProductsPrompt.toImport,
                  false,
                  inactiveProductsPrompt.fileName,
                  inactiveProductsPrompt.prices
                );
                setInactiveProductsPrompt({ open: false, products: [], toImport: [], fileName: "", prices: {} });
              }}
            >
              Обнови цени и импортирай
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={fileConfirmationPrompt.open}
        onOpenChange={(open) =>
          !open && setFileConfirmationPrompt({ open: false, fileName: "", products: [], activate: false })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Потвърждение за импорт</AlertDialogTitle>
            <AlertDialogDescription>
              Искате ли да импортирате файл <strong>{fileConfirmationPrompt.fileName}</strong>?
              <br />
              <br />
              Файлът съдържа {fileConfirmationPrompt.products.length} продукта.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отказ</AlertDialogCancel>
            <AlertDialogAction onClick={handleFileConfirmation}>Да, импортирай</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {importError && <div className="text-red-500 mb-4">{importError}</div>}
    </div>
  );
}
