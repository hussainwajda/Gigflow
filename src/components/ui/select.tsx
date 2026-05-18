import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <label className="block space-y-2" htmlFor={selectId}>
      {label ? <span className="text-sm font-medium text-zinc-300">{label}</span> : null}
      <select
        id={selectId}
        className={cn(
          "h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20",
          error ? "border-rose-400 focus:border-rose-300 focus:ring-rose-500/20" : "",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-zinc-950">
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-rose-300">{error}</span> : null}
    </label>
  );
}
