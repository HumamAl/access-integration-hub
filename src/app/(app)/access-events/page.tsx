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
  ChevronUp,
  ChevronDown,
  Download,
  Eye,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { accessEvents } from "@/data/mock-data";
import type { AccessEvent, AccessEventType } from "@/lib/types";

// ─── Status badge for event types ─────────────────────────────────────────────

function EventTypeBadge({ type }: { type: AccessEventType }) {
  const cfg: Record<AccessEventType, { label: string; cls: string }> = {
    "Access Granted":           { label: "Granted",          cls: "text-[color:var(--success)] bg-[color:var(--success)]/10" },
    "Access Denied":            { label: "Denied",           cls: "text-destructive bg-destructive/10" },
    "Door Forced Open":         { label: "Door Forced",      cls: "text-destructive bg-destructive/10" },
    "Door Held Open":           { label: "Door Held",        cls: "text-[color:var(--warning)] bg-[color:var(--warning)]/10" },
    "Anti-Passback Violation":  { label: "Anti-Passback",    cls: "text-[color:var(--warning)] bg-[color:var(--warning)]/10" },
    "Controller Offline":       { label: "Ctrl Offline",     cls: "text-destructive bg-destructive/10" },
    "Credential Expired":       { label: "Cred Expired",     cls: "text-[color:var(--warning)] bg-[color:var(--warning)]/10" },
    "Duress Code Used":         { label: "Duress",           cls: "text-destructive bg-destructive/10" },
    "Lockdown Activated":       { label: "Lockdown",         cls: "text-destructive bg-destructive/10" },
  };
  const c = cfg[type] ?? { label: type, cls: "text-muted-foreground bg-muted" };
  return (
    <Badge variant="outline" className={cn("text-[11px] font-medium border-0 rounded-sm whitespace-nowrap", c.cls)}>
      {c.label}
    </Badge>
  );
}

function ProviderBadge({ provider }: { provider: string }) {
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

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

type SortKey = "timestamp" | "cardholderName" | "doorName" | "eventType" | "provider";

const eventTypeOptions: AccessEventType[] = [
  "Access Granted",
  "Access Denied",
  "Door Forced Open",
  "Door Held Open",
  "Anti-Passback Violation",
  "Controller Offline",
  "Credential Expired",
  "Duress Code Used",
  "Lockdown Activated",
];

export default function AccessEventsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const displayed = useMemo(() => {
    return accessEvents
      .filter((e) => {
        const q = search.toLowerCase();
        const matchSearch =
          q === "" ||
          (e.cardholderName ?? "").toLowerCase().includes(q) ||
          e.doorName.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.site.toLowerCase().includes(q);
        const matchType = typeFilter === "all" || e.eventType === typeFilter;
        const matchProvider = providerFilter === "all" || e.provider === providerFilter;
        return matchSearch && matchType && matchProvider;
      })
      .sort((a, b) => {
        let av: string, bv: string;
        if (sortKey === "timestamp") {
          av = a.timestamp; bv = b.timestamp;
        } else if (sortKey === "cardholderName") {
          av = a.cardholderName ?? ""; bv = b.cardholderName ?? "";
        } else if (sortKey === "doorName") {
          av = a.doorName; bv = b.doorName;
        } else if (sortKey === "eventType") {
          av = a.eventType; bv = b.eventType;
        } else {
          av = a.provider; bv = b.provider;
        }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [search, typeFilter, providerFilter, sortKey, sortDir]);

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 inline ml-0.5" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-0.5" />
    );
  }

  return (
    <div className="space-y-[var(--section-gap,1rem)]" style={{ padding: "var(--content-padding,1rem)" }}>
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Access Event Log</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time events from CCURE 9000 and Lenel OnGuard across all sites
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search cardholder, door, site..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-7 text-xs"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 h-7 text-xs">
            <SelectValue placeholder="All event types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All event types</SelectItem>
            {eventTypeOptions.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
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
          {displayed.length} of {accessEvents.length} events
        </span>
      </div>

      {/* Event log table */}
      <div className="linear-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors duration-100 w-36"
                  onClick={() => handleSort("timestamp")}
                >
                  Timestamp <SortIcon col="timestamp" />
                </TableHead>
                <TableHead
                  className="bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors duration-100"
                  onClick={() => handleSort("cardholderName")}
                >
                  Cardholder <SortIcon col="cardholderName" />
                </TableHead>
                <TableHead className="bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  Badge #
                </TableHead>
                <TableHead
                  className="bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors duration-100"
                  onClick={() => handleSort("doorName")}
                >
                  Door <SortIcon col="doorName" />
                </TableHead>
                <TableHead
                  className="bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors duration-100"
                  onClick={() => handleSort("eventType")}
                >
                  Event Type <SortIcon col="eventType" />
                </TableHead>
                <TableHead
                  className="bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors duration-100"
                  onClick={() => handleSort("provider")}
                >
                  Provider <SortIcon col="provider" />
                </TableHead>
                <TableHead className="bg-muted/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wide text-right">
                  Ack
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-xs text-muted-foreground">
                    No access events match this filter.
                  </TableCell>
                </TableRow>
              ) : (
                displayed.map((event) => (
                  <>
                    <TableRow
                      key={event.id}
                      className="cursor-pointer hover:bg-[color:var(--surface-hover)] transition-colors duration-100"
                      onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                    >
                      <TableCell className="font-mono text-[11px] text-muted-foreground">
                        {formatTimestamp(event.timestamp)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {event.cardholderName ?? (
                          <span className="text-muted-foreground italic">Anonymous</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">
                        {/* Badge number lookup via cardholderId is not available inline, show event ID */}
                        <span className="text-[10px]">{event.cardholderId ?? "—"}</span>
                      </TableCell>
                      <TableCell className="text-xs max-w-[180px] truncate">{event.doorName}</TableCell>
                      <TableCell>
                        <EventTypeBadge type={event.eventType} />
                      </TableCell>
                      <TableCell>
                        <ProviderBadge provider={event.provider} />
                      </TableCell>
                      <TableCell className="text-right">
                        {event.acknowledged ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[color:var(--success)] inline" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-[color:var(--warning)] inline" />
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedId === event.id && (
                      <TableRow key={`${event.id}-detail`}>
                        <TableCell colSpan={7} className="bg-muted/30 px-4 py-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Event ID</p>
                              <p className="font-mono">{event.id}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Controller</p>
                              <p className="font-mono">{event.controllerId}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Site</p>
                              <p>{event.site}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Acknowledged</p>
                              <p>{event.acknowledged ? "Yes" : "Pending review"}</p>
                            </div>
                            {event.reason && (
                              <div className="col-span-2 md:col-span-4">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Reason / Notes</p>
                                <p className="text-muted-foreground">{event.reason}</p>
                              </div>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Button size="sm" variant="outline" className="text-[11px] h-6">
                              <Eye className="w-3 h-3 mr-1" />
                              View Cardholder
                            </Button>
                            {!event.acknowledged && (
                              <Button size="sm" variant="outline" className="text-[11px] h-6">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Acknowledge
                              </Button>
                            )}
                          </div>
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
    </div>
  );
}
