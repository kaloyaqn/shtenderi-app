"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MultiCombobox } from "@/components/ui/multi-combobox";

export default function ProductFilter({ 
  products,
  selectedProducts,
  setSelectedProducts,
  productName,
  setProductName
}) {
  const productOptions = [
    ...products.map((product) => ({
      value: product.barcode,
      label: product.name,
    }))
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="w-full">
        <Label className="mb-2">Продукти</Label>
        <MultiCombobox
          options={productOptions}
          value={selectedProducts}
          onValueChange={setSelectedProducts}
          placeholder={"Избери продукти..."}
          emptyText="Няма намерени продукти..."
          className="w-full"
        />
      </div>
      <div className="w-full">
        <Label className="mb-2">Име на продукт</Label>
        <Input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Въведи част от името на продукта..."
          className="w-full"
        />
      </div>
    </div>
  );
} 