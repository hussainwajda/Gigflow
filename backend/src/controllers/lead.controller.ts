import type { Request, Response } from "express";

import { createLead, findLead, listLeads, listLeadsForExport, removeLead, updateLead } from "../services/lead.service.js";
import type { GetLeadsParams } from "../services/lead.service.js";
import type { ApiSuccess, Lead } from "../types/shared.types.js";
import { AppError } from "../utils/app-error.js";
import { leadsToCsv } from "../utils/csv.js";

export async function getLeads(req: Request, res: Response): Promise<void> {
  const result = await listLeads(req.query as unknown as GetLeadsParams);
  res.status(200).json(result);
}

export async function getLead(req: Request, res: Response<ApiSuccess<Lead>>): Promise<void> {
  const lead = await findLead(req.params.id as string);
  res.status(200).json({ success: true, data: lead });
}

export async function postLead(req: Request, res: Response<ApiSuccess<Lead>>): Promise<void> {
  if (!req.user) throw new AppError("Unauthorized", 401);
  const lead = await createLead(req.body, req.user);
  res.status(201).json({ success: true, data: lead, message: "Lead created." });
}

export async function patchLead(req: Request, res: Response<ApiSuccess<Lead>>): Promise<void> {
  if (!req.user) throw new AppError("Unauthorized", 401);
  const lead = await updateLead(req.params.id as string, req.body, req.user);
  res.status(200).json({ success: true, data: lead, message: "Lead updated." });
}

export async function deleteLead(req: Request, res: Response<ApiSuccess<null>>): Promise<void> {
  await removeLead(req.params.id as string);
  res.status(200).json({ success: true, data: null, message: "Lead deleted." });
}

export async function exportLeads(req: Request, res: Response): Promise<void> {
  const leads = await listLeadsForExport(req.query as unknown as Omit<GetLeadsParams, "page" | "limit">);
  const csv = leadsToCsv(leads);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="leads.csv"');
  res.status(200).send(csv);
}
