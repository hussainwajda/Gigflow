import type { AuthUser, LoginInput, RegisterInput } from "@/types/auth.types";
import type { Lead, LeadFilters, LeadFormInput, PaginatedLeads } from "@/types/lead.types";

interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

interface ApiPaginated<T> {
  success: true;
  data: T[];
  pagination: PaginatedLeads["pagination"];
}

interface ApiFailure {
  success: false;
  message: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";
const TOKEN_KEY = "gigflow-token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? ((await response.json()) as ApiSuccess<T> | ApiFailure) : null;

  if (!response.ok) {
    throw new Error(body?.message ?? "Request failed.");
  }

  if (!body || !body.success) {
    throw new Error("Unexpected API response.");
  }

  return body.data;
}

export async function registerAccount(input: RegisterInput): Promise<AuthUser> {
  return request<AuthUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function loginAccount(input: LoginInput): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getMe(): Promise<AuthUser> {
  return request<AuthUser>("/auth/me");
}

function searchParams(filters: LeadFilters): string {
  const params = new URLSearchParams();
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));
  params.set("sort", filters.sort);
  if (filters.status) params.set("status", filters.status);
  if (filters.source) params.set("source", filters.source);
  if (filters.search) params.set("search", filters.search);
  return params.toString();
}

export async function fetchLeads(filters: LeadFilters): Promise<PaginatedLeads> {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}/leads?${searchParams(filters)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const body = (await response.json()) as ApiPaginated<Lead> | ApiFailure;
  if (!response.ok) throw new Error(body.success ? "Unable to load leads." : body.message);
  if (!body.success) throw new Error(body.message);
  return { leads: body.data, pagination: body.pagination };
}

export async function fetchLead(id: string): Promise<Lead> {
  return request<Lead>(`/leads/${id}`);
}

export async function addLead(input: LeadFormInput): Promise<Lead> {
  return request<Lead>("/leads", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function saveLead(id: string, input: LeadFormInput): Promise<Lead> {
  return request<Lead>(`/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function removeLead(id: string): Promise<void> {
  await request<null>(`/leads/${id}`, { method: "DELETE" });
}

export async function downloadLeadsCsv(filters: LeadFilters): Promise<Blob> {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}/leads/export/csv?${searchParams(filters)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error("Unable to export leads.");
  return response.blob();
}
