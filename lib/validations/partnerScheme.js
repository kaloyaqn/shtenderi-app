// partnerSchema.js
import { z } from "zod";

export const partnerSchema = z.object({
  name: z.string().min(1, "Името е задължително"),
  bulstat: z.string().optional(),
  address: z.string().optional(),
  mol: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
});