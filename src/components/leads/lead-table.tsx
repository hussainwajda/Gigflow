"use client";

import { Edit3, Trash2 } from "lucide-react";
import Link from "next/link";

import { formatDate } from "@/lib/utils";
import type { UserRole } from "@/types/auth.types";
import type { Lead } from "@/types/lead.types";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface LeadTableProps {
  leads: Lead[];
  currentUserId: string;
  role: UserRole;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  deletingId?: string;
}

export function LeadTable({ leads, currentUserId, role, onEdit, onDelete, deletingId }: LeadTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead className="bg-white/[0.03] text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-4 py-3 font-medium">Lead</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Source</th>
            <th className="px-4 py-3 font-medium">Owner</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {leads.map((lead) => {
            const canEdit = role === "admin" || lead.createdBy.id === currentUserId;
            const canDelete = role === "admin";
            return (
              <tr key={lead.id} className="border-l-4 border-l-transparent transition hover:border-l-indigo-500 hover:bg-white/[0.04]">
                <td className="px-4 py-4">
                  <Link href={`/leads/${lead.id}`} className="font-medium text-white hover:text-indigo-200">
                    {lead.name}
                  </Link>
                  <p className="mt-1 text-xs text-zinc-500">{lead.email}</p>
                </td>
                <td className="px-4 py-4">
                  <Badge status={lead.status} />
                </td>
                <td className="px-4 py-4 text-zinc-300">{lead.source}</td>
                <td className="px-4 py-4 text-zinc-300">{lead.createdBy.name}</td>
                <td className="px-4 py-4 text-zinc-400">{formatDate(lead.createdAt)}</td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" disabled={!canEdit} onClick={() => onEdit(lead)} aria-label={`Edit ${lead.name}`}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="icon"
                      disabled={!canDelete}
                      isLoading={deletingId === lead.id}
                      onClick={() => onDelete(lead)}
                      aria-label={`Delete ${lead.name}`}
                      title={canDelete ? `Delete ${lead.name}` : "Only admins can delete leads"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
