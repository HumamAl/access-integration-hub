"use client";

// Flow diagram: bi-directional sync with queue, retry, and alert generation
// Interactive: step-through reveal showing how a sync event flows through the system

import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface FlowStep {
  id: number;
  direction: "outbound" | "inbound" | "internal";
  label: string;
  sublabel: string;
  status: "normal" | "error" | "recovery" | "success";
}

const steps: FlowStep[] = [
  {
    id: 1,
    direction: "outbound",
    label: "Platform triggers delta sync",
    sublabel: "Cardholder update queued → sync job dispatched to provider adapter",
    status: "normal",
  },
  {
    id: 2,
    direction: "outbound",
    label: "Adapter calls provider API",
    sublabel: "CCURE: POST /ClearanceAssignment via Victor Web Services | Lenel: PUT /cardholders via OpenAccess REST",
    status: "normal",
  },
  {
    id: 3,
    direction: "inbound",
    label: "Provider returns response",
    sublabel: "Success: record confirmed → sync status updated to 'Synced' | Failure: error captured into retry queue",
    status: "error",
  },
  {
    id: 4,
    direction: "internal",
    label: "Retry queue with backoff",
    sublabel: "Failed events queued with exponential backoff — up to 3 automatic retries before alert escalation",
    status: "recovery",
  },
  {
    id: 5,
    direction: "inbound",
    label: "Alert generated on threshold breach",
    sublabel: "After 3 failed retries: sync failure alert surfaced in platform dashboard with event-level detail",
    status: "success",
  },
];

const statusConfig = {
  normal: { color: "text-primary", bg: "color-mix(in oklch, var(--primary) 6%, transparent)", border: "color-mix(in oklch, var(--primary) 20%, transparent)" },
  error: { color: "text-destructive", bg: "color-mix(in oklch, var(--destructive) 6%, transparent)", border: "color-mix(in oklch, var(--destructive) 20%, transparent)" },
  recovery: { color: "text-warning", bg: "color-mix(in oklch, var(--warning) 6%, transparent)", border: "color-mix(in oklch, var(--warning) 20%, transparent)" },
  success: { color: "text-[color:var(--success)]", bg: "color-mix(in oklch, var(--success) 6%, transparent)", border: "color-mix(in oklch, var(--success) 20%, transparent)" },
};

const directionIcon = {
  outbound: <ArrowRight className="h-3 w-3 shrink-0" />,
  inbound: <ArrowLeft className="h-3 w-3 shrink-0" />,
  internal: <RefreshCw className="h-3 w-3 shrink-0" />,
};

const statusIcon = {
  normal: null,
  error: <AlertTriangle className="h-3 w-3 shrink-0 text-destructive" />,
  recovery: <RefreshCw className="h-3 w-3 shrink-0 text-warning" />,
  success: <CheckCircle2 className="h-3 w-3 shrink-0 text-[color:var(--success)]" />,
};

export function VizSyncFlow() {
  const [currentStep, setCurrentStep] = useState(0);

  const active = steps[currentStep];
  const cfg = statusConfig[active.status];

  return (
    <div className="space-y-3">
      {/* Step strip */}
      <div className="flex items-center gap-1">
        {steps.map((step, i) => (
          <button
            key={step.id}
            type="button"
            onClick={() => setCurrentStep(i)}
            className={`h-1.5 flex-1 rounded-full transition-all ${i === currentStep ? "bg-primary" : i < currentStep ? "bg-primary/30" : "bg-border/60"}`}
            style={{ transitionDuration: "100ms" }}
            aria-label={`Go to step ${step.id}`}
          />
        ))}
      </div>

      {/* Active step */}
      <div
        className="rounded-sm p-3 border transition-all"
        style={{
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
          transitionDuration: "100ms",
        }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`font-mono text-[10px] uppercase tracking-wide ${cfg.color}`}>
            Step {active.id} / {steps.length}
          </span>
          <span className={`${cfg.color}`}>{directionIcon[active.direction]}</span>
          {statusIcon[active.status] && (
            <span className="ml-auto">{statusIcon[active.status]}</span>
          )}
        </div>
        <p className="text-xs font-semibold text-foreground mb-0.5">{active.label}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{active.sublabel}</p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style={{ transitionDuration: "100ms" }}
        >
          <ChevronLeft className="h-3 w-3" /> Prev
        </button>
        <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wide">
          Platform ↔ PACS sync flow
        </span>
        <button
          type="button"
          onClick={() => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))}
          disabled={currentStep === steps.length - 1}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style={{ transitionDuration: "100ms" }}
        >
          Next <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
