"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { partnerSchema } from "@/lib/validations/partnerScheme";

// Field configuration for auto-generation
const fields = [
  { name: "name", label: "Име на фирмата *", placeholder: "Въведете име", type: "text" },
  { name: "bulstat", label: "ЕИК/Булстат", placeholder: "Въведете булстат", type: "text" },
  { name: "address", label: "Адрес", placeholder: "Въведете адрес", type: "text" },
  { name: "mol", label: "МОЛ", placeholder: "Въведете МОЛ", type: "text" },
  { name: "contactPerson", label: "Лице за контакт", placeholder: "Въведете лице за контакт", type: "text" },
  { name: "phone", label: "Телефон", placeholder: "Въведете телефон", type: "text" },
];

export default function CreatePartnerPage({ fetchPartners }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(partnerSchema),
    defaultValues: fields.reduce((acc, field) => {
      acc[field.name] = field.type === "number" ? 0 : "";
      return acc;
    }, {}),
  });

  const onSubmit = async (data) => {
    try {
      const response = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Грешка при създаване");

      toast.success("Успешно създадохте партньор");
      fetchPartners();
      reset();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              step={field.step}
              min={field.min}
              max={field.max}
              {...register(field.name, {
                valueAsNumber: field.type === "number",
              })}
            />
            {errors[field.name] && (
              <p className="text-red-500 text-sm">
                {errors[field.name]?.message}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Създаване..." : "Създай"}
        </Button>
      </div>
    </form>
  );
}