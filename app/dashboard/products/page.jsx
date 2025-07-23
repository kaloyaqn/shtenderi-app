"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  Bus,
  Upload,
  Loader2,
  PlusIcon,
  ImportIcon,
  ImageIcon,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { XMLParser } from "fast-xml-parser";
import { toast } from "sonner";
import LoadingScreen from "@/components/LoadingScreen";
import BasicHeader from "@/components/BasicHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import EditProductPage from "./[productId]/edit/page";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import ProductOffer from "@/components/offers/productOffer";

function EditableCell({ value, onSave, type = "text", min, max }) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    if (inputValue === 0) {
      setInputValue("");
    } else {
      setInputValue(value ?? "");
    }
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleSave = async () => {
    let toSave = inputValue;
    // If the field is numeric and input is empty or 0, set to 0
    if (
      (type === "number" || type === "numeric") &&
      (inputValue === "" || inputValue === null || Number(inputValue) === 0)
    ) {
      toSave = 0;
      setInputValue(0);
    }
    if (toSave === value) {
      setEditing(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSave(toSave);
      setEditing(false);
    } catch (err) {
      setError("Грешка при запис");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditing(false);
      setInputValue(value ?? "");
    }
  };

  if (editing) {
    return (
      <div>
        <input
          ref={inputRef}
          type={type}
          min={min}
          max={max}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => {
            if (
              (type === "number" || type === "numeric") &&
              (inputValue === 0 || inputValue === "0")
            ) {
              setInputValue("");
            }
          }}
          onBlur={() => {
            if (
              (type === "number" || type === "numeric") &&
              (inputValue === "" || inputValue === null)
            ) {
              setInputValue(0);
              handleSave(0); // Save 0 if blurred empty
            } else {
              handleSave();
            }
          }}
          onKeyDown={handleKeyDown}
          className="border rounded px-2 py-1 w-20 text-sm"
          disabled={loading}
        />
        {error && <div className="text-xs text-red-500">{error}</div>}
      </div>
    );
  }
  return (
    <span
      className="cursor-pointer underline decoration-dotted"
      onClick={() => setEditing(true)}
    >
      {value === null || value === undefined || value === "" ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        value
      )}
    </span>
  );
}

const BarcodeWithStoragesTooltip = ({ product }) => {
  const [open, setOpen] = useState(false);
  const [storages, setStorages] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStorages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${product.id}/storages`);
      if (!res.ok) throw new Error("Failed to fetch storages");
      const data = await res.json();
      setStorages(data);
    } catch (e) {
      setStorages([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (o && storages === null) fetchStorages();
        }}
      >
        <TooltipTrigger asChild>
          <span className="underline decoration-dotted cursor-pointer">
            {product.barcode}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="min-w-[220px]">
          <div className="font-semibold mb-1">Складови наличности</div>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="animate-spin w-4 h-4" /> Зареждане...
            </div>
          ) : storages && storages.length > 0 ? (
            <ul className="text-sm">
              {storages.map((s) => (
                <li key={s.storage.id} className="flex justify-between">
                  <span>{s.storage.name}</span>
                  <span className="font-mono">{s.quantity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-muted-foreground">
              Няма наличности в складове
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// New component for unassigned quantity tooltip
const UnassignedQuantityTooltip = ({ product, unassignedQuantity }) => {
  const [open, setOpen] = useState(false);
  const [storages, setStorages] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStorages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${product.id}/storages`);
      if (!res.ok) throw new Error("Failed to fetch storages");
      const data = await res.json();
      setStorages(data);
    } catch (e) {
      setStorages([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (o && storages === null) fetchStorages();
        }}
      >
        <TooltipTrigger asChild>
          <span className="underline decoration-dotted cursor-pointer">
            {unassignedQuantity}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="min-w-[220px]">
          <div className="font-semibold mb-1">Складови наличности</div>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="animate-spin w-4 h-4" /> Зареждане...
            </div>
          ) : storages && storages.length > 0 ? (
            <ul className="text-sm">
              {storages.map((s) => (
                <li key={s.storage.id} className="flex justify-between">
                  <span>{s.storage.name}</span>
                  <span className="font-mono">{s.quantity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-muted-foreground">
              Няма наличности в складове
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default function ProductsPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [importError, setImportError] = useState(null);
  const fileInputRef = useRef();

  // State for import flow
  const [pendingProducts, setPendingProducts] = useState(null);
  const [activationPrompt, setActivationPrompt] = useState({
    open: false,
    inactiveProducts: [],
  });
  const [quantityPrompt, setQuantityPrompt] = useState(false);
  const [priceChanges, setPriceChanges] = useState([]);
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [updatingPrices, setUpdatingPrices] = useState(false);

  // state for updated row
  const [updatedRowId, setUpdatedRowId] = useState(null);

  // state for bulk edit
  const [checkedProducts, setCheckedProducts] = useState([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const products = await response.json();
      setData(products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductUpdated = (updatedProduct) => {
    setData((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  useEffect(() => {
    if (updatedRowId) {
      const timeout = setTimeout(() => setUpdatedRowId(null), 10000);
      return () => clearTimeout(timeout);
    }
  }, [updatedRowId]);

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete product");
      }

      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
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
      const parser = new XMLParser();
      const xml = parser.parse(text);
      const goods = xml.info?.goods?.good || [];
      const products = (Array.isArray(goods) ? goods : [goods])
        .map((good) => ({
          barcode: String(good.barcode),
          name: good.name,
          clientPrice: parseFloat(good.price),
          quantity:
            good.quantity !== undefined
              ? parseInt(good.quantity, 10)
              : undefined,
        }))
        .filter((p) => p.barcode);

      if (products.length === 0) {
        toast.error("Няма намерени продукти в XML файла.");
        return;
      }

      const barcodes = products.map((p) => p.barcode);
      const checkResponse = await fetch("/api/products/check-inactive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcodes }),
      });

      const { inactiveProducts } = await checkResponse.json();

      setPendingProducts(products);

      if (inactiveProducts && inactiveProducts.length > 0) {
        setActivationPrompt({ open: true, inactiveProducts: inactiveProducts });
      } else {
        setQuantityPrompt(true); // No inactive products, go to quantity prompt
      }
    } catch (err) {
      setImportError(err.message);
      toast.error(`Грешка при импорт: ${err.message}`);
    } finally {
      e.target.value = ""; // Reset file input
    }
  };

  const handleActivateAndContinue = () => {
    const productsWithActivationFlag = pendingProducts.map((p) => {
      const isInactive = activationPrompt.inactiveProducts.some(
        (ip) => ip.barcode === p.barcode
      );
      if (isInactive) {
        return { ...p, shouldActivate: true };
      }
      return p;
    });
    setPendingProducts(productsWithActivationFlag);
    setActivationPrompt({ open: false, inactiveProducts: [] });
    setQuantityPrompt(true);
  };

  const handleSkipAndContinue = () => {
    const inactiveBarcodes = new Set(
      activationPrompt.inactiveProducts.map((p) => p.barcode)
    );
    const filteredProducts = pendingProducts.filter(
      (p) => !inactiveBarcodes.has(p.barcode)
    );
    setPendingProducts(filteredProducts);
    setActivationPrompt({ open: false, inactiveProducts: [] });

    if (filteredProducts.length > 0) {
      setQuantityPrompt(true);
    } else {
      toast.info(
        "Няма продукти за импортиране след пропускане на неактивните."
      );
      setPendingProducts(null);
    }
  };

  const handleImportWithQuantities = async (updateQuantities) => {
    setQuantityPrompt(false);
    if (!pendingProducts || pendingProducts.length === 0) {
      setPendingProducts(null);
      return;
    }

    const productsToSend = updateQuantities
      ? pendingProducts
      : pendingProducts.map((p) => {
          const { quantity, ...rest } = p;
          return rest;
        });

    await toast.promise(
      (async () => {
        // Use the correct endpoint for stand or storage import as needed
        const response = await fetch("/api/products/import-xml", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: productsToSend, updateQuantities }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Import failed");
        }
        // Handle price changes dialog
        if (data.priceChanges && data.priceChanges.length > 0) {
          setPriceChanges(data.priceChanges);
          setShowPriceDialog(true);
        } else {
          await fetchProducts();
        }
      })(),
      {
        loading: "Импортиране... Моля, изчакайте",
        success: "Импортирането е успешно!",
        error: (err) => err.message || "Възникна грешка при импортиране",
      }
    );
    setPendingProducts(null);
  };

  const handleUpdateProductField = async (id, field, newValue) => {
    const product = data.find((p) => p.id === id);
    if (!product) return;
    // Build patch with all required fields, using newValue for the edited field
    const patch = {
      name: product.name,
      barcode: product.barcode,
      clientPrice:
        field === "clientPrice" ? parseFloat(newValue) : product.clientPrice,
      deliveryPrice:
        field === "deliveryPrice"
          ? parseFloat(newValue)
          : product.deliveryPrice,
      pcd: field === "pcd" ? String(newValue) : product.pcd,
      quantity:
        field === "quantity" ? parseInt(newValue, 10) : product.quantity,
    };
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      // Update local state for the edited product only
      const updated = await res.json();
      setData((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
      );
      toast.success("Успешно записано!");
    } else {
      const err = await res.json();
      toast.error(err.error || "Грешка при запис");
    }
  };

  const getRowClassName = (row) => {
    if (row.original.active === false) {
      return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
    }
    if (row.original.quantity === 0) {
      return "bg-red-50 dark:bg-red-950";
    }
    return "";
  };

  const handleCheckProduct = (id) => {
    setCheckedProducts((prev) => {
      const updated =
        prev.includes(id)
          ? prev.filter((productId) => productId !== id)
          : [...prev, id];
      console.log(updated);
      return updated;
    });
  };

  const columns = [
    {
      id: "checkbox",
      header: "",
      cell: ({ row }) => {
        const checked = checkedProducts.includes(row.original.id);
        return (
          <Input
            className="w-5 h-5"
            type="checkbox"
            id={`checkbox-${row.original.id}`}
            checked={checked}
            onChange={() => handleCheckProduct(row.original.id)}
          />
        );
      },
    },
    {
      accessorKey: "image",
      header: "",
      cell: ({ row }) => {
        return (
          <>
            {row.original.image && (
              <Link href={row.original.image} target="_blank" rel="noopener noreferrer">
                  <img className="rounded-sm border" src={row.original.image} width={40} height={40} />
              </Link>
            )}
          </>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Име",
    },

    {
      accessorKey: "barcode",
      header: "Баркод",
      cell: ({ row }) => row.original.barcode,
    },
    {
      accessorKey: "deliveryPrice",
      header: "Доставна цена",
      cell: ({ row }) => {
        if (!row) return null;
        return (
          <EditableCell
            type="number"
            value={row.original.deliveryPrice}
            onSave={(val) =>
              handleUpdateProductField(row.original.id, "deliveryPrice", val)
            }
          />
        );
      },
    },
    {
      accessorKey: "clientPrice",
      header: "Продажна цена",
      cell: ({ row }) => {
        if (!row) return null;
        return (
          <EditableCell
            type="number"
            value={row.original.clientPrice}
            onSave={(val) =>
              handleUpdateProductField(row.original.id, "clientPrice", val)
            }
          />
        );
      },
    },
    {
      accessorKey: "pcd",
      header: "ПЦД",
      cell: ({ row }) => {
        if (!row) return null;
        return (
          <EditableCell
            type="number"
            value={row.original.pcd}
            onSave={(val) =>
              handleUpdateProductField(row.original.id, "pcd", val)
            }
          />
        );
      },
    },
    {
      accessorKey: "quantity",
      header: "Общо Кол.",
      cell: ({ row }) => {
        if (!row) return null;
        const product = row.original;
        if (!product || !Array.isArray(product.standProducts)) return null;
        const assignedQuantity = product.standProducts.reduce(
          (sum, sp) => sum + sp.quantity,
          0
        );
        const unassignedQuantity = product.quantity - assignedQuantity;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <EditableCell
                    value={product.quantity}
                    type="number"
                    min={0}
                    onSave={(val) =>
                      handleUpdateProductField(product.id, "quantity", val)
                    }
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold mb-2">Разпределение:</p>
                <ul>
                  {product.standProducts.map((sp) => (
                    <li key={sp.id}>
                      {sp.stand.name}: {sp.quantity}
                    </li>
                  ))}
                  <li className="mt-1 pt-1 border-t">
                    Неразпределени: {unassignedQuantity}
                  </li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "unassignedQuantity",
      header: "Неразпределени",
      cell: ({ row }) => {
        if (!row) return null;
        const product = row.original;
        if (!product || !Array.isArray(product.standProducts)) return null;
        const assignedQuantity = product.standProducts.reduce(
          (sum, sp) => sum + sp.quantity,
          0
        );
        const unassignedQuantity = product.quantity - assignedQuantity;
        return (
          <UnassignedQuantityTooltip
            product={product}
            unassignedQuantity={unassignedQuantity}
          />
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        if (!row) return null;
        const product = row.original;
        if (!product) return null;
        return (
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="table">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Редактирай продукт</DialogTitle>
                </DialogHeader>
                <EditProductPage
                  fetchProducts={fetchProducts}
                  productId={product.id}
                  onProductUpdated={handleProductUpdated}
                  rowId={row.original.id}
                  setUpdatedRowId={setUpdatedRowId}
                />
              </DialogContent>
            </Dialog>
            <Button
              variant="table"
              onClick={() => {
                setProductToDelete(product);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="">
      <BasicHeader
        title="Номенклатура"
        subtitle="Управлявай продукти на глобално ниво"
      >

        {/* <Button onClick={handleImportClick} variant={"outline"}>
          <ImportIcon />
          Импорт
        </Button>
        <input
          type="file"
          accept=".xml"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        /> */}

        <Button onClick={() => router.push("/dashboard/products/create")}>
          <PlusIcon /> Добави продукт
        </Button>
      </BasicHeader>

      {importError && <div className="text-red-500 mb-4">{importError}</div>}
      {/* offer */}
      <ProductOffer checkedProducts={checkedProducts}
        products={data} />

        {/* offer */}
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        filterableColumns={[{ id: "barcode", title: "Баркод" }]}
        rowClassName={getRowClassName}
        updatedRowId={updatedRowId}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Изтриване на продукт</AlertDialogTitle>
            <AlertDialogDescription>
              Сигурни ли сте, че искате да изтриете продукт{" "}
              {productToDelete?.name}? Това действие не може да бъде отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отказ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Изтрий</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={activationPrompt.open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Открити са неактивни продукти</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                Следните продукти от XML файла са неактивни:
                <ul className="mt-2 list-disc list-inside text-sm">
                  {activationPrompt.inactiveProducts.map((p) => (
                    <li key={p.barcode}>
                      {p.name} ({p.barcode})
                    </li>
                  ))}
                </ul>
                Искате ли да ги активирате и импортирате, или да ги пропуснете?
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={handleSkipAndContinue}>
              Пропусни неактивните
            </Button>
            <Button onClick={handleActivateAndContinue}>
              Активирай и импортирай
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={quantityPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Импортиране на количества</AlertDialogTitle>
            <AlertDialogDescription>
              Искате ли да обновите и количествата на продуктите от XML файла,
              или само да добавите новите продукти?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => handleImportWithQuantities(false)}
            >
              Не, добави само нови
            </Button>
            <Button onClick={() => handleImportWithQuantities(true)}>
              Да, обнови количествата
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Price Change Dialog */}
      <AlertDialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Открити са продукти с различна доставна цена
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                Следните продукти имат различна доставна цена в системата и в
                XML файла:
                <ul className="mt-2 list-disc list-inside text-sm">
                  {priceChanges.map((p) => (
                    <li key={p.barcode}>
                      {p.name} ({p.barcode}):{" "}
                      <b>
                        {Number(p.oldPrice).toFixed(2)} →{" "}
                        {Number(p.newPrice).toFixed(2)} лв.
                      </b>
                    </li>
                  ))}
                </ul>
                Искате ли да обновите доставната цена на тези продукти с новата
                стойност?
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={async () => {
                setShowPriceDialog(false);
                await fetchProducts();
              }}
            >
              Не, запази старите цени
            </Button>
            <Button
              disabled={updatingPrices}
              onClick={async () => {
                setUpdatingPrices(true);
                await fetch("/api/products/batch-update-delivery-price", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    updates: priceChanges.map((p) => ({
                      barcode: p.barcode,
                      deliveryPrice: p.newPrice,
                    })),
                  }),
                });
                setUpdatingPrices(false);
                setShowPriceDialog(false);
                toast.success("Доставните цени са обновени!");
                await fetchProducts();
              }}
            >
              {updatingPrices ? "Обновяване..." : "Да, обнови цените"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
