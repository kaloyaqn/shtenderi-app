"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

export default function TypeFilter({ 
  productType, 
  setProductType, 
  revisionType, 
  setRevisionType 
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="w-full">
        <Label className={'mb-2'}>Тип</Label>
        <Select value={productType} onValueChange={setProductType}>
          <SelectTrigger className="w-full">
            {productType
              ? (productType === "missing" ? "Продадени" : "Върнати")
              : "Избери тип"}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="missing">Продадени</SelectItem>
            <SelectItem value="refund">Върнати</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full">
        <Label className="mb-2">Източник</Label>
        <Select value={revisionType} onValueChange={setRevisionType}>
          <SelectTrigger className="w-full">
            {revisionType
              ? (revisionType === "import" ? "Импорт" : "Продажба")
              : "Избери тип"}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="import">Импорт</SelectItem>
            <SelectItem value="manual">Продажба</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 