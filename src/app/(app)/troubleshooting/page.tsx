"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  XCircle,
  RefreshCw,
  CheckCircle2,
  WifiOff,
  Clock,
  ChevronDown,
  ChevronUp,
  ServerCrash,
  ShieldAlert,
  Copy,
} from "lucide-react";
import {
  controllers,
  syncOperations,
  cardholders,
  credentials,
} from "@/data/mock-data";

// ─── Derived error data from mock datasets ────────────────────────────────────

const failedSyncs = syncOperations.filter(
  (s) => s.status === "Failed" || s.status === "Partial"
);

const offlineControllers = controllers.filter(
  (c) => c.status === "Offline" || c.status === "Warning"
);

const syncErrorCardholders = cardholders.filter(
  (c) => c.syncStatus === "Sync Failed" && c.syncErrorMessage
);

// Credential conflicts — disabled in one system but not the other
const credentialConflicts = credentials.filter(
  (cr) => cr.note && (cr.note.includes("cross-system") || cr.note.includes("Lenel") || cr.note.includes("pending"))
);

// ─── Status badges ────────────────────────────────────────────────────────────

function ErrorSeverityBadge({ severity }: { severity: "critical" | "warning" | "info" }) {
  const cfg = {
    critical: { label: "Critical", cls: "text-destructive bg-destructive/10" },
    warning:  { label: "Warning",  cls: "text-[color:var(--warning)] bg-[color:var(--warning)]/10" },
    info:     { label: "Info",     cls: "text-primary bg-primary/10" },
  }[severity];
  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium border-0 rounded-sm", cfg.cls)}>
      {cfg.label}
    </Badge>
  );
}

