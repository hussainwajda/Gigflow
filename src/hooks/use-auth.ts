"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { clearStoredToken, getMe, getStoredToken, loginAccount, registerAccount, setStoredToken } from "@/lib/api/client";
import type { LoginInput, RegisterInput } from "@/types/auth.types";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["auth", "user"],
    queryFn: getMe,
    enabled: typeof window !== "undefined" && Boolean(getStoredToken()),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (input: LoginInput) => {
      const session = await loginAccount(input);
      setStoredToken(session.token);
      return session.user;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      router.push("/leads");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (input: RegisterInput) => {
      await registerAccount(input);
      const session = await loginAccount({ email: input.email, password: input.password });
      setStoredToken(session.token);
      return session.user;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      router.push("/leads");
    },
  });

  const logout = async (): Promise<void> => {
    clearStoredToken();
    queryClient.clear();
    router.push("/login");
  };

  return {
    user: userQuery.data ?? null,
    isAuthenticated: Boolean(userQuery.data),
    isLoading: userQuery.isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    loginState: loginMutation,
    registerState: registerMutation,
  };
}
