import Link from "next/link";
import type { ReactNode } from "react";

import { AmbientBackground } from "./background";

interface AuthCardProps {
  title: string;
  description: string;
  footerLabel: string;
  footerHref: string;
  footerText: string;
  children: ReactNode;
}

export function AuthCard({ title, description, footerLabel, footerHref, footerText, children }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 text-white">
      <AmbientBackground />
      <section className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-indigo-200">Gigflow</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">{title}</h1>
          <p className="mt-2 text-sm text-zinc-400">{description}</p>
        </div>
        {children}
        <p className="mt-6 text-center text-sm text-zinc-400">
          {footerText}{" "}
          <Link href={footerHref} className="font-medium text-indigo-200 hover:text-white">
            {footerLabel}
          </Link>
        </p>
      </section>
    </main>
  );
}
