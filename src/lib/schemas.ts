import { z } from "zod";

export const leadStatuses = ["New", "Contacted", "Qualified", "Lost"] as const;
export const leadSources = ["Website", "Instagram", "Referral"] as const;
export const userRoles = ["admin", "sales"] as const;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters.").max(60),
  role: z.enum(userRoles),
});

export const leadFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(100),
  email: z.string().email("Enter a valid email."),
  status: z.enum(leadStatuses),
  source: z.enum(leadSources),
});
