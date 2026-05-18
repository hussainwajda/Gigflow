"use client";

import { Activity, BadgeCheck, MailCheck, Target, UsersRound } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { Lead, LeadStatus } from "@/types/lead.types";
import { TiltCard } from "../ui/tilt-card";

interface AnalyticsViewProps {
  leads: Lead[];
  total: number;
}

const statusColors: Record<LeadStatus, string> = {
  New: "#38bdf8",
  Contacted: "#f59e0b",
  Qualified: "#10b981",
  Lost: "#fb7185",
};

export function AnalyticsView({ leads, total }: AnalyticsViewProps) {
  const statusData = (Object.keys(statusColors) as LeadStatus[]).map((status) => ({
    name: status,
    value: leads.filter((lead) => lead.status === status).length,
  }));

  const sourceData = ["Website", "Instagram", "Referral"].map((source) => ({
    name: source,
    value: leads.filter((lead) => lead.source === source).length,
  }));

  const qualified = leads.filter((lead) => lead.status === "Qualified").length;
  const contacted = leads.filter((lead) => lead.status === "Contacted").length;
  const conversion = total > 0 ? Math.round((qualified / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TiltCard className="border-l-4 border-l-indigo-500" contentClassName="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-400">Pipeline volume</p>
              <p className="mt-2 text-3xl font-semibold text-white">{total}</p>
              <p className="mt-2 text-xs text-zinc-500">Total leads across active filters</p>
            </div>
            <UsersRound className="h-5 w-5 text-indigo-200" />
          </div>
        </TiltCard>
        <TiltCard className="border-l-4 border-l-emerald-500" contentClassName="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-400">Qualification rate</p>
              <p className="mt-2 text-3xl font-semibold text-white">{conversion}%</p>
              <p className="mt-2 text-xs text-zinc-500">{qualified} qualified opportunities</p>
            </div>
            <BadgeCheck className="h-5 w-5 text-emerald-200" />
          </div>
        </TiltCard>
        <TiltCard className="border-l-4 border-l-amber-500" contentClassName="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-zinc-400">Contacted leads</p>
              <p className="mt-2 text-3xl font-semibold text-white">{contacted}</p>
              <p className="mt-2 text-xs text-zinc-500">Currently in follow-up</p>
            </div>
            <MailCheck className="h-5 w-5 text-amber-200" />
          </div>
        </TiltCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <TiltCard className="min-h-[360px] border-l-4 border-l-cyan-500" contentClassName="p-5">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Lead status mix</h2>
              <p className="mt-1 text-sm text-zinc-500">Distribution across the current result set</p>
            </div>
            <Activity className="h-5 w-5 text-cyan-200" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statusData}>
                <defs>
                  <linearGradient id="statusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ffffff12" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={3} fill="url(#statusGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TiltCard>

        <TiltCard className="min-h-[360px] border-l-4 border-l-fuchsia-500" contentClassName="p-5">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Source share</h2>
              <p className="mt-1 text-sm text-zinc-500">Where leads are entering from</p>
            </div>
            <Target className="h-5 w-5 text-fuchsia-200" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={4}>
                  {sourceData.map((entry, index) => (
                    <Cell key={entry.name} fill={["#38bdf8", "#a78bfa", "#34d399"][index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {sourceData.map((item) => (
              <div key={item.name} className="rounded-lg bg-white/[0.05] p-3 text-center">
                <p className="text-xs text-zinc-500">{item.name}</p>
                <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </TiltCard>
      </div>
    </div>
  );
}
