"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Activity,
  ArrowRight,
  Download,
} from "lucide-react";
import {
  syncOperations,
  accessLevels,
} from "@/data/mock-data";
import type { SyncOperation, SyncOperationStatus, AccessProvider } from "@/lib/types";

// ─── Status badge ──────────────────────────────────────────────────────────────

function SyncStatusBadge({ status }: { status: SyncOperationStatus }) {
  const cfg: Record<SyncOperationStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    Success:      { label: "Success",     cls: "text-[color:var(--success)] bg-[color:var(--success)]/10",     icon: <CheckCircle2 className="w-3 h-3" /> },
    Failed:       { label: "Failed",      cls: "text-destructive bg-destructive/10",                           icon: <XCircle className="w-3 h-3" /> },
    Partial:      { label: "Partial",     cls: "text-[color:var(--warning)] bg-[color:var(--warning)]/10",     icon: <AlertTriangle className="w-3 h-3" /> },
    "In Progress":{ label: "In Progress", cls: "text-primary bg-primary/10",                                   icon: <Activity className="w-3 h-3" /> },
    Queued:       { label: "Queued",      cls: "text-muted-foreground bg-muted",                               icon: <Clock className="w-3 h-3" /> },
  };
  const c = cfg[status] ?? { label: status, cls: "text-muted-foreground bg-muted", icon: null };
  return (
    <Badge variant="outline" className={cn("text-[11px] font-medium border-0 rounded-sm gap-1 flex items-center", c.cls)}>
      {c.icon}
      {c.label}
    </Badge>
  );
}

