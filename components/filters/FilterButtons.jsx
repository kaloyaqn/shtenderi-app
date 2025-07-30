"use client";

import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

export default function FilterButtons({ 
  onSubmit, 
  onClear 
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <Button type="submit" className="w-full md:w-auto flex-1" onClick={onSubmit}>
        <Filter />
        Търси
      </Button>
      <Button variant={'outline'} onClick={onClear} className="w-full md:w-auto flex-1">
        <X />
        Изчисти
      </Button>
    </div>
  );
} 