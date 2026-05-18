import { z } from "zod";

export const leadStatuses = ["New", "Contacted", "Qualified", "Lost"] as const;
export const leadSources = ["Website", "Instagram", "Referral"] as const;

export const createLeadSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    status: z.enum(leadStatuses).default("New"),
    source: z.enum(leadSources),
  }),
});

export const updateLeadSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createLeadSchema.shape.body.partial(),
});

export const leadIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const getLeadsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    status: z.enum(leadStatuses).optional(),
    source: z.enum(leadSources).optional(),
    search: z.string().trim().optional(),
    sort: z.enum(["latest", "oldest"]).default("latest"),
  }),
});
