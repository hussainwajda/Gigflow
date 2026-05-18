export type LeadStatus = "New" | "Contacted" | "Qualified" | "Lost";
export type LeadSource = "Website" | "Instagram" | "Referral";
export type LeadSort = "latest" | "oldest";

export interface Lead {
  id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LeadFilters {
  page: number;
  limit: number;
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  sort: LeadSort;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedLeads {
  leads: Lead[];
  pagination: Pagination;
}

export interface LeadFormInput {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
}
