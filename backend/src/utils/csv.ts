import type { Lead } from "../types/shared.types.js";

function cell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export function leadsToCsv(leads: Lead[]): string {
  const header = "Name,Email,Status,Source,Owner,Created At";
  const rows = leads.map((lead) =>
    [lead.name, lead.email, lead.status, lead.source, lead.createdBy.name, lead.createdAt].map(cell).join(","),
  );
  return [header, ...rows].join("\n");
}
