import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types/lead.types";

interface BadgeProps {
  status: LeadStatus;
}

const colors: Record<LeadStatus, string> = {
  New: "border-sky-400/30 bg-sky-500/15 text-sky-200",
  Contacted: "border-amber-400/30 bg-amber-500/15 text-amber-200",
  Qualified: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
  Lost: "border-rose-400/30 bg-rose-500/15 text-rose-200",
};

export function Badge({ status }: BadgeProps) {
  return <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", colors[status])}>{status}</span>;
}
