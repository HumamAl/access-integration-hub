"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plug,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Wifi,
  WifiOff,
  Activity,
  ChevronDown,
  ChevronUp,
  Server,
  Lock,
  AlertTriangle,
} from "lucide-react";

// ─── Provider connection data ─────────────────────────────────────────────────

type ProviderStatus = "Connected" | "Disconnected" | "Warning";

interface ProviderConfig {
  id: string;
  name: string;
  version: string;
  apiType: string;
  apiEndpoint: string;
  port: number;
  authMethod: string;
  protocol: string;
  lastHeartbeat: string;
  eventsStreamed: number;
  syncOpsCount: number;
  status: ProviderStatus;
  alertMessage?: string;
  connectionHistory: { time: string; event: string; status: "ok" | "warn" | "error" }[];
}

const providers: ProviderConfig[] = [
  {
    id: "ccure",
    name: "CCURE 9000",
    version: "v9.40.2",
    apiType: "Victor Web Services (SOAP/REST)",
    apiEndpoint: "https://ccure-app.corp.local:8888/victorwebservice",
    port: 8888,
    authMethod: "Windows Authentication (NTLM)",
    protocol: "HTTPS / TLS 1.3",
    lastHeartbeat: "09:41 today",
    eventsStreamed: 22841,
    syncOpsCount: 934,
    status: "Connected",
    connectionHistory: [
      { time: "09:41", event: "Heartbeat OK", status: "ok" },
      { time: "09:26", event: "Heartbeat OK", status: "ok" },
      { time: "09:11", event: "Heartbeat OK", status: "ok" },
      { time: "08:56", event: "Delta Sync completed (183 records)", status: "ok" },
      { time: "07:14", event: "Heartbeat timeout — CTL-0043 segment", status: "warn" },
      { time: "07:00", event: "Scheduled sync triggered", status: "ok" },
      { time: "Mar 3 23:00", event: "Full sync completed (4,718 records)", status: "ok" },
      { time: "Mar 2 09:14", event: "VWS connection lost — 12s timeout", status: "error" },
    ],
  },
  {
    id: "lenel",
    name: "Lenel OnGuard",
    version: "v8.1.200",
    apiType: "OpenAccess REST API + DataConduIT",
    apiEndpoint: "https://lenel-acs.corp.local/api/access/onguard/v8",
    port: 443,
    authMethod: "OAuth 2.0 Bearer Token",
    protocol: "HTTPS / TLS 1.3",
    lastHeartbeat: "09:41 today",
    eventsStreamed: 15579,
    syncOpsCount: 1018,
    status: "Warning",
    alertMessage:
      "3 cardholder records failed access level mapping — 'Executive' clearance has no Lenel equivalent. Manual resolution required.",
    connectionHistory: [
      { time: "09:41", event: "Heartbeat OK", status: "ok" },
      { time: "09:26", event: "Heartbeat OK", status: "ok" },
      { time: "09:00", event: "Cardholder sync partial (3 mapping failures)", status: "warn" },
      { time: "08:00", event: "Credential sync completed (4,891 records)", status: "ok" },
      { time: "Mar 3 22:00", event: "Delta sync completed (91 records)", status: "ok" },
      { time: "Mar 3 16:00", event: "Access level sync partial (2 failures)", status: "warn" },
      { time: "Mar 3 08:00", event: "Scheduled sync triggered", status: "ok" },
      { time: "Mar 2 14:30", event: "OAuth token refresh OK", status: "ok" },
    ],
  },
];

function StatusBadge({ status }: { status: ProviderStatus }) {
  const cfg: Record<ProviderStatus, { label: string; cls: string }> = {
    Connected:    { label: "Connected",    cls: "text-[color:var(--success)] bg-[color:var(--success)]/10" },
    Disconnected: { label: "Disconnected", cls: "text-destructive bg-destructive/10" },
    Warning:      { label: "Warning",      cls: "text-[color:var(--warning)] bg-[color:var(--warning)]/10" },
  };
  const c = cfg[status];
  return (
    <Badge variant="outline" className={cn("text-xs font-medium border-0 rounded-sm", c.cls)}>
      {c.label}
    </Badge>
  );
}

function HistoryDot({ status }: { status: "ok" | "warn" | "error" }) {
  return (
    <span
      className={cn(
        "inline-block w-1.5 h-1.5 rounded-full shrink-0 mt-1",
        status === "ok" && "bg-[color:var(--success)]",
        status === "warn" && "bg-[color:var(--warning)]",
        status === "error" && "bg-destructive"
      )}
    />
  );
}

