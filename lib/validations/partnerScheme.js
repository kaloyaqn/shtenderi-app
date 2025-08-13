// partnerSchema.js
import { z } from "zod";

export const partnerSchema = z.object({
  name: z.string().min(1, "Името е задължително"),
  bulstat: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  mol: z.string().optional(),
  percentageDiscount: z
    .number()
    .max(100, "Максимум 100%")
    .optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
});