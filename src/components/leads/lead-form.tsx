"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";

import { leadFormSchema, leadSources, leadStatuses } from "@/lib/schemas";
import type { Lead, LeadFormInput } from "@/types/lead.types";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";

interface LeadFormProps {
  lead?: Lead;
  isSubmitting: boolean;
  onSubmit: (values: LeadFormInput) => Promise<void>;
}

export function LeadForm({ lead, isSubmitting, onSubmit }: LeadFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: lead?.name ?? "",
      email: lead?.email ?? "",
      status: lead?.status ?? "New",
      source: lead?.source ?? "Website",
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Input label="Name" error={errors.name?.message} {...register("name")} />
      <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Status" error={errors.status?.message} options={leadStatuses.map((status) => ({ label: status, value: status }))} {...register("status")} />
        <Select label="Source" error={errors.source?.message} options={leadSources.map((source) => ({ label: source, value: source }))} {...register("source")} />
      </div>
      <Button className="w-full" isLoading={isSubmitting}>
        <Save className="h-4 w-4" />
        {lead ? "Save lead" : "Create lead"}
      </Button>
    </form>
  );
}
