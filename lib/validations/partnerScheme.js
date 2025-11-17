// partnerSchema.js
import { z } from "zod";

const percentageDiscountSchema = z.preprocess((val) => {
  if (val === "" || val === null || typeof val === "undefined") {
    return undefined;
  }
  const num = Number(val);
  return Number.isNaN(num) ? undefined : num;
}, z.number().min(0, "Минимум 0%").max(100, "Максимум 100%").optional());

export const partnerSchema = z.object({
  name: z.string().min(1, "Името е задължително"),
  bulstat: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  mol: z.string().optional(),
  email: z.string().email("Невалиден имейл").optional().or(z.literal("")),
  percentageDiscount: percentageDiscountSchema,
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
});