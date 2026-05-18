import { BadgeCheck, CircleDot, MailCheck, TrendingUp, XCircle } from "lucide-react";

import type { Lead } from "@/types/lead.types";
import { TiltCard } from "../ui/tilt-card";

interface StatsRowProps {
  leads: Lead[];
  total: number;
}

export function StatsRow({ leads, total }: StatsRowProps) {
  const qualified = leads.filter((lead) => lead.status === "Qualified").length;
  const contacted = leads.filter((lead) => lead.status === "Contacted").length;
  const lost = leads.filter((lead) => lead.status === "Lost").length;
  const stats = [
    { label: "Total leads", value: total, helper: "All captured opportunities", icon: CircleDot, color: "text-indigo-200", border: "border-l-indigo-500" },
    { label: "Contacted", value: contacted, helper: "Touched this page", icon: MailCheck, color: "text-amber-200", border: "border-l-amber-500" },
    { label: "Qualified", value: qualified, helper: "Ready for next step", icon: BadgeCheck, color: "text-emerald-200", border: "border-l-emerald-500" },
    { label: "Lost", value: lost, helper: "Closed out", icon: XCircle, color: "text-rose-200", border: "border-l-rose-500" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <TiltCard key={stat.label} className={`border-l-4 ${stat.border}`} contentClassName="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{stat.value}</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-zinc-500">
                  <TrendingUp className="h-3 w-3" />
                  {stat.helper}
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-2">
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </TiltCard>
        );
      })}
    </div>
  );
}