function formatTs(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

// ─── Retry state management ───────────────────────────────────────────────────

type RetryState = "idle" | "retrying" | "retried";

export default function TroubleshootingPage() {
  const [dismissedSyncs, setDismissedSyncs] = useState<Set<string>>(new Set());
  const [dismissedCtls, setDismissedCtls] = useState<Set<string>>(new Set());
  const [dismissedChs, setDismissedChs] = useState<Set<string>>(new Set());
  const [dismissedCreds, setDismissedCreds] = useState<Set<string>>(new Set());
  const [retryStates, setRetryStates] = useState<Record<string, RetryState>>({});
  const [expandedSync, setExpandedSync] = useState<string | null>(null);
  const [expandedCh, setExpandedCh] = useState<string | null>(null);

  function retrySyncOp(id: string) {
    setRetryStates((prev) => ({ ...prev, [id]: "retrying" }));
    setTimeout(() => {
      setRetryStates((prev) => ({ ...prev, [id]: "retried" }));
    }, 1200);
  }

  const activeSyncs = failedSyncs.filter((s) => !dismissedSyncs.has(s.id));
  const activeCtls = offlineControllers.filter((c) => !dismissedCtls.has(c.id));
  const activeChs = syncErrorCardholders.filter((c) => !dismissedChs.has(c.id));
  const activeCreds = credentialConflicts.filter((c) => !dismissedCreds.has(c.id));

  const totalErrors = activeSyncs.length + activeCtls.length + activeChs.length + activeCreds.length;

  return (
    <div className="space-y-[var(--section-gap,1rem)]" style={{ padding: "var(--content-padding,1rem)" }}>
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Troubleshooting</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Error queue, offline controllers, and credential conflicts requiring attention
          </p>
        </div>
        <div className="flex items-center gap-2">
          {totalErrors > 0 && (
            <Badge variant="outline" className="text-xs border-0 rounded-sm text-destructive bg-destructive/10">
              {totalErrors} active {totalErrors === 1 ? "issue" : "issues"}
            </Badge>
          )}
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* All clear state */}
      {totalErrors === 0 && (
        <div className="linear-card flex items-center gap-3 px-4 py-8 justify-center flex-col text-center">
          <CheckCircle2 className="w-8 h-8 text-[color:var(--success)]" />
          <div>
            <p className="text-sm font-medium">All systems operational</p>
            <p className="text-xs text-muted-foreground mt-0.5">No active errors or conflicts detected</p>
          </div>
        </div>
      )}

      {/* ── Section 1: Failed / Partial Sync Operations ─────────────────────── */}
      {activeSyncs.length > 0 && (
        <div className="linear-card overflow-hidden">
          <div className="border-b border-border/60 px-4 py-2 bg-muted/30 flex items-center gap-2">
            <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
            <h2 className="text-xs font-semibold">Failed Sync Operations</h2>
            <Badge variant="outline" className="text-[10px] border-0 rounded-sm text-destructive bg-destructive/10 ml-auto">
              {activeSyncs.length}
            </Badge>
          </div>
          <div className="divide-y divide-border/40">
            {activeSyncs.map((op) => {
              const retry = retryStates[op.id] ?? "idle";
              const isExpanded = expandedSync === op.id;
              return (
                <div key={op.id} className="px-4 py-3">
                  <div
                    className="flex items-start justify-between cursor-pointer gap-2"
                    onClick={() => setExpandedSync(isExpanded ? null : op.id)}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <AlertTriangle className={cn(
                        "w-4 h-4 shrink-0 mt-0.5",
                        op.status === "Failed" ? "text-destructive" : "text-[color:var(--warning)]"
                      )} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium">{op.type}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{op.id}</span>
                          <ErrorSeverityBadge severity={op.status === "Failed" ? "critical" : "warning"} />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Provider: {op.provider} · Triggered: {formatTs(op.timestamp)} · By: {op.triggeredBy}
                        </p>
                        {!isExpanded && op.errorMessage && (
                          <p className="text-[11px] text-[color:var(--warning)] mt-0.5 truncate max-w-lg">
                            {op.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pl-7 space-y-2">
                      {op.errorMessage && (
                        <div className="bg-muted/40 rounded-sm px-3 py-2 flex items-start gap-2">
                          <p className="text-[11px] text-foreground font-mono break-all">{op.errorMessage}</p>
                          <button
                            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors duration-100"
                            onClick={() => navigator.clipboard?.writeText(op.errorMessage ?? "")}
                            title="Copy error"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <div className="text-[11px] text-muted-foreground space-y-0.5">
                        <p><span className="text-foreground">Endpoint:</span> <span className="font-mono">{op.apiEndpoint}</span></p>
                        <p><span className="text-foreground">Records processed:</span> {op.recordsProcessed} · <span className="text-destructive">Failed: {op.recordsFailed}</span></p>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          variant={retry === "retried" ? "outline" : "default"}
                          className="text-[11px] h-6"
                          disabled={retry === "retrying"}
                          onClick={(e) => { e.stopPropagation(); retrySyncOp(op.id); }}
                        >
                          {retry === "retrying" ? (
                            <><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Retrying...</>
                          ) : retry === "retried" ? (
                            <><CheckCircle2 className="w-3 h-3 mr-1 text-[color:var(--success)]" />Retried</>
                          ) : (
                            <><RefreshCw className="w-3 h-3 mr-1" />Retry Sync</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[11px] h-6"
                          onClick={(e) => { e.stopPropagation(); setDismissedSyncs((prev) => new Set([...prev, op.id])); }}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Section 2: Offline / Warning Controllers ────────────────────────── */}
      {activeCtls.length > 0 && (
        <div className="linear-card overflow-hidden">
          <div className="border-b border-border/60 px-4 py-2 bg-muted/30 flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-destructive shrink-0" />
            <h2 className="text-xs font-semibold">Offline / Warning Controllers</h2>
            <Badge variant="outline" className="text-[10px] border-0 rounded-sm text-destructive bg-destructive/10 ml-auto">
              {activeCtls.length}
            </Badge>
          </div>
          <div className="divide-y divide-border/40">
            {activeCtls.map((ctl) => (
              <div key={ctl.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <ServerCrash className={cn(
                      "w-4 h-4 shrink-0 mt-0.5",
                      ctl.status === "Offline" ? "text-destructive" : "text-[color:var(--warning)]"
                    )} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium">{ctl.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{ctl.id}</span>
                        <ErrorSeverityBadge severity={ctl.status === "Offline" ? "critical" : "warning"} />
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 space-y-0.5">
                        <p>
                          Model: <span className="font-mono">{ctl.model}</span> ·
                          IP: <span className="font-mono">{ctl.ipAddress}</span> ·
                          Provider: {ctl.provider}
                        </p>
                        <p>
                          Last heartbeat: <span className="font-mono">{formatTs(ctl.lastHeartbeat)}</span> ·
                          Site: {ctl.site}
                        </p>
                        {ctl.alertMessage && (
                          <p className="text-[color:var(--warning)] mt-1">{ctl.alertMessage}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[11px] h-6"
                      onClick={() => setDismissedCtls((prev) => new Set([...prev, ctl.id]))}
                    >
                      Acknowledge
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section 3: Cardholder Sync Failures ─────────────────────────────── */}
      {activeChs.length > 0 && (
        <div className="linear-card overflow-hidden">
          <div className="border-b border-border/60 px-4 py-2 bg-muted/30 flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-[color:var(--warning)] shrink-0" />
            <h2 className="text-xs font-semibold">Cardholder Sync Failures</h2>
            <Badge variant="outline" className="text-[10px] border-0 rounded-sm text-[color:var(--warning)] bg-[color:var(--warning)]/10 ml-auto">
              {activeChs.length}
            </Badge>
          </div>
          <div className="divide-y divide-border/40">
            {activeChs.map((ch) => {
              const isExpanded = expandedCh === ch.id;
              return (
                <div key={ch.id} className="px-4 py-3">
                  <div
                    className="flex items-start justify-between cursor-pointer gap-2"
                    onClick={() => setExpandedCh(isExpanded ? null : ch.id)}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[color:var(--warning)]" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium">
                            {ch.firstName} {ch.lastName}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">{ch.badgeNumber}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{ch.id}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {ch.department} · {ch.title} · Provider: {ch.syncProvider} · Last sync: {formatTs(ch.lastSync)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pl-7 space-y-2">
                      {ch.syncErrorMessage && (
                        <div className="bg-[color:var(--warning)]/8 border border-[color:var(--warning)]/20 rounded-sm px-3 py-2">
                          <p className="text-[11px] text-[color:var(--warning)]">{ch.syncErrorMessage}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <Button size="sm" variant="default" className="text-[11px] h-6">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Retry Cardholder Sync
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[11px] h-6"
                          onClick={(e) => { e.stopPropagation(); setDismissedChs((prev) => new Set([...prev, ch.id])); }}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Section 4: Credential Conflicts ─────────────────────────────────── */}
      {activeCreds.length > 0 && (
        <div className="linear-card overflow-hidden">
          <div className="border-b border-border/60 px-4 py-2 bg-muted/30 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[color:var(--warning)] shrink-0" />
            <h2 className="text-xs font-semibold">Credential Conflicts</h2>
            <Badge variant="outline" className="text-[10px] border-0 rounded-sm text-[color:var(--warning)] bg-[color:var(--warning)]/10 ml-auto">
              {activeCreds.length}
            </Badge>
          </div>
          <div className="divide-y divide-border/40">
            {activeCreds.map((cr) => (
              <div key={cr.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[color:var(--warning)]" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium font-mono">{cr.id}</span>
                        <span className="text-[10px] text-muted-foreground">Format: {cr.badgeFormat}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">Card #{cr.cardNumber}</span>
                        <ErrorSeverityBadge severity={cr.status === "Expired" ? "critical" : "warning"} />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Status: {cr.status} · Enrolled in: {cr.enrolledIn}
                      </p>
                      {cr.note && (
                        <p className="text-[11px] text-[color:var(--warning)] mt-1">{cr.note}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[11px] h-6 shrink-0"
                    onClick={() => setDismissedCreds((prev) => new Set([...prev, cr.id]))}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
