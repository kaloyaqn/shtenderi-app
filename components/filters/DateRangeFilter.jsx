"use client";

import { Label } from "@/components/ui/label";
import DatePicker from "@/components/ui/date-picker";

export default function DateRangeFilter({ 
  dateFrom, 
  setDateFrom, 
  dateTo, 
  setDateTo 
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="w-full">
        <Label className="mb-2">Дата от</Label>
        <DatePicker 
          setDate={setDateFrom} 
          date={dateFrom} 
          className="w-full" 
        />
      </div>
      <div className="w-full">
        <Label className="mb-2">Дата до</Label>
        <DatePicker 
          setDate={setDateTo} 
          date={dateTo} 
          className="w-full" 
        />
      </div>
    </div>
  );
} 