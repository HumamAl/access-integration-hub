// NO "use client" — pure JSX, no hooks

import { TrendingUp } from "lucide-react";

interface OutcomeStatementProps {
  outcome: string;
  index?: number;
}

export function OutcomeStatement({ outcome }: OutcomeStatementProps) {
  return (
    <div
      className="flex items-start gap-2 rounded-sm px-3 py-2"
      style={{
        backgroundColor: "color-mix(in oklch, var(--success) 6%, transparent)",
        borderColor: "color-mix(in oklch, var(--success) 18%, transparent)",
        borderWidth: "1px",
        borderStyle: "solid",
      }}
    >
      <TrendingUp className="h-4 w-4 mt-0.5 shrink-0 text-[color:var(--success)]" />
      <p className="text-sm font-medium text-[color:var(--success)]">{outcome}</p>
    </div>
  );
}
