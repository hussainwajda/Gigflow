import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Pagination as PaginationType } from "@/types/lead.types";

import { Button } from "./button";

interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: pagination.totalPages }, (_, index) => index + 1).slice(0, 5);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 px-4 py-4 sm:flex-row">
      <p className="text-sm text-zinc-400">
        Page {pagination.page} of {pagination.totalPages} · {pagination.total} leads
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={!pagination.hasPrevPage} onClick={() => onPageChange(pagination.page - 1)}>
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        {pages.map((page) => (
          <Button key={page} variant={page === pagination.page ? "primary" : "ghost"} size="sm" onClick={() => onPageChange(page)}>
            {page}
          </Button>
        ))}
        <Button variant="secondary" size="sm" disabled={!pagination.hasNextPage} onClick={() => onPageChange(pagination.page + 1)}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
