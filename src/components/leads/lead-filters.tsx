"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { useDebounce } from "@/hooks/use-debounce";
import { leadSources, leadStatuses } from "@/lib/schemas";
import type { LeadFilters as LeadFiltersType } from "@/types/lead.types";

import { Select } from "../ui/select";

interface LeadFiltersProps {
  filters: LeadFiltersType;
  onChange: (next: Partial<LeadFiltersType>) => void;
}

export function LeadFilters({ filters, onChange }: LeadFiltersProps) {
  const [search, setSearch] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    onChange({ search: debouncedSearch || undefined, page: 1 });
  }, [debouncedSearch, onChange]);

  return (
    <div className="grid grid-cols-1 gap-3 border-b border-white/10 p-4 lg:grid-cols-[1fr_180px_180px_160px]">
      <label className="relative block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email"
          className="h-11 w-full rounded-lg border border-white/10 bg-black/30 pl-10 text-sm outline-none transition placeholder:text-zinc-600 focus:border-indigo-400"
        />
      </label>
      <Select
        aria-label="Status"
        value={filters.status ?? ""}
        onChange={(event) => onChange({ status: event.target.value ? (event.target.value as LeadFiltersType["status"]) : undefined, page: 1 })}
        options={[{ label: "All statuses", value: "" }, ...leadStatuses.map((status) => ({ label: status, value: status }))]}
      />
      <Select
        aria-label="Source"
        value={filters.source ?? ""}
        onChange={(event) => onChange({ source: event.target.value ? (event.target.value as LeadFiltersType["source"]) : undefined, page: 1 })}
        options={[{ label: "All sources", value: "" }, ...leadSources.map((source) => ({ label: source, value: source }))]}
      />
      <Select
        aria-label="Sort"
        value={filters.sort}
        onChange={(event) => onChange({ sort: event.target.value as LeadFiltersType["sort"], page: 1 })}
        options={[
          { label: "Latest", value: "latest" },
          { label: "Oldest", value: "oldest" },
        ]}
      />
    </div>
  );
}
