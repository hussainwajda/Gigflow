import { supabaseAdmin } from "../config/supabase.js";
import type { AuthUser, Lead, LeadSource, LeadStatus, PaginatedSuccess } from "../types/shared.types.js";
import { AppError } from "../utils/app-error.js";
import { queryable } from "../utils/supabase-query.js";

export interface LeadInput {
  name: string;
  email: string;
  status?: LeadStatus;
  source: LeadSource;
}

export interface GetLeadsParams {
  page: number;
  limit: number;
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  sort: "latest" | "oldest";
}

interface LeadRow {
  id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  created_by: string;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    name: string;
    email: string;
  } | null;
}

function toLead(row: LeadRow): Lead {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: {
      id: row.profiles?.id ?? row.created_by,
      name: row.profiles?.name ?? "Unknown",
      email: row.profiles?.email ?? "unknown@example.com",
    },
  };
}

function assertCanModify(user: AuthUser, lead: Lead): void {
  if (user.role !== "admin" && lead.createdBy.id !== user.id) {
    throw new AppError("Forbidden", 403);
  }
}

export async function listLeads(params: GetLeadsParams): Promise<PaginatedSuccess<Lead>> {
  const from = (params.page - 1) * params.limit;
  const to = from + params.limit - 1;

  let query = queryable(supabaseAdmin)
    .from<LeadRow>("leads")
    .select("id,name,email,status,source,created_by,created_at,updated_at,profiles(id,name,email)", { count: "exact" });

  if (params.status) query = query.eq("status", params.status);
  if (params.source) query = query.eq("source", params.source);
  if (params.search) query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`);

  const { data, error, count } = await query
    .order("created_at", { ascending: params.sort === "oldest" })
    .range(from, to);

  if (error) throw new AppError(error.message, 400);

  const total = count ?? 0;
  const totalPages = Math.max(Math.ceil(total / params.limit), 1);

  return {
    success: true,
    data: (data as LeadRow[]).map(toLead),
    pagination: {
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPrevPage: params.page > 1,
    },
  };
}

export async function listLeadsForExport(params: Omit<GetLeadsParams, "page" | "limit">): Promise<Lead[]> {
  const result = await listLeads({ ...params, page: 1, limit: 100 });
  return result.data;
}

export async function findLead(id: string): Promise<Lead> {
  const { data, error } = await queryable(supabaseAdmin)
    .from<LeadRow>("leads")
    .select("id,name,email,status,source,created_by,created_at,updated_at,profiles(id,name,email)")
    .eq("id", id)
    .single();

  if (error || !data) throw new AppError("Lead not found.", 404);
  return toLead(data as LeadRow);
}

export async function createLead(input: LeadInput, user: AuthUser): Promise<Lead> {
  const { data, error } = await queryable(supabaseAdmin)
    .from<LeadRow>("leads")
    .insert({
      name: input.name,
      email: input.email,
      status: input.status ?? "New",
      source: input.source,
      created_by: user.id,
    })
    .select("id,name,email,status,source,created_by,created_at,updated_at,profiles(id,name,email)")
    .single();

  if (error || !data) throw new AppError(error?.message ?? "Unable to create lead.", 400);
  return toLead(data as LeadRow);
}

export async function updateLead(id: string, input: Partial<LeadInput>, user: AuthUser): Promise<Lead> {
  const existing = await findLead(id);
  assertCanModify(user, existing);

  const { data, error } = await queryable(supabaseAdmin)
    .from<LeadRow>("leads")
    .update(input)
    .eq("id", id)
    .select("id,name,email,status,source,created_by,created_at,updated_at,profiles(id,name,email)")
    .single();

  if (error || !data) throw new AppError(error?.message ?? "Unable to update lead.", 400);
  return toLead(data as LeadRow);
}

export async function removeLead(id: string): Promise<void> {
  const { error } = await queryable(supabaseAdmin).from<LeadRow>("leads").delete().eq("id", id);
  if (error) throw new AppError(error.message, 400);
}
