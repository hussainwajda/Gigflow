"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit3, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { LeadForm } from "@/components/leads/lead-form";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { fetchLead, removeLead, saveLead } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import type { LeadFormInput } from "@/types/lead.types";

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isEditOpen, setEditOpen] = useState(false);

  const leadQuery = useQuery({
    queryKey: ["lead", params.id],
    queryFn: () => fetchLead(params.id),
  });

  const updateMutation = useMutation({
    mutationFn: (input: LeadFormInput) => saveLead(params.id, input),
    onSuccess: async () => {
      setEditOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["lead", params.id] });
      await queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => removeLead(params.id),
    onSuccess: () => router.push("/leads"),
  });

  const lead = leadQuery.data;
  const canEdit = Boolean(user && lead && (user.role === "admin" || lead.createdBy.id === user.id));

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-4 sm:p-6 lg:p-8">
          <Link href="/leads" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to leads
          </Link>

          {leadQuery.isLoading ? (
            <div className="flex min-h-96 items-center justify-center">
              <Spinner />
            </div>
          ) : null}

          {leadQuery.isError ? <EmptyState title="Lead not found" description={leadQuery.error.message} /> : null}

          {lead ? (
            <section className="max-w-4xl rounded-xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <Badge status={lead.status} />
                  <h1 className="mt-4 text-3xl font-semibold tracking-normal text-white">{lead.name}</h1>
                  <p className="mt-2 text-zinc-400">{lead.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" disabled={!canEdit} onClick={() => setEditOpen(true)}>
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                  {user?.role === "admin" ? (
                    <Button
                      variant="danger"
                      isLoading={deleteMutation.isPending}
                      onClick={() => {
                        if (window.confirm(`Delete ${lead.name}?`)) void deleteMutation.mutateAsync();
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  ) : null}
                </div>
              </div>

              <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  ["Source", lead.source],
                  ["Owner", `${lead.createdBy.name} (${lead.createdBy.email})`],
                  ["Created", formatDate(lead.createdAt)],
                  ["Updated", formatDate(lead.updatedAt)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-black/20 p-4">
                    <dt className="text-xs uppercase text-zinc-500">{label}</dt>
                    <dd className="mt-2 text-sm text-white">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </div>

        <Modal isOpen={isEditOpen} title="Edit lead" onClose={() => setEditOpen(false)}>
          {lead ? (
            <LeadForm
              lead={lead}
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
