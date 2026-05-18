"use client";

import { Download } from "lucide-react";
import { useState } from "react";

import { downloadLeadsCsv } from "@/lib/api/client";
import type { LeadFilters } from "@/types/lead.types";

import { Button } from "../ui/button";

interface ExportButtonProps {
  filters: LeadFilters;
}

export function ExportButton({ filters }: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const exportCsv = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const blob = await downloadLeadsCsv(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "leads.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="secondary" onClick={() => void exportCsv()} isLoading={isLoading}>
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
}
