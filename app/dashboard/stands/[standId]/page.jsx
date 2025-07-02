"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Barcode,
  ArrowRightLeft,
  FilePlus,
  PlusIcon,
  ImportIcon,
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
import { useSession } from "next-auth/react";
import LoadingScreen from "@/components/LoadingScreen";
import { IconTransferIn, IconTruckReturn } from "@tabler/icons-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function StandDetailPage({ params }) {
  const router = useRouter();
  const { standId } = use(params);
  const [stand, setStand] = useState(null);
  const [stats, setStats] = useState([]);
  const [productsOnStand, setProductsOnStand] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [importError, setImportError] = useState(null);
  const fileInputRef = useRef();

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productOnStandToEdit, setProductOnStandToEdit] = useState(null);
  const [productOnStandToDelete, setProductOnStandToDelete] = useState(null);
  const [inactiveProductsPrompt, setInactiveProductsPrompt] = useState({
    open: false,
    products: [],
    toImport: [],
  });

  const { data: session } = useSession();
  const userIsAdmin = session?.user?.role === "ADMIN";


  const fetchData = async () => {
    setLoading(true);
    try {
      const [standRes, productsRes] = await Promise.all([
        fetch(`/api/stands/${standId}`),
        fetch(`/api/stands/${standId}/products`),
      ]);

      if (!standRes.ok) throw new Error("Failed to fetch stand details");
      if (!productsRes.ok) throw new Error("Failed to fetch products on stand");

      const standData = await standRes.json();
      const productsData = await productsRes.json();

      setStand(standData);
      setProductsOnStand(productsData);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/stands/${standId}/stats`);
      if (!res.ok) {
        toast.error("Грешка при взимането на статистики");
      }
      let data = await res.json();
      console.log(data);
      setStats(data);
    } catch (err) {
      toast.error(err.message);
      throw Error(err);
    }
  };

  useEffect(() => {
    if (standId) {
      fetchData();
      fetchStats();
    }
  }, [standId]);

  const handleDelete = async () => {
    if (!productOnStandToDelete) return;

    try {
      const response = await fetch(
        `/api/stands/${standId}/products/${productOnStandToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove product");
      }
      fetchData(); // Refresh data
    } catch (err) {
      console.error("Error removing product:", err);
      setError(err.message);
    } finally {
      setDeleteDialogOpen(false);
      setProductOnStandToDelete(null);
    }
  };

  const columns = [
    {
      accessorKey: "product.name",
      header: "Продукт",
    },
    {
      accessorKey: "product.barcode",
      header: "Баркод",
    },
    {
      accessorKey: "product.pcd",
      header: "ПЦД",
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
              title={
                canDelete ? "" : "Може да изтриете само продукти с количество 0"
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

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

      // Check for inactive products
      const barcodes = productsToImport.map((p) => p.barcode);
      const checkRes = await fetch("/api/products/check-inactive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcodes }),
      });

      const { inactiveProducts } = await checkRes.json();

      if (inactiveProducts && inactiveProducts.length > 0) {
        setInactiveProductsPrompt({
          open: true,
          products: inactiveProducts,
          toImport: productsToImport,
        });
      } else {
        // No inactive products, proceed directly
        await proceedWithImport(productsToImport);
      }
    } catch (err) {
      console.error("File change or check error:", err);
      setImportError(err.message);
      toast.error(err.message || "Възникна грешка при обработка на файла.");
    } finally {
      e.target.value = "";
    }
  };

  const proceedWithImport = async (products, activate = false) => {
    let productsToSend = products;
    if (activate) {
      const inactiveBarcodes = new Set(
        inactiveProductsPrompt.products.map((p) => p.barcode)
      );
      productsToSend = products.map((p) =>
        inactiveBarcodes.has(p.barcode) ? { ...p, shouldActivate: true } : p
      );
    }

    await toast.promise(
      (async () => {
        const response = await fetch(`/api/stands/${standId}/import-xml`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: productsToSend }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Import failed");
        }
        await fetchData();
      })(),
      {
        loading: "Импортиране...",
        success: "Импортирането е успешно!",
        error: (err) => err.message || "Възникна грешка при импортиране",
      }
    );
  };

  if (loading) return <LoadingScreen />;
  if (error) return <div className="text-red-500">Грешка: {error}</div>;
  if (!stand) return <div>Щандът не е намерен.</div>;

  return (
    <div className="md:p-0 p-2">
      <div className="flex md:flex-row flex-col md:w-auto w-full justify-between items-center pb-4 border-b mb-4">
        <div className="flex flex-col md:w-auto w-full mb-2 md:mb-0">
          <h1 className="text-2xl font-bold text-left text-gray-900">
            {stand.name}
          </h1>
          <p className="text-base text-gray-600">
            Управление на щендер и зареждане на стока
          </p>
        </div>

        <div className="flex md:flex-row w-full md:w-auto flex-col items-center gap-2 ">
          <Button
            variant={"outline"}
            onClick={handleImportClick}
            className="md:flex hidden"
          >
            <ImportIcon />
            Импорт
          </Button>
          <Link className="w-full" href={`/dashboard/stands/${standId}/refund`}>
            <Button variant={"outline"}>
              <IconTruckReturn />
              Рекламация
            </Button>
          </Link>

          <Link href={`/dashboard/stands/${standId}/resupply`}>
            <Button variant="outline"> <IconTransferIn/>  Презареди от склад</Button>
          </Link>
          <div className="h-6 w-px md:block hidden bg-gray-300"></div>
          <Link
            className="md:w-auto w-full"
            href={`/dashboard/stands/${standId}/revision`}
          >
            <Button>
              <Barcode />
              Проверка на щанд</Button>
          </Link>
        </div>
      </div>
      {userIsAdmin && (
                  <div className="my-4 flex md:flex-row flex-col justify-between items-center gap-2">
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
                      <CardTitle className="text-lg">Брой продажби {"(30 дни)"}</CardTitle>
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
      <div className="container mx-auto p-0">
        {error && <p className="text-red-500">{error}</p>}
        <DataTable
          columns={columns}
          data={productsOnStand}
          searchKey="product.barcode"
          filterableColumns={[]}
        />
      </div>

      <EditQuantityDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        standProduct={productOnStandToEdit}
        onProductUpdated={fetchData}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Премахване на продукт</AlertDialogTitle>
            <AlertDialogDescription>
              Сигурни ли сте, че искате да премахнете{" "}
              {productOnStandToDelete?.product.name} от този щанд?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отказ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Премахни
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Inactive Products Confirmation Dialog */}
      <AlertDialog
        open={inactiveProductsPrompt.open}
        onOpenChange={(open) =>
          !open &&
          setInactiveProductsPrompt({ open: false, products: [], toImport: [] })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Открити са неактивни продукти</AlertDialogTitle>
            <AlertDialogDescription>
              Следните продукти от XML файла са маркирани като неактивни в
              системата:
              <ul className="mt-2 list-disc list-inside">
                {inactiveProductsPrompt.products.map((p) => (
                  <li key={p.barcode}>
                    {p.name} ({p.barcode})
                  </li>
                ))}
              </ul>
              Желаете ли да ги активирате и да продължите с импорта, или да ги
              пропуснете?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                const inactiveBarcodes = new Set(
                  inactiveProductsPrompt.products.map((p) => p.barcode)
                );
                const filteredProducts = inactiveProductsPrompt.toImport.filter(
                  (p) => !inactiveBarcodes.has(p.barcode)
                );
                proceedWithImport(filteredProducts, false);
                setInactiveProductsPrompt({
                  open: false,
                  products: [],
                  toImport: [],
                });
              }}
            >
              Пропусни неактивните
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                proceedWithImport(inactiveProductsPrompt.toImport, true);
                setInactiveProductsPrompt({
                  open: false,
                  products: [],
                  toImport: [],
                });
              }}
            >
              Активирай и импортирай
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {importError && <div className="text-red-500 mb-4">{importError}</div>}
    </div>
  );
}