export default function ProviderConnectionsPage() {
  const [expandedId, setExpandedId] = useState<string | null>("ccure");
  const [overrides, setOverrides] = useState<Record<string, ProviderStatus>>({});

  function toggleConnection(id: string, current: ProviderStatus) {
    setOverrides((prev) => ({
      ...prev,
      [id]: current === "Disconnected" ? "Connected" : "Disconnected",
    }));
  }

  return (
    <div className="space-y-[var(--section-gap,1rem)]" style={{ padding: "var(--content-padding,1rem)" }}>
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Provider Connections</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            CCURE 9000 (Victor Web Services) and Lenel OnGuard (OpenAccess REST) integration status
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
          <RefreshCw className="w-3.5 h-3.5" />
          Test All Connections
        </Button>
      </div>

      {/* Provider cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--grid-gap,0.75rem)]">
        {providers.map((provider) => {
          const effectiveStatus = overrides[provider.id] ?? provider.status;
          const isExpanded = expandedId === provider.id;
          const isLive = effectiveStatus !== "Disconnected";

          return (
            <div key={provider.id} className="linear-card overflow-hidden">
              {/* Card header — clickable to expand */}
              <div
                className="flex items-start justify-between cursor-pointer select-none hover:bg-[color:var(--surface-hover)] transition-colors duration-100"
                style={{ padding: "var(--card-padding,1rem)" }}
                onClick={() => setExpandedId(isExpanded ? null : provider.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded flex items-center justify-center shrink-0",
                      isLive ? "bg-primary/8 text-primary" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isLive ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-semibold">{provider.name}</h2>
                      <span className="text-xs text-muted-foreground font-mono">{provider.version}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{provider.apiType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <StatusBadge status={effectiveStatus} />
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Warning alert */}
              {provider.alertMessage && effectiveStatus !== "Disconnected" && (
                <div className="mx-3 mb-2 flex items-start gap-2 px-3 py-2 rounded-sm bg-[color:var(--warning)]/8 border border-[color:var(--warning)]/20">
                  <AlertTriangle className="w-3.5 h-3.5 text-[color:var(--warning)] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[color:var(--warning)]">{provider.alertMessage}</p>
                </div>
              )}

              {/* Stats row */}
              <div className="border-t border-border/60 grid grid-cols-3 divide-x divide-border/60">
                <div className="px-3 py-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Heartbeat</p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    {isLive ? (
                      <CheckCircle2 className="w-3 h-3 text-[color:var(--success)]" />
                    ) : (
                      <XCircle className="w-3 h-3 text-destructive" />
                    )}
                    <span className="text-xs font-mono font-medium">{isLive ? "OK" : "Down"}</span>
                  </div>
                </div>
                <div className="px-3 py-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Events</p>
                  <p className="text-xs font-mono font-semibold mt-0.5">
                    {provider.eventsStreamed.toLocaleString()}
                  </p>
                </div>
                <div className="px-3 py-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Syncs</p>
                  <p className="text-xs font-mono font-semibold mt-0.5">
                    {provider.syncOpsCount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div
                  className="border-t border-border/60"
                  style={{ padding: "var(--card-padding,1rem)" }}
                >
                  {/* Config details */}
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-2">
                    Configuration
                  </p>
                  <div className="space-y-1.5 mb-4">
                    {[
                      { icon: Server,   label: "Endpoint", value: provider.apiEndpoint },
                      { icon: Plug,     label: "Port",     value: String(provider.port) },
                      { icon: Lock,     label: "Auth",     value: provider.authMethod },
                      { icon: Activity, label: "Protocol", value: provider.protocol },
                      { icon: Clock,    label: "Last Heartbeat", value: provider.lastHeartbeat },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-2">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] text-muted-foreground">{label}: </span>
                          <span className="text-[11px] font-mono text-foreground break-all">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Connection history */}
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-2">
                    Connection History
                  </p>
                  <div className="space-y-1 mb-4">
                    {provider.connectionHistory.map((entry, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <HistoryDot status={entry.status} />
                        <span className="text-[11px] font-mono text-muted-foreground w-24 shrink-0">
                          {entry.time}
                        </span>
                        <span className="text-[11px] text-foreground">{entry.event}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant={isLive ? "outline" : "default"}
                      className="text-xs h-7"
                      onClick={() => toggleConnection(provider.id, effectiveStatus)}
                    >
                      {isLive ? (
                        <><WifiOff className="w-3 h-3 mr-1.5" />Disconnect</>
                      ) : (
                        <><Wifi className="w-3 h-3 mr-1.5" />Reconnect</>
                      )}
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      <Clock className="w-3 h-3 mr-1.5" />
                      Test Heartbeat
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Integration summary table */}
      <div className="linear-card overflow-hidden">
        <div className="border-b border-border/60 px-4 py-2 bg-muted/30">
          <h2 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Integration Summary
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Provider</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">API Type</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Authentication</th>
                <th className="text-right px-4 py-2 font-medium text-muted-foreground">Port</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => {
                const effectiveStatus = overrides[p.id] ?? p.status;
                return (
                  <tr
                    key={p.id}
                    className="border-b border-border/40 last:border-0 hover:bg-[color:var(--surface-hover)] transition-colors duration-100"
                  >
                    <td className="px-4 py-2.5 font-medium">{p.name}</td>
                    <td className="px-4 py-2.5 font-mono text-muted-foreground">{p.apiType}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{p.authMethod}</td>
                    <td className="px-4 py-2.5 font-mono text-right">{p.port}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={effectiveStatus} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
