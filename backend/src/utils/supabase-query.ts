import type { supabaseAdmin } from "../config/supabase.js";

type Supabase = typeof supabaseAdmin;

type QueryResult<T> = Promise<{ data: T; error: Error | null; count?: number | null }>;

export interface QueryBuilder<T> extends PromiseLike<{ data: T | T[] | null; error: Error | null; count?: number | null }> {
  select: (columns: string, options?: { count?: "exact" }) => QueryBuilder<T>;
  eq: (column: string, value: string) => QueryBuilder<T>;
  or: (filters: string) => QueryBuilder<T>;
  order: (column: string, options: { ascending: boolean }) => QueryBuilder<T>;
  range: (from: number, to: number) => QueryResult<T[]>;
  single: () => QueryResult<T>;
  insert: (value: unknown) => QueryBuilder<T>;
  upsert: (value: unknown, options?: { onConflict?: string }) => QueryBuilder<T>;
  update: (value: unknown) => QueryBuilder<T>;
  delete: () => QueryBuilder<T>;
}

export interface QueryableClient {
  from: <T>(table: string) => QueryBuilder<T>;
}

export function queryable(client: Supabase): QueryableClient {
  return client as unknown as QueryableClient;
}
