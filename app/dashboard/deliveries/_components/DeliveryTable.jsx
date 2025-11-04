"use client";
import { Input } from "@/components/ui/input";
import React from "react";

export default function DeliveryTable({
  isDraft = true,
  lines = [],
  setLines,
  oldPriceByProductId = () => undefined,
  onPickProduct,
  onPickNewProduct,
  storageStockByProduct = {},
  oldClientPriceByProductId = () => undefined,
  oldPcdByProductId = () => undefined,
}) {
  const [addCode, setAddCode] = React.useState("");
  const [addPcd, setAddPcd] = React.useState("");
  const [addProduct, setAddProduct] = React.useState(null);
  const [addQty, setAddQty] = React.useState("");
  const [addUnit, setAddUnit] = React.useState("");
  const [addClient, setAddClient] = React.useState("");
  const totalQty = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);
  const totalDelivery = lines.reduce(
    (sum, l) => sum + Number(l.quantity || 0) * Number(l.unitPrice || 0),
    0
  );
  const totalClient = lines.reduce(
    (sum, l) => sum + Number(l.quantity || 0) * Number(l.clientPrice || 0),
    0
  );

  // Detect duplicate product rows (same productId appears more than once)
  const duplicateProductIds = React.useMemo(() => {
    const counts = new Map();
    for (const ln of lines) {
      if (!ln?.productId) continue;
      const key = String(ln.productId);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const dups = new Set();
    for (const [key, count] of counts.entries()) {
      if (count > 1) dups.add(key);
    }
    return dups;
  }, [lines]);

  return (
    <div className="overflow-x-auto">
      {duplicateProductIds.size > 0 && (
        <div className="mb-2 text-sm rounded-md border border-amber-200 bg-amber-50 text-amber-800 px-3 py-2">
          Открити са дублирани продукти в таблицата. Редовете са маркирани. При запис, редовете ще бъдат обединени.
        </div>
      )}
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="text-left text-xs uppercase text-gray-500">
            <th className="px-2 border-b">Код / EAN</th>
            <th className="px-2 border-b">Продукт</th>
            <th className="px-2 border-b">Стара доставна</th>
            <th className="px-2 border-b">Стара клиентска</th>
            <th className="px-2 border-b">Стар ПЦД</th>
            <th className="px-2 border-b">Бройки</th>
            <th className="px-2 border-b">Дост. цена</th>
            <th className="px-2 border-b">Продажна цена</th>
            <th className="px-2 border-b">ПЦД</th>
            <th className="px-2 border-b">Средна (преглед)</th>
            <th className="px-2 border-b"></th>
          </tr>
        </thead>
        <tbody>
          {isDraft && (
            <tr className="h-full">
              <td className="px-2 align-middle">
                <Input
                  variant="table"
                  placeholder="Код / EAN"
                  value={addCode}
                  onFocus={() =>
                    onPickNewProduct &&
                    onPickNewProduct({
                      onSelect: (p) => {
                        setAddProduct(p);
                        setAddCode(p.barcode || "");
                        setAddPcd(p.pcd || p.pcode || "");
                        setAddClient(
                          typeof p.clientPrice === "number"
                            ? String(p.clientPrice)
                            : ""
                        );
                      },
                    })
                  }
                  onChange={(e) => setAddCode(e.target.value)}
                />
              </td>
              <td className="px-2 align-middle text-sm text-gray-800 truncate max-w-[360px]">
                {addProduct?.name || "-"}
              </td>
              <td className="px-2 align-middle text-sm text-gray-600">
                {addProduct?.deliveryPrice ?? "-"}
              </td>
              <td className="px-2 align-middle text-sm text-gray-600">
                {addProduct?.clientPrice ?? "-"}
              </td>
              <td className="px-2 align-middle text-sm text-gray-600">
                {addProduct?.pcd ?? "-"}
              </td>
              <td className=" align-middle">
                <Input
                                    className='border-r border-gray-300'

                  variant="table"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={addQty}
                  onChange={(e) => setAddQty(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (!addProduct || !addQty || !addUnit) return;
                      setLines((prev) => [
                        {
                          productId: addProduct.id,
                          barcode: addProduct.barcode || "",
                          pcd:
                            addPcd || addProduct.pcd || addProduct.pcode || "",
                          name: addProduct.name || "",
                          quantity: Number(addQty),
                          unitPrice: Number(addUnit),
                          clientPrice: addClient === "" ? 0 : Number(addClient),
                          imported: false,
                          edited: true,
                        },
                        ...prev,
                      ]);
                      setAddCode("");
                      setAddPcd("");
                      setAddProduct(null);
                      setAddQty("");
                      setAddUnit("");
                      setAddClient("");
                    }
                  }}
                />
              </td>
              <td className="align-middle">
                <Input
                                    className='border-r border-gray-300'
                  variant="table"
                  inputMode="decimal"
                  step="0.01"
                  value={addUnit}
                  onChange={(e) => setAddUnit(e.target.value.replace(",", "."))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (!addProduct || !addQty || !addUnit) return;
                      setLines((prev) => [
                        {
                          productId: addProduct.id,
                          barcode: addProduct.barcode || "",
                          pcd:
                            addPcd || addProduct.pcd || addProduct.pcode || "",
                          name: addProduct.name || "",
                          quantity: Number(addQty),
                          unitPrice: Number(addUnit),
                          clientPrice: addClient === "" ? 0 : Number(addClient),
                          imported: false,
                          edited: true,
                        },
                        ...prev,
                      ]);
                      setAddCode("");
                      setAddPcd("");
                      setAddProduct(null);
                      setAddQty("");
                      setAddUnit("");
                      setAddClient("");
                    }
                  }}
                />
              </td>
              <td className="align-middle">
                <Input
                  className='border-r border-gray-300'
                  variant="table"
                  inputMode="decimal"
                  step="0.01"
                  value={addClient}
                  onChange={(e) =>
                    setAddClient(e.target.value.replace(",", "."))
                  }
                  // no submit on client price
                />
              </td>
              <td className="">
                <Input
                                    className='border-r border-gray-300'

                  variant="table"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="ПЦД"
                  value={addPcd}
                  onFocus={() => {
                    if (addPcd === "0") setAddPcd("");
                  }}
                  onChange={(e) => setAddPcd(e.target.value.replace(",", "."))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (!addProduct || !addQty || !addUnit) return;
                      setLines((prev) => [
                        {
                          productId: addProduct.id,
                          barcode: addProduct.barcode || "",
                          pcd:
                            addPcd || addProduct.pcd || addProduct.pcode || "",
                          name: addProduct.name || "",
                          quantity: Number(addQty),
                          unitPrice: Number(addUnit),
                          clientPrice: addClient === "" ? 0 : Number(addClient),
                          imported: false,
                          edited: true,
                        },
                        ...prev,
                      ]);
                      setAddCode("");
                      setAddPcd("");
                      setAddProduct(null);
                      setAddQty("");
                      setAddUnit("");
                      setAddClient("");
                    }
                  }}
                />
              </td>
              <td className="px-2 align-middle text-sm text-gray-800">-</td>
              <td className="px-2 align-middle"></td>
            </tr>
          )}
          {lines.map((ln, i) => {
            const key = ln.productId != null ? String(ln.productId) : undefined;
            const oldPrice = Number(oldPriceByProductId(ln.productId) || 0);
            const qOld = Number((key && storageStockByProduct?.[key]) || 0);
            const qNew = Number(ln.quantity || 0);
            const pNew = Number(ln.unitPrice || 0);
            const avgPreview =
              qOld + qNew > 0
                ? ((qOld * oldPrice + qNew * pNew) / (qOld + qNew)).toFixed(4)
                : "-";
            const oldPcd = oldPcdByProductId(ln.productId);
            return (
              <tr
                key={i}
                className={`text-sm ${
                  ln.imported && !ln.edited ? "bg-red-50" : ""
                } ${key && duplicateProductIds.has(key) ? "bg-amber-50" : ""}`}
              >
                <td className="px-2 border-t">{ln.barcode || "-"}</td>
                <td className="px-2 border-t">
                  <div className="flex items-center gap-2">
                    <span>{ln.name || "-"}</span>
                    {key && duplicateProductIds.has(key) && (
                      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-900 border border-amber-200">
                        дубликат
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-2 border-t">{oldPrice ? oldPrice : "-"}</td>
                <td className="px-2 border-t">
                  {(() => {
                    const oc = oldClientPriceByProductId(ln.productId);
                    return oc != null ? oc : "-";
                  })()}
                </td>
                <td className="px-2  border-t">
                  {oldPcd != null && oldPcd !== "" ? oldPcd : "-"}
                </td>
                <td className=" border-t">
                  <Input
                    variant="table"
                    className="border-r border-gray-300"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={
                      ln.quantity === undefined ||
                      ln.quantity === null ||
                      ln.quantity === ""
                        ? ""
                        : String(ln.quantity)
                    }
                    onChange={(e) => {
                      const raw = e.target.value;
                      setLines((prev) =>
                        prev.map((row, idx) =>
                          idx === i
                            ? {
                                ...row,
                                quantity: raw === "" ? "" : Number(raw),
                                edited: true,
                              }
                            : row
                        )
                      );
                    }}
                  />
                </td>
                <td className=" border-t">
                  <Input
                    variant="table"
                    className="border-r border-gray-300"
                    type="text"
                    inputMode="decimal"
                    value={String(ln.unitPrice ?? "")}
                    onChange={(e) => {
                      const val = e.target.value.replace(",", ".");
                      setLines((prev) =>
                        prev.map((row, idx) =>
                          idx === i
                            ? { ...row, unitPrice: val, edited: true }
                            : row
                        )
                      );
                    }}
                  />
                </td>
                <td className=" border-t">
                  <Input
                    className="border-r border-gray-300"
                    variant="table"
                    type="text"
                    inputMode="decimal"
                    value={
                      ln.clientPrice === undefined ||
                      ln.clientPrice === null ||
                      ln.clientPrice === ""
                        ? oldClientPriceByProductId(ln.productId) != null
                          ? String(oldClientPriceByProductId(ln.productId))
                          : ""
                        : String(ln.clientPrice)
                    }
                    onChange={(e) => {
                      const val = e.target.value.replace(",", ".");
                      setLines((prev) =>
                        prev.map((row, idx) =>
                          idx === i
                            ? { ...row, clientPrice: val, edited: true }
                            : row
                        )
                      );
                    }}
                  />
                </td>
                <td className=" border-t">
                  <Input
                    className="border-r border-gray-300"
                    variant="table"
                    inputMode="decimal"
                    step="0.01"
                    value={
                      ln.pcd === undefined || ln.pcd === null
                        ? ""
                        : String(ln.pcd)
                    }
                    onChange={(e) => {
                      const val = e.target.value.replace(",", ".");
                      setLines((prev) =>
                        prev.map((row, idx) =>
                          idx === i ? { ...row, pcd: val, edited: true } : row
                        )
                      );
                    }}
                  />
                </td>
                <td className="pl-1 border-t">{avgPreview}</td>
                <td className=" border-t text-right">
                  <button
                    type="button"
                    className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                    aria-label="Премахни ред"
                    onClick={() =>
                      setLines((prev) => prev.filter((_, idx) => idx !== i))
                    }
                  >
                    ✕
                  </button>
                </td>
              </tr>
            );
          })}
          {/* Footer row totals */}
          <tr className="bg-gray-50 font-medium">
            <td className="px-2 border-t"></td>
            <td className="px-2 border-t text-right">Общо:</td>
            <td className="px-2 border-t"></td>
            <td className="px-2 border-t"></td>
            <td className="px-2 border-t"></td>
            <td className="px-2 border-t">{totalQty}</td>
            <td className="px-2 border-t">{totalDelivery.toFixed(2)} лв.</td>
            <td className="px-2 border-t">{totalClient.toFixed(2)} лв.</td>
            <td className="px-2 border-t"></td>
            <td className="px-2 border-t"></td>
            <td className="px-2 border-t"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
