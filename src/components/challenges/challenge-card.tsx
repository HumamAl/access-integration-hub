// NO "use client" — pure JSX, no hooks

import type { ReactNode } from "react";
import { OutcomeStatement } from "./outcome-statement";

interface Challenge {
  id: string;
  title: string;
  description: string;
  outcome?: string;
}

interface ChallengeCardProps {
  challenge: Challenge;
  index: number;
  visualization?: ReactNode;
}

export function ChallengeCard({ challenge, index, visualization }: ChallengeCardProps) {
  const stepNumber = String(index + 1).padStart(2, "0");

  return (
    <div
      className="border border-border/70 bg-card rounded-sm"
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-xs font-medium text-primary/60 w-6 shrink-0 tabular-nums">
            {stepNumber}
          </span>
          <h3 className="text-sm font-semibold text-foreground leading-snug">
            {challenge.title}
          </h3>
        </div>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed pl-[calc(1.5rem+0.75rem)]">
          {challenge.description}
        </p>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        {visualization}
        {challenge.outcome && (
          <OutcomeStatement outcome={challenge.outcome} index={index} />
        )}
      </div>
    </div>
  );
}
