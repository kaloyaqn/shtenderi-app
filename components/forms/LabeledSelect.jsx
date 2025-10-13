"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LabeledSelect({ label, placeholder, value, onValueChange, options = [], getValue = (o) => o.id, getLabel = (o) => o.name }) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className='w-full border-amber-500'><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={getValue(o)} value={getValue(o)}>{getLabel(o)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}


