"use client";

import BasicHeader from "@/components/BasicHeader";
import BaseForm from "@/components/forms/BaseForm";
import LoadingScreen from "@/components/LoadingScreen";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { fetcher } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState, useEffect, useRef } from "react"; 
import { toast } from "sonner";
import useSWR from "swr";

export default function PriceGroupView() {
  const params = useParams();
  const [buttonsIsLoading, setButtonIsLoading] = useState(false);


  const { data: groupProducts, error: groupProductsError, isLoading: groupProductsLoading } =
    useSWR(`/api/price-groups/${params.id}/products`, fetcher);

  const { data: allProducts, error: allProductsError, isLoading: allProductsLoading } =
    useSWR('/api/products', fetcher);

  const {data: pgInfo, error: pgError, isLoading:pgIsLoading } = useSWR(`/api/price-groups/${params.id}/price-group`, fetcher);

  // Normalize
  const safeGroupProducts = Array.isArray(groupProducts) ? groupProducts : [];
  const safeAllProducts = Array.isArray(allProducts) ? allProducts : [];

  const groupIds = useMemo(
    () => new Set(safeGroupProducts.map(gp => gp.product?.id).filter(Boolean)),
    [safeGroupProducts]
  );

  // Local diffs
  const [addIds, setAddIds] = useState(new Set());      // products NOT in group that user selected
  const [removeIds, setRemoveIds] = useState(new Set()); // products IN group that user deselected
  // Local price edits: Map<productId, priceString>
  const [prices, setPrices] = useState({});
  const seededRef = useRef(false);

  // Seed prices from existing group products
  useEffect(() => {
    if (seededRef.current) return;
    if (!Array.isArray(safeGroupProducts) || safeGroupProducts.length === 0) return;
    const seeded = {};
    safeGroupProducts.forEach(gp => {
      const pid = gp.product?.id;
      if (pid) seeded[pid] = gp.price != null ? String(gp.price) : "";
    });
    setPrices(seeded);
    seededRef.current = true;
  }, [safeGroupProducts]);

  // reset guards and local state when switching groups
  useEffect(() => {
    seededRef.current = false;
    setPrices({});
    setAddIds(new Set());
    setRemoveIds(new Set());
  }, [params.id]);

  // Single source of truth: what should appear in Column 2
  const selectedIds = useMemo(() => {
    const result = new Set(groupIds);
    addIds.forEach(id => result.add(id));
    removeIds.forEach(id => result.delete(id));
    return result;
  }, [groupIds, addIds, removeIds]);

  // For quick lookup of product data by ID (covers both sources)
  const productById = useMemo(() => {
    const m = new Map();
    safeAllProducts.forEach(p => m.set(p.id, p));
    safeGroupProducts.forEach(gp => {
      if (gp.product?.id) m.set(gp.product.id, gp.product);
    });
    return m;
  }, [safeAllProducts, safeGroupProducts]);

  // Build the list to show in Column 2 (and to send)
  const selectedProducts = useMemo(
    () => Array.from(selectedIds).map(id => {
      const prod = productById.get(id);
      // If this product is already in the group, also find its group price for display
      const gpEntry = safeGroupProducts.find(gp => gp.product?.id === id);
      return {
        id,
        name: prod?.name ?? "(без име)",
        pcode: prod?.pcode,
        clientPrice: prod?.clientPrice,
        groupPrice: prices[id] ?? (gpEntry?.price ?? ""), // editable value shown in input
        _inBaseline: groupIds.has(id),
      };
    }).filter(Boolean)
      // Newly selected (in addIds) should appear first (top)
      .sort((a, b) => {
        const aNew = addIds.has(a.id);
        const bNew = addIds.has(b.id);
        if (aNew === bNew) return 0;
        return aNew ? -1 : 1;
      }),
    [selectedIds, productById, safeGroupProducts, groupIds, prices]
  );

  // Column 1 checkbox toggle (works for both baseline and non-baseline items)
  const toggleSelect = (id) => {
    const inBaseline = groupIds.has(id);
    const currentlySelected = selectedIds.has(id);

    if (inBaseline) {
      // baseline member toggles via removeIds
      setRemoveIds(prev => {
        const next = new Set(prev);
        if (currentlySelected) next.add(id);      // uncheck → mark for removal
        else next.delete(id);                     // re-check → undo removal
        return next;
      });
    } else {
      // non-baseline toggles via addIds
      setAddIds(prev => {
        const next = new Set(prev);
        if (currentlySelected) next.delete(id);   // uncheck → remove from add
        else next.add(id);                        // check → add
        return next;
      });
    }
  };

  // Optional: remove from Column 2 via "Remove" button
  const removeFromSelection = (id) => {
    if (groupIds.has(id)) {
      setRemoveIds(prev => new Set(prev).add(id));
    } else {
      setAddIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // DataTable columns (Column 1)
  const columns = [
    {
      id: "checkbox",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const id = row.original.id;
        const checked = selectedIds.has(id);
        return (
          <Input
            className="w-5 h-5"
            type="checkbox"
            id={`checkbox-${id}`}
            checked={checked}
            onChange={() => toggleSelect(id)}
          />
        );
      },
    },
    { accessorKey: "name", header: "Име" },
    { accessorKey: "pcode", header: "Код" },
    { accessorKey: "barcode", header: "Баркод"},
  ];

  const handleSubmit = async () => {

    setButtonIsLoading(true);

    const upserts = Array.from(selectedIds).map((id) => ({
      productId: id,
      price: Number(prices[id] ?? safeGroupProducts.find(gp => gp.product?.id === id)?.price ?? 0),
    }));

    const payload = {
      priceGroupId: params.id,
      upserts,                // rows to create/update
      remove: Array.from(removeIds), // products to remove
    };

    await fetch(`/api/price-groups/${params.id}/products`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    toast.success('Успешно запазихте промените')
    setButtonIsLoading(false);
  };

  if ((groupProductsError && groupProductsError.error) || allProductsError) {
    return <>Грешка: {groupProductsError?.error || allProductsError?.message || "Неизвестна грешка"}</>;
  }
  if (groupProductsLoading) {
    return <LoadingScreen />;
  }

    return (
        <>
      <BasicHeader 
      title={`Ценова група ${pgInfo && pgInfo.name || ""}`}
      subtitle={`Добави, редактирай или премахни продукти в ценовата група.`}
      >
        <Button className="px-4 py-2 border rounded-md" disabled={buttonsIsLoading} onClick={handleSubmit}>
            {buttonsIsLoading ? <>
            <div className="flex items-center gap-1"><Loader2Icon className="animate-spin" size={8}/> Запазване</div>
            </> : <>Запази промени</>}
        </Button>
      </BasicHeader>
    

      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="col-span-1 border border-gray-200 rounded-md p-4 py-6">
            {allProductsLoading ? <><LoadingScreen /></> : <>
          <DataTable
          searchKey='pcode'
                  filterableColumns={[
                    { id: "name", title: "Име на продукт" },
                    { id: "barcode", title: "Баркод" },
                  ]}

          columns={columns} data={safeAllProducts} />
            
            </>}
        </div>
        <div className="col-span-1 border border-gray-200 rounded-md p-4 py-6">
          <h3 className="font-semibold mb-3">Продукти в групата</h3>
          <div className="flex flex-col gap-2">
            {selectedProducts.length > 0 ? (
              selectedProducts.map((p) => (
                <div key={p.id} className="border relative border-gray-100 rounded-md p-3 flex items-start gap-">
                  <div className="w-full">
                    <table className="min-w-full table-fixed border border-gray-200 rounded overflow-hidden">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="w-1/4 px-2 py-1 text-left text-xs font-semibold text-gray-600">Име на продукт</th>
                          <th className="w-1/5 px-2 py-1 text-left text-xs font-semibold text-gray-600">Продуктов код</th>
                          <th className="w-1/5 px-2 py-1 text-left text-xs font-semibold text-gray-600">Нормална цена</th>
                          <th className="w-1/5 px-2 py-1 text-left text-xs font-semibold text-gray-600">Групова цена</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-2 py-2 align-top">
                            <div className="font-medium text-gray-800 text-xs">{p.name}</div>
                          </td>
                          <td className="px-2 py-2 align-top">
                            <div className="font-medium text-gray-800 text-xs">{p.pcode ?? "—"}</div>
                          </td>
                          <td className="px-2 py-2 align-top">
                            <div className="font-medium text-gray-800 text-sm">{p.clientPrice ?? "—"} лв.</div>
                          </td>
                          <td className="px-2 py-2 align-top">
                            <Input
                              className="w-24"
                              placeholder="0.00"
                              value={prices[p.id] ?? ""}
                              onChange={(e) =>
                                setPrices((prev) => ({ ...prev, [p.id]: e.target.value }))
                              }
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    className="text-sm absolute top-0 right-0 m-2"
                    onClick={() => removeFromSelection(p.id)}
                    title="Премахни от селекцията"
                  >
                    X
                  </button>
                </div>
              ))
            ) : (
              <div>Няма продукти в тази група.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
