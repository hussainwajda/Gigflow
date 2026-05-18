import type { Database } from "@/types/database.types";
import type { AuthUser } from "@/types/auth.types";
import type { Lead, LeadFilters, LeadFormInput, PaginatedLeads } from "@/types/lead.types";
import type { createSupabaseBrowserClient } from "./client";
import { assertSupabaseConfigured } from "./client";

type Supabase = ReturnType<typeof createSupabaseBrowserClient>;
type QueryResult<T> = Promise<{ data: T; error: Error | null; count?: number | null }>;

interface QueryBuilder<T> extends PromiseLike<{ data: T | T[] | null; error: Error | null; count?: number | null }> {
  select: (columns: string, options?: { count?: "exact" }) => QueryBuilder<T>;
  eq: (column: string, value: string) => QueryBuilder<T>;
  or: (filters: string) => QueryBuilder<T>;
  order: (column: string, options: { ascending: boolean }) => QueryBuilder<T>;
  range: (from: number, to: number) => QueryResult<T[]>;
  single: () => QueryResult<T>;
  insert: (value: unknown) => QueryBuilder<T>;
  update: (value: unknown) => QueryBuilder<T>;
  delete: () => QueryBuilder<T>;
}

interface QueryableClient {
  from: <T>(table: string) => QueryBuilder<T>;
}

function queryable(client: Supabase): QueryableClient {
  return client as unknown as QueryableClient;
}

interface LeadRowWithProfile {
  id: string;
  name: string;
  email: string;
  status: Lead["status"];
  source: Lead["source"];
  created_by: string;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    name: string;
    email: string;
  } | null;
}

function toLead(row: LeadRowWithProfile): Lead {
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

export async function getCurrentUser(client: Supabase): Promise<AuthUser | null> {
  assertSupabaseConfigured();
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) return null;

  const { data, error } = await queryable(client)
    .from<Database["public"]["Tables"]["profiles"]["Row"]>("profiles")
    .select("id,name,email,role")
    .eq("id", authData.user.id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
  };
}

export async function getLeads(client: Supabase, filters: LeadFilters): Promise<PaginatedLeads> {
  assertSupabaseConfigured();
  const from = (filters.page - 1) * filters.limit;
  const to = from + filters.limit - 1;

  let query = queryable(client)
    .from<LeadRowWithProfile>("leads")
    .select("id,name,email,status,source,created_by,created_at,updated_at,profiles(id,name,email)", {
      count: "exact",
    });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.source) query = query.eq("source", filters.source);
  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: filters.sort === "oldest" })
    .range(from, to);

  if (error) throw error;

  const total = count ?? 0;
  const totalPages = Math.max(Math.ceil(total / filters.limit), 1);

  return {
    leads: data.map((row) => toLead(row as LeadRowWithProfile)),
    pagination: {
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages,
      hasNextPage: filters.page < totalPages,
      hasPrevPage: filters.page > 1,
    },
  };
}

export async function getLead(client: Supabase, id: string): Promise<Lead> {
  assertSupabaseConfigured();
  const { data, error } = await queryable(client)
    .from<LeadRowWithProfile>("leads")
    .select("id,name,email,status,source,created_by,created_at,updated_at,profiles(id,name,email)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return toLead(data as LeadRowWithProfile);
}

export async function createLead(client: Supabase, input: LeadFormInput, userId: string): Promise<Lead> {
  assertSupabaseConfigured();
  const { data, error } = await queryable(client)
    .from<LeadRowWithProfile>("leads")
    .insert({ ...input, created_by: userId })
    .select("id,name,email,status,source,created_by,created_at,updated_at,profiles(id,name,email)")
    .single();

  if (error) throw error;
  return toLead(data as LeadRowWithProfile);
}

export async function updateLead(client: Supabase, id: string, input: LeadFormInput): Promise<Lead> {
  assertSupabaseConfigured();
  const { data, error } = await queryable(client)
    .from<LeadRowWithProfile>("leads")
    .update(input)
    .eq("id", id)
    .select("id,name,email,status,source,created_by,created_at,updated_at,profiles(id,name,email)")
    .single();

  if (error) throw error;
  return toLead(data as LeadRowWithProfile);
}

export async function deleteLead(client: Supabase, id: string): Promise<void> {
  assertSupabaseConfigured();
  const { error } = await queryable(client).from<LeadRowWithProfile>("leads").delete().eq("id", id);
  if (error) throw error;
}
