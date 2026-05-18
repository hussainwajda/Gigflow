"use client";

import { BarChart3, Bell, LogOut, Moon, Plus, Search, Sun, UsersRound, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useAuth } from "@/hooks/use-auth";
import { cn, initials } from "@/lib/utils";
import { useThemeStore } from "@/store/theme-store";

import { AmbientBackground } from "./background";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

interface AppShellProps {
  children: ReactNode;
  onCreateLead?: () => void;
  activeItem?: "Leads" | "Analytics";
}

const navigation = [
  { label: "Leads", href: "/leads", icon: UsersRound },
  { label: "Analytics", href: "/leads?view=analytics", icon: BarChart3 },
];

export function AppShell({ children, onCreateLead, activeItem = "Leads" }: AppShellProps) {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const isDark = useThemeStore((state) => state.isDark);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink text-white">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-zinc-100">
      <AmbientBackground />
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-20 flex-col items-center justify-between border-r border-white/10 bg-black/25 py-7 backdrop-blur-xl md:flex">
        <Link href="/leads" className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-glow">
          <Zap className="h-6 w-6" fill="currentColor" />
        </Link>
        <nav className="flex flex-col gap-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === "/leads" && item.label === activeItem;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "group relative flex h-11 w-11 items-center justify-center rounded-lg transition",
                  isActive ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/10 hover:text-white",
                )}
                aria-label={item.label}
              >
                <Icon className="h-5 w-5" />
                <span className="absolute left-14 rounded-md bg-zinc-900 px-2 py-1 text-xs opacity-0 shadow-xl transition group-hover:opacity-100">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold" title={user?.name}>
          {user ? initials(user.name) : "GF"}
        </button>
      </aside>

      <main className="md:pl-20">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-black/20 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  aria-label="Global search"
                  className="h-10 w-72 rounded-full border border-white/10 bg-white/5 pl-10 text-sm outline-none transition placeholder:text-zinc-600 focus:border-indigo-400"
                  placeholder="Search leads..."
                />
              </div>
            </div>
            <div className="md:hidden">
              <Link href="/leads" className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500">
                <Zap className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="secondary" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="secondary" size="icon" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            {onCreateLead ? (
              <Button onClick={onCreateLead}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Lead</span>
              </Button>
            ) : null}
            <Button variant="ghost" size="icon" onClick={() => void logout()} aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
