"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { AuthCard } from "@/components/layout/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { registerSchema } from "@/lib/schemas";

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: createAccount, registerState } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "sales" },
  });

  const onSubmit = async (values: RegisterValues): Promise<void> => {
    await createAccount(values);
  };

  return (
    <AuthCard
      title="Create workspace access"
      description="Register an admin or sales user. Supabase stores the profile and role on signup."
      footerText="Already have an account?"
      footerLabel="Sign in"
      footerHref="/login"
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Name" autoComplete="name" error={errors.name?.message} {...register("name")} />
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Input label="Password" type="password" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
        <Select
          label="Role"
          error={errors.role?.message}
          options={[
            { label: "Sales", value: "sales" },
            { label: "Admin", value: "admin" },
          ]}
          {...register("role")}
        />
        {registerState.error ? <p className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-200">{registerState.error.message}</p> : null}
        <Button className="w-full" size="lg" isLoading={registerState.isPending}>
          <UserPlus className="h-4 w-4" />
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
