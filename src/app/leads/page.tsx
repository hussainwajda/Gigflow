"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart3, ListFilter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo, useState } from "react";

import { AnalyticsView } from "@/components/leads/analytics-view";
import { ExportButton } from "@/components/leads/export-button";
import { LeadFilters } from "@/components/leads/lead-filters";
import { LeadForm } from "@/components/leads/lead-form";
import { LeadTable } from "@/components/leads/lead-table";
import { StatsRow } from "@/components/leads/stats-row";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { SkeletonRows } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useLeads } from "@/hooks/use-leads";
import { addLead, removeLead, saveLead } from "@/lib/api/client";
import type { Lead, LeadFilters as LeadFiltersType, LeadFormInput, LeadSource, LeadStatus } from "@/types/lead.types";

function readFilters(params: URLSearchParams): LeadFiltersType {
  return {
    page: Number(params.get("page") ?? "1"),
    limit: 10,
    status: (params.get("status") as LeadStatus | null) ?? undefined,
    source: (params.get("source") as LeadSource | null) ?? undefined,
    search: params.get("search") ?? undefined,
    sort: params.get("sort") === "oldest" ? "oldest" : "latest",
  };
}

function LeadsPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const filters = useMemo(() => readFilters(params), [params]);
  const activeView = params.get("view") === "analytics" ? "analytics" : "leads";
  const leadsQuery = useLeads(filters);

  const setFilters = useCallback(
    (next: Partial<LeadFiltersType>): void => {
      const updated = new URLSearchParams(params.toString());
      Object.entries(next).forEach(([key, value]) => {
        if (value === undefined || value === "") {
          updated.delete(key);
        } else {
          updated.set(key, String(value));
        }
      });
      router.replace(`/leads?${updated.toString()}`);
    },
    [params, router],
  );

  const createMutation = useMutation({
    mutationFn: (input: LeadFormInput) => addLead(input),
    onSuccess: async () => {
      setCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: LeadFormInput) => {
      if (!editingLead) throw new Error("Missing selected lead.");
      return saveLead(editingLead.id, input);
    },
    onSuccess: async () => {
      setEditingLead(null);
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (lead: Lead) => removeLead(lead.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });

  return (
    <ProtectedRoute>
      <AppShell onCreateLead={() => setCreateOpen(true)} activeItem={activeView === "analytics" ? "Analytics" : "Leads"}>
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-medium text-indigo-200">Gigflow - Smart Leads Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                {activeView === "analytics" ? "Analytics" : "Leads"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                Track acquisition source, qualification status, ownership, and follow-up progress from one focused workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {user?.role === "admin" ? <ExportButton filters={filters} /> : null}
              <Button
                variant={activeView === "analytics" ? "primary" : "secondary"}
                onClick={() => setFilters({ view: activeView === "analytics" ? undefined : "analytics" } as Partial<LeadFiltersType>)}
              >
                {activeView === "analytics" ? <ListFilter className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                {activeView === "analytics" ? "Lead list" : "Analytics"}
              </Button>
            </div>
          </div>

          <StatsRow leads={leadsQuery.data?.leads ?? []} total={leadsQuery.data?.pagination.total ?? 0} />

          {activeView === "analytics" ? (
            <AnalyticsView leads={leadsQuery.data?.leads ?? []} total={leadsQuery.data?.pagination.total ?? 0} />
          ) : (
          <section className="overflow-hidden rounded-xl border border-l-4 border-white/10 border-l-indigo-500 bg-white/[0.055] backdrop-blur-xl">
            <LeadFilters filters={filters} onChange={setFilters} />
            {leadsQuery.isLoading ? <SkeletonRows /> : null}
            {leadsQuery.isError ? (
              <div className="p-4">
                <EmptyState title="Unable to load leads" description={leadsQuery.error.message} />
              </div>
            ) : null}
            {leadsQuery.data && leadsQuery.data.leads.length === 0 ? (
              <div className="p-4">
                <EmptyState title="No leads match these filters" description="Try a different search, status, or source filter." />
              </div>
            ) : null}
            {leadsQuery.data && leadsQuery.data.leads.length > 0 && user ? (
              <>
                <LeadTable
                  leads={leadsQuery.data.leads}
                  currentUserId={user.id}
                  role={user.role}
                  onEdit={setEditingLead}
                  onDelete={(lead) => {
                    if (window.confirm(`Delete ${lead.name}?`)) void deleteMutation.mutateAsync(lead);
                  }}
                  deletingId={deleteMutation.variables?.id}
                />
                <Pagination pagination={leadsQuery.data.pagination} onPageChange={(page) => setFilters({ page })} />
              </>
            ) : null}
          </section>
          )}
        </div>

        <Modal isOpen={isCreateOpen} title="Add lead" onClose={() => setCreateOpen(false)}>
          <LeadForm
            isSubmitting={createMutation.isPending}
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
            }}
          />
          {createMutation.error ? <p className="mt-3 text-sm text-rose-200">{createMutation.error.message}</p> : null}
        </Modal>

        <Modal isOpen={Boolean(editingLead)} title="Edit lead" onClose={() => setEditingLead(null)}>
          {editingLead ? (
            <LeadForm
              lead={editingLead}
              isSubmitting={updateMutation.isPending}
              onSubmit={async (values) => {
                await updateMutation.mutateAsync(values);
              }}
            />
          ) : null}
          {updateMutation.error ? <p className="mt-3 text-sm text-rose-200">{updateMutation.error.message}</p> : null}
        </Modal>
      </AppShell>
    </ProtectedRoute>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <LeadsPageContent />
    </Suspense>
  );
}
