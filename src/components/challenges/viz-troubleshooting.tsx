"use client";

// Before/After comparison — interactive toggle
// Before: manual SSH + log inspection per PACS server
// After: centralized error queue with event-level detail, auto-categorized, one-click retry

import { useState } from "react";
import { X, CheckCircle2, Terminal, LayoutList } from "lucide-react";

const beforeItems = [
  "SSH or RDP into each PACS server individually",
  "Tail log files manually — no structured search",
  "No correlation between platform events and PACS logs",
  "Provider errors silently swallowed, no retry mechanism",
  "Identifying the failed cardholder record requires manual grep",
  "No way to know if a sync failure was transient or permanent",
];

const afterItems = [
  "Centralized error queue in the platform dashboard",
  "Structured events: cardholder ID, provider, endpoint, HTTP status",
  "Auto-categorized by failure type: timeout, auth failure, schema mismatch",
  "One-click retry on any failed sync event",
  "Correlation: platform event ID linked to provider API call",
  "Threshold alerts when retry count exceeds configured limit",
];

export function VizTroubleshooting() {
  const [view, setView] = useState<"before" | "after">("before");

  const isBefore = view === "before";

  return (
    <div className="space-y-3">
      {/* Toggle */}
      <div className="flex items-center gap-1 p-0.5 rounded-sm bg-muted/60 w-fit border border-border/50">
        <button
          type="button"
          onClick={() => setView("before")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-all ${isBefore ? "bg-card text-foreground shadow-sm border border-border/60" : "text-muted-foreground hover:text-foreground/80"}`}
          style={{ transitionDuration: "100ms" }}
        >
          <Terminal className="h-3 w-3" />
          Current state
        </button>
        <button
          type="button"
          onClick={() => setView("after")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-all ${!isBefore ? "bg-card text-foreground shadow-sm border border-border/60" : "text-muted-foreground hover:text-foreground/80"}`}
          style={{ transitionDuration: "100ms" }}
        >
          <LayoutList className="h-3 w-3" />
          With integration
        </button>
      </div>

      {/* Content panel */}
      <div
        className="rounded-sm border p-3 transition-all"
        style={{
          backgroundColor: isBefore
            ? "color-mix(in oklch, var(--destructive) 5%, transparent)"
            : "color-mix(in oklch, var(--success) 5%, transparent)",
          borderColor: isBefore
            ? "color-mix(in oklch, var(--destructive) 18%, transparent)"
            : "color-mix(in oklch, var(--success) 18%, transparent)",
          transitionDuration: "150ms",
        }}
      >
        <p className="text-[10px] font-mono uppercase tracking-wide mb-2.5"
          style={{ color: isBefore ? "var(--destructive)" : "var(--success)" }}
        >
          {isBefore ? "Manual log inspection — current process" : "Centralized error queue — after integration"}
        </p>
        <ul className="space-y-1.5">
          {(isBefore ? beforeItems : afterItems).map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              {isBefore ? (
                <X className="h-3.5 w-3.5 mt-0.5 shrink-0 text-destructive/70" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[color:var(--success)]" />
              )}
              <span className="text-xs text-foreground/80 leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Time stat row */}
      <div className="flex items-center gap-3 px-3 py-2 rounded-sm border border-border/50 bg-muted/20">
        <div className="text-center">
          <p className="font-mono text-base font-bold text-muted-foreground">45 min</p>
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">current</p>
        </div>
        <div className="flex-1 h-px bg-border/60 relative">
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/60 font-mono whitespace-nowrap">
            per incident
          </span>
        </div>
        <div className="text-center">
          <p className="font-mono text-base font-bold text-[color:var(--success)]">&lt; 5 min</p>
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">proposed</p>
        </div>
      </div>
    </div>
  );
}
