"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/types/auth.types";

import { Spinner } from "../ui/spinner";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, router, user]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink text-white">
        <Spinner />
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink p-6 text-center text-white">
        <div>
          <h1 className="text-2xl font-semibold">403</h1>
          <p className="mt-2 text-zinc-400">You do not have access to this area.</p>
        </div>
      </div>
    );
  }

  return children;
}
