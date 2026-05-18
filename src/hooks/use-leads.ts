"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchLeads } from "@/lib/api/client";
import type { LeadFilters } from "@/types/lead.types";

export function useLeads(filters: LeadFilters) {
  return useQuery({
    queryKey: ["leads", filters],
    queryFn: () => fetchLeads(filters),
    staleTime: 30_000,
  });
}
