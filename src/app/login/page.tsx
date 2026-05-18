"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { AuthCard } from "@/components/layout/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { loginSchema } from "@/lib/schemas";

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, loginState } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues): Promise<void> => {
    await login(values);
  };

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to manage qualified leads, ownership, and pipeline movement."
      footerText="New to Gigflow?"
      footerLabel="Create an account"
      footerHref="/register"
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Input label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register("password")} />
        {loginState.error ? <p className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-200">{loginState.error.message}</p> : null}
        <Button className="w-full" size="lg" isLoading={loginState.isPending}>
          <LogIn className="h-4 w-4" />
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
}