function ProviderTag({ provider }: { provider: AccessProvider | string }) {
  const cls =
    provider === "CCURE"
      ? "text-primary bg-primary/10"
      : provider === "Lenel"
      ? "text-[color:var(--accent)] bg-[color:var(--accent)]/10"
      : "text-muted-foreground bg-muted";
  return (
    <Badge variant="outline" className={cn("text-[10px] font-mono border-0 rounded-sm", cls)}>
      {provider}
    </Badge>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTs(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

function fmtDuration(s: number | null): string {
  if (s === null) return "—";
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

type SortKey = "timestamp" | "type" | "provider" | "status" | "recordsProcessed";

// ─── Access level mapping table data ──────────────────────────────────────────

const mappingTable = accessLevels.map((al) => ({
  ccureId: al.provider === "CCURE" || al.provider === "Both" ? al.id : "—",
  ccureName: al.provider === "CCURE" || al.provider === "Both" ? al.name : "—",
  lenelId: al.provider === "Lenel" || al.provider === "Both" ? al.id : "—",
  lenelName: al.provider === "Lenel" || al.provider === "Both" ? al.name : "—",
  mapped: al.crossProviderMapped,
  cardholders: al.cardholderCount,
}));

export default function CredentialSyncPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"operations" | "mapping">("operations");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const displayed = useMemo<SyncOperation[]>(() => {
    return syncOperations
      .filter((op) => {
        const q = search.toLowerCase();
        const matchSearch =
          q === "" ||
          op.id.toLowerCase().includes(q) ||
          op.type.toLowerCase().includes(q) ||
          op.apiEndpoint.toLowerCase().includes(q);
        const matchStatus = statusFilter === "all" || op.status === statusFilter;
        const matchProvider = providerFilter === "all" || op.provider === providerFilter;
        return matchSearch && matchStatus && matchProvider;
      })
      .sort((a, b) => {
        let av: string | number, bv: string | number;
        if (sortKey === "timestamp") { av = a.timestamp; bv = b.timestamp; }
        else if (sortKey === "type") { av = a.type; bv = b.type; }
        else if (sortKey === "provider") { av = a.provider; bv = b.provider; }
        else if (sortKey === "status") { av = a.status; bv = b.status; }
        else { av = a.recordsProcessed; bv = b.recordsProcessed; }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [search, statusFilter, providerFilter, sortKey, sortDir]);

  // Summary stats per provider
  const ccureSuccessRate = Math.round(
    (syncOperations.filter((s) => (s.provider === "CCURE" || s.provider === "Both") && s.status === "Success").length /
      Math.max(syncOperations.filter((s) => s.provider === "CCURE" || s.provider === "Both").length, 1)) * 100
  );
  const lenelSuccessRate = Math.round(
    (syncOperations.filter((s) => (s.provider === "Lenel" || s.provider === "Both") && s.status === "Success").length /
      Math.max(syncOperations.filter((s) => s.provider === "Lenel" || s.provider === "Both").length, 1)) * 100
  );
  const totalFailed = syncOperations.filter((s) => s.status === "Failed" || s.status === "Partial").length;

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />;
  }

  return (
    <div className="space-y-[var(--section-gap,1rem)]" style={{ padding: "var(--content-padding,1rem)" }}>
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Credential Sync</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cardholder synchronization monitoring — CCURE Clearances ↔ Lenel Access Levels
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
          <Download className="w-3.5 h-3.5" />
          Export Log
        </Button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--grid-gap,0.75rem)]">
        {[
          { label: "CCURE Sync Rate", value: `${ccureSuccessRate}%`, sub: "Victor Web Services", color: "text-[color:var(--success)]" },
          { label: "Lenel Sync Rate", value: `${lenelSuccessRate}%`, sub: "OpenAccess REST", color: "text-[color:var(--success)]" },
          { label: "Failed / Partial", value: String(totalFailed), sub: "require attention", color: totalFailed > 0 ? "text-[color:var(--warning)]" : "text-[color:var(--success)]" },
          { label: "Access Level Maps", value: `${accessLevels.filter((a) => a.crossProviderMapped).length}/${accessLevels.length}`, sub: "cross-provider verified", color: "text-primary" },
        ].map((stat) => (
          <div key={stat.label} className="linear-card" style={{ padding: "var(--card-padding-sm,0.75rem)" }}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</p>
            <p className={cn("text-xl font-mono font-semibold mt-0.5", stat.color)}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 border-b border-border/60">
        <button
          onClick={() => setActiveTab("operations")}
          className={cn(
            "text-xs px-3 py-2 border-b-2 transition-colors duration-100",
            activeTab === "operations"
              ? "border-primary text-primary font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Sync Operations
        </button>
        <button
          onClick={() => setActiveTab("mapping")}
          className={cn(
            "text-xs px-3 py-2 border-b-2 transition-colors duration-100",
            activeTab === "mapping"
              ? "border-primary text-primary font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Clearance ↔ Access Level Mapping
        </button>
      </div>

      {activeTab === "operations" ? (
        <>
          {/* Filter bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search operations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-7 text-xs"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-7 text-xs">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Success">Success</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Queued">Queued</SelectItem>
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-32 h-7 text-xs">
                <SelectValue placeholder="All providers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All providers</SelectItem>
                <SelectItem value="CCURE">CCURE 9000</SelectItem>
                <SelectItem value="Lenel">Lenel OnGuard</SelectItem>
                <SelectItem value="Both">Both</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground shrink-0">
              {displayed.length} operations
            </span>
          </div>

          {/* Sync operations table */}
          <div className="linear-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors duration-100 w-36"
                      onClick={() => handleSort("timestamp")}
                    >
                      Triggered <SortIcon col="timestamp" />
                    </TableHead>
                    <TableHead
                      className="bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors duration-100"
                      onClick={() => handleSort("type")}
                    >
                      Sync Type <SortIcon col="type" />
                    </TableHead>
                    <TableHead
                      className="bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors duration-100"
                      onClick={() => handleSort("provider")}
                    >
                      Provider <SortIcon col="provider" />
                    </TableHead>
                    <TableHead
                      className="bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors duration-100 text-right"
                      onClick={() => handleSort("recordsProcessed")}
                    >
                      Processed <SortIcon col="recordsProcessed" />
                    </TableHead>
                    <TableHead className="bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide text-right">
                      Failed
                    </TableHead>
                    <TableHead className="bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide text-right">
                      Duration
                    </TableHead>
                    <TableHead
                      className="bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors duration-100"
                      onClick={() => handleSort("status")}
                    >
                      Status <SortIcon col="status" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayed.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-xs text-muted-foreground">
                        No sync operations match this filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayed.map((op) => (
                      <>
                        <TableRow
                          key={op.id}
                          className="cursor-pointer hover:bg-[color:var(--surface-hover)] transition-colors duration-100"
                          onClick={() => setExpandedId(expandedId === op.id ? null : op.id)}
                        >
                          <TableCell className="font-mono text-[11px] text-muted-foreground">
                            {formatTs(op.timestamp)}
                          </TableCell>
                          <TableCell className="text-xs">{op.type}</TableCell>
                          <TableCell>
                            <ProviderTag provider={op.provider} />
                          </TableCell>
                          <TableCell className="font-mono text-xs text-right">
                            {op.recordsProcessed.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-right">
                            {op.recordsFailed > 0 ? (
                              <span className="text-[color:var(--warning)]">{op.recordsFailed}</span>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-right text-muted-foreground">
                            {fmtDuration(op.durationSeconds)}
                          </TableCell>
                          <TableCell>
                            <SyncStatusBadge status={op.status} />
                          </TableCell>
                        </TableRow>
                        {expandedId === op.id && (
                          <TableRow key={`${op.id}-detail`}>
                            <TableCell colSpan={7} className="bg-muted/30 px-4 py-3">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Operation ID</p>
                                  <p className="font-mono">{op.id}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Triggered By</p>
                                  <p>{op.triggeredBy}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Completed At</p>
                                  <p className="font-mono">{op.completedAt ? formatTs(op.completedAt) : "In progress"}</p>
                                </div>
                                <div className="col-span-2 md:col-span-3">
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">API Endpoint</p>
                                  <p className="font-mono text-[11px] break-all">{op.apiEndpoint}</p>
                                </div>
                                {op.errorMessage && (
                                  <div className="col-span-2 md:col-span-3">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Error Message</p>
                                    <p className="text-[color:var(--warning)] text-[11px]">{op.errorMessage}</p>
                                  </div>
                                )}
                              </div>
                              {(op.status === "Failed" || op.status === "Partial") && (
                                <div className="mt-2">
                                  <Button size="sm" variant="outline" className="text-[11px] h-6">
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    Retry Sync
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      ) : (
        /* Access level mapping table */
        <div className="linear-card overflow-hidden">
          <div className="border-b border-border/60 px-4 py-2 bg-muted/30 flex items-center justify-between">
            <div>
              <h2 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                CCURE Clearance ↔ Lenel Access Level Mapping
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {accessLevels.filter((a) => a.crossProviderMapped).length} of {accessLevels.length} levels verified for cross-provider sync
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    CCURE Clearance
                  </TableHead>
                  <TableHead className="bg-muted/40 text-[10px] text-center">
                    <ArrowRight className="w-3 h-3 mx-auto text-muted-foreground" />
                  </TableHead>
                  <TableHead className="bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    Lenel Access Level
                  </TableHead>
                  <TableHead className="bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide text-right">
                    Cardholders
                  </TableHead>
                  <TableHead className="bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    Mapping Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accessLevels.map((al) => (
                  <TableRow
                    key={al.id}
                    className="hover:bg-[color:var(--surface-hover)] transition-colors duration-100"
                  >
                    <TableCell className="text-xs">
                      {al.provider === "CCURE" || al.provider === "Both" ? (
                        <div>
                          <p className="font-medium">{al.name}</p>
                          <p className="text-[10px] font-mono text-muted-foreground">{al.id}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <ArrowRight className={cn("w-3 h-3 mx-auto", al.crossProviderMapped ? "text-[color:var(--success)]" : "text-destructive")} />
                    </TableCell>
                    <TableCell className="text-xs">
                      {al.provider === "Lenel" || al.provider === "Both" ? (
                        <div>
                          <p className="font-medium">{al.name}</p>
                          <p className="text-[10px] font-mono text-muted-foreground">{al.id}</p>
                        </div>
                      ) : al.crossProviderMapped ? (
                        <span className="text-muted-foreground text-[11px]">Mapped in Lenel</span>
                      ) : (
                        <span className="text-destructive text-[11px]">No equivalent — manual mapping required</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-right text-muted-foreground">
                      {al.cardholderCount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {al.crossProviderMapped ? (
                        <Badge variant="outline" className="text-[10px] border-0 rounded-sm text-[color:var(--success)] bg-[color:var(--success)]/10 gap-1 flex items-center w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-0 rounded-sm text-destructive bg-destructive/10 gap-1 flex items-center w-fit">
                          <AlertTriangle className="w-3 h-3" /> Unmapped
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
