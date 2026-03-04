"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  ShieldCheck,
  Activity,
  Users,
  CreditCard,
  AlertTriangle,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCcw,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/lib/config";
import {
  dashboardStats,
  dailyEventCounts,
  accessEvents,
  controllers,
  syncOperations,
} from "@/data/mock-data";
import type { AccessEvent, Controller, SyncOperation } from "@/lib/types";
import { DemoBanner } from "@/components/layout/conversion-elements";

// ── Chart: SSR-disabled dynamic import ─────────────────────────────────────
const AccessEventsChart = dynamic(
  () =>
    import("@/components/dashboard/access-events-chart").then(
      (m) => m.AccessEventsChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[260px] bg-muted/30 rounded animate-pulse" />
    ),
  }
);

// ── useCountUp — animates number from 0 to target on viewport entry ────────
function useCountUp(target: number, duration = 1100) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(target);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// ── Stat Card component ────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  description: string;
  icon: React.ReactNode;
  alertState?: "success" | "warning" | "danger" | "neutral";
  index: number;
  isFloat?: boolean;
  floatDecimals?: number;
}

function StatCard({
  title,
  value,
  suffix = "",
  prefix = "",
  description,
  icon,
  alertState = "neutral",
  index,
  isFloat = false,
  floatDecimals = 1,
}: StatCardProps) {
  const { count, ref } = useCountUp(isFloat ? Math.round(value * 10) : value);
  const displayValue = isFloat
    ? (count / 10).toFixed(floatDecimals)
    : count.toLocaleString();

  const alertColorMap: Record<string, string> = {
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
    neutral: "text-primary",
  };

  return (
    <div
      ref={ref}
      className="aesthetic-card animate-fade-up-in"
      style={{
        padding: "var(--card-padding)",
        animationDelay: `${index * 50}ms`,
        animationDuration: "150ms",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
        <span className={cn("text-muted-foreground", alertState !== "neutral" && alertColorMap[alertState])}>
          {icon}
        </span>
      </div>
      <p
        className={cn(
          "text-2xl font-bold font-mono tabular-nums",
          alertColorMap[alertState]
        )}
      >
        {prefix}
        {displayValue}
        {suffix}
      </p>
      <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
        {description}
      </p>
    </div>
  );
}

// ── Event type status styling ──────────────────────────────────────────────
function getEventStyle(eventType: string): {
  dot: string;
  badge: string;
  label: string;
} {
  switch (eventType) {
    case "Access Granted":
      return {
        dot: "bg-success",
        badge: "text-success bg-success/10",
        label: "Granted",
      };
    case "Access Denied":
      return {
        dot: "bg-destructive",
        badge: "text-destructive bg-destructive/10",
        label: "Denied",
      };
    case "Door Forced Open":
      return {
        dot: "bg-destructive",
        badge: "text-destructive bg-destructive/10",
        label: "Forced Open",
      };
    case "Anti-Passback Violation":
      return {
        dot: "bg-warning",
        badge: "text-warning bg-warning/10",
        label: "APB Violation",
      };
    case "Controller Offline":
      return {
        dot: "bg-destructive",
        badge: "text-destructive bg-destructive/10",
        label: "Ctrl Offline",
      };
    case "Door Held Open":
      return {
        dot: "bg-warning",
        badge: "text-warning bg-warning/10",
        label: "Held Open",
      };
    default:
      return {
        dot: "bg-muted-foreground",
        badge: "text-muted-foreground bg-muted",
        label: eventType,
      };
  }
}

// ── Controller status styling ──────────────────────────────────────────────
function getControllerStatusStyle(status: string): {
  dot: string;
  label: string;
  labelClass: string;
} {
  switch (status) {
    case "Online":
      return { dot: "bg-success", label: "Online", labelClass: "text-success" };
    case "Offline":
      return {
        dot: "bg-destructive",
        label: "Offline",
        labelClass: "text-destructive",
      };
    case "Warning":
      return {
        dot: "bg-warning",
        label: "Warning",
        labelClass: "text-warning",
      };
    default:
      return {
        dot: "bg-muted-foreground",
        label: status,
        labelClass: "text-muted-foreground",
      };
  }
}

// ── Sync status styling ────────────────────────────────────────────────────
function getSyncStatusStyle(status: string): {
  badge: string;
  icon: React.ReactNode;
} {
  switch (status) {
    case "Success":
      return {
        badge: "text-success bg-success/10",
        icon: <CheckCircle2 className="h-3 w-3" />,
      };
    case "Failed":
      return {
        badge: "text-destructive bg-destructive/10",
        icon: <AlertCircle className="h-3 w-3" />,
      };
    case "Partial":
      return {
        badge: "text-warning bg-warning/10",
        icon: <AlertTriangle className="h-3 w-3" />,
      };
    case "In Progress":
      return {
        badge: "text-primary bg-primary/10",
        icon: <RefreshCcw className="h-3 w-3 animate-spin" />,
      };
    default:
      return {
        badge: "text-muted-foreground bg-muted",
        icon: <Clock className="h-3 w-3" />,
      };
  }
}

// ── Format relative timestamp ──────────────────────────────────────────────
function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date("2026-03-04T12:00:00Z");
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

// ── Provider label badge ───────────────────────────────────────────────────
function ProviderBadge({ provider }: { provider: string }) {
  const isCCURE = provider === "CCURE";
  return (
    <span
      className={cn(
        "font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide",
        isCCURE
          ? "text-primary bg-primary/10"
          : "text-chart-2 bg-chart-2/10"
      )}
      style={
        !isCCURE
          ? { color: "var(--chart-2)", backgroundColor: "color-mix(in oklch, var(--chart-2), transparent 85%)" }
          : undefined
      }
    >
      {isCCURE ? "C9K" : "LNL"}
    </span>
  );
}

// ── Main Dashboard Page ────────────────────────────────────────────────────
type EventFilter = "All" | "CCURE" | "Lenel" | "Alarms";
type ChartPeriod = "7d" | "14d" | "30d";

export default function SyncOperationsOverviewPage() {
  const [eventFilter, setEventFilter] = useState<EventFilter>("All");
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("30d");

  // Filter chart data by period
  const chartData = useMemo(() => {
    const counts = dailyEventCounts;
    if (chartPeriod === "7d") return counts.slice(-7);
    if (chartPeriod === "14d") return counts.slice(-14);
    return counts;
  }, [chartPeriod]);

  // Filter event feed
  const filteredEvents = useMemo<AccessEvent[]>(() => {
    if (eventFilter === "All") return accessEvents;
    if (eventFilter === "CCURE") return accessEvents.filter((e) => e.provider === "CCURE");
    if (eventFilter === "Lenel") return accessEvents.filter((e) => e.provider === "Lenel");
    if (eventFilter === "Alarms")
      return accessEvents.filter((e) =>
        ["Door Forced Open", "Anti-Passback Violation", "Controller Offline"].includes(
          e.eventType
        )
      );
    return accessEvents;
  }, [eventFilter]);

  const stats = dashboardStats;
  const recentSyncs: SyncOperation[] = syncOperations.slice(0, 5);
  const allControllers: Controller[] = controllers;

  return (
    <div className="page-container space-y-[var(--section-gap,1rem)]">

      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-xl font-semibold text-foreground"
            style={{ letterSpacing: "var(--heading-tracking)" }}
          >
            Sync Operations Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            CCURE 9000 + Lenel OnGuard integration — real-time cardholder and credential sync
          </p>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Integration active
        </div>
      </div>

      {/* ── KPI Stat Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-[var(--grid-gap,0.75rem)]">
        <StatCard
          index={0}
          title="Sync Success Rate"
          value={stats.syncSuccessRate}
          suffix="%"
          description={`+${stats.syncSuccessRateChange}% · 7-day rolling average across both providers`}
          icon={<ShieldCheck className="h-4 w-4" />}
          alertState="success"
          isFloat
          floatDecimals={1}
        />
        <StatCard
          index={1}
          title="Events Today"
          value={stats.eventsToday}
          description={`${stats.accessDeniedToday} access denials · ${stats.pendingSync} records pending sync`}
          icon={<Activity className="h-4 w-4" />}
          alertState="neutral"
        />
        <StatCard
          index={2}
          title="Total Cardholders"
          value={stats.totalCardholders}
          description={`+${stats.cardholdersChange}% · Synced across CCURE 9000 and OnGuard`}
          icon={<Users className="h-4 w-4" />}
          alertState="neutral"
        />
        <StatCard
          index={3}
          title="Active Credentials"
          value={stats.activeCredentials}
          description={`${stats.credentialsExpiringSoon} expiring within 30 days · HID-SEOS + MIFARE`}
          icon={<CreditCard className="h-4 w-4" />}
          alertState="neutral"
        />
        <StatCard
          index={4}
          title="Offline Controllers"
          value={stats.offlineControllers}
          description="iSTAR Ultra G2 — Site B · Network switch failure on VLAN 22"
          icon={<WifiOff className="h-4 w-4" />}
          alertState={stats.offlineControllers > 0 ? "danger" : "success"}
        />
      </div>

      {/* ── Access Events Chart + Provider Status — 2 column ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--grid-gap,0.75rem)]">

        {/* Chart — takes 2/3 */}
        <div
          className="aesthetic-card lg:col-span-2"
          style={{ padding: "var(--card-padding)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Access Events — Last {chartPeriod === "7d" ? "7" : chartPeriod === "14d" ? "14" : "30"} Days
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Granted, denied, and alarm events across all controllers
              </p>
            </div>
            <div className="flex gap-1">
              {(["7d", "14d", "30d"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-medium rounded border transition-colors",
                    chartPeriod === p
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/60 text-muted-foreground hover:bg-muted/50"
                  )}
                  style={{ transitionDuration: "var(--dur-fast)" }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <AccessEventsChart data={chartData} />
        </div>

        {/* Provider Status — takes 1/3 */}
        <div className="space-y-[var(--grid-gap,0.75rem)]">
          {/* CCURE 9000 */}
          <div
            className="aesthetic-card"
            style={{ padding: "var(--card-padding)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                CCURE 9000
              </p>
              <span className="flex items-center gap-1 text-[10px] font-medium text-success bg-success/10 px-1.5 py-0.5 rounded">
                <Wifi className="h-2.5 w-2.5" />
                Connected
              </span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-muted-foreground">
                <span>Last sync</span>
                <span className="font-mono text-foreground">38s ago</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Records streamed</span>
                <span className="font-mono text-foreground">247</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>API endpoint</span>
                <span className="font-mono text-[10px] text-foreground truncate max-w-[120px]">
                  Victor Web Services
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Clearances mapped</span>
                <span className="font-mono text-foreground">5 / 7</span>
              </div>
            </div>
          </div>

          {/* Lenel OnGuard */}
          <div
            className="aesthetic-card"
            style={{ padding: "var(--card-padding)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Lenel OnGuard
              </p>
              <span className="flex items-center gap-1 text-[10px] font-medium text-warning bg-warning/10 px-1.5 py-0.5 rounded">
                <AlertTriangle className="h-2.5 w-2.5" />
                3 Errors
              </span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-muted-foreground">
                <span>Last sync</span>
                <span className="font-mono text-foreground">2m ago</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Records streamed</span>
                <span className="font-mono text-foreground">4,612</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>API endpoint</span>
                <span className="font-mono text-[10px] text-foreground truncate max-w-[120px]">
                  OpenAccess REST v8
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Access levels mapped</span>
                <span className="font-mono text-foreground">5 / 7</span>
              </div>
            </div>
          </div>

          {/* Recent Sync Ops mini-feed */}
          <div
            className="aesthetic-card"
            style={{ padding: "var(--card-padding)" }}
          >
            <p className="text-xs font-semibold text-foreground mb-2">
              Recent Sync Operations
            </p>
            <div className="space-y-1.5">
              {recentSyncs.map((op) => {
                const { badge, icon } = getSyncStatusStyle(op.status);
                return (
                  <div key={op.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                        {op.provider === "Both" ? "BOTH" : op.provider === "CCURE" ? "C9K" : "LNL"}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {op.type}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded shrink-0",
                        badge
                      )}
                    >
                      {icon}
                      {op.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Real-Time Event Feed + Controller Status ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--grid-gap,0.75rem)]">

        {/* Event Feed — takes 2/3 */}
        <div
          className="aesthetic-card lg:col-span-2"
          style={{ padding: "var(--card-padding)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Real-Time Access Event Feed
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Live events across CCURE 9000 and Lenel OnGuard readers
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Filter className="h-3 w-3 text-muted-foreground" />
              {(["All", "CCURE", "Lenel", "Alarms"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setEventFilter(f)}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-medium rounded border transition-colors",
                    eventFilter === f
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/60 text-muted-foreground hover:bg-muted/50"
                  )}
                  style={{ transitionDuration: "var(--dur-fast)" }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Event rows */}
          <div className="divide-y divide-border/40">
            {filteredEvents.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No events match the selected filter.
              </p>
            ) : (
              filteredEvents.map((event) => {
                const { dot, badge, label } = getEventStyle(event.eventType);
                const isAlarm = [
                  "Door Forced Open",
                  "Anti-Passback Violation",
                  "Controller Offline",
                ].includes(event.eventType);
                return (
                  <div
                    key={event.id}
                    className={cn(
                      "flex items-start gap-2.5 py-2 aesthetic-hover",
                      isAlarm && !event.acknowledged && "bg-destructive/3"
                    )}
                  >
                    {/* Status dot */}
                    <div className="flex flex-col items-center pt-1 shrink-0">
                      <span className={cn("w-2 h-2 rounded-full shrink-0", dot)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                            badge
                          )}
                        >
                          {label}
                        </span>
                        <ProviderBadge provider={event.provider} />
                        {!event.acknowledged && (
                          <span className="text-[9px] font-medium text-warning bg-warning/10 px-1 py-0.5 rounded uppercase tracking-wide">
                            Unack
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground mt-0.5 truncate">
                        {event.cardholderName ?? "Unknown"}
                        {" · "}
                        <span className="text-muted-foreground">{event.doorName}</span>
                      </p>
                      {event.reason && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug line-clamp-1">
                          {event.reason}
                        </p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {formatRelativeTime(event.timestamp)}
                      </p>
                      <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                        {event.site === "HQ Campus" ? "HQ" : "Site B"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Controller Status — takes 1/3 */}
        <div
          className="aesthetic-card"
          style={{ padding: "var(--card-padding)" }}
        >
          <p className="text-sm font-semibold text-foreground mb-3">
            Controller Status
          </p>
          <div className="divide-y divide-border/40">
            {allControllers.map((ctrl) => {
              const { dot, label, labelClass } = getControllerStatusStyle(
                ctrl.status
              );
              return (
                <div key={ctrl.id} className="py-2 aesthetic-hover">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={cn("w-2 h-2 rounded-full shrink-0 mt-0.5", dot)} />
                      <span className="text-[11px] text-foreground font-medium truncate">
                        {ctrl.id}
                      </span>
                    </div>
                    <span className={cn("text-[10px] font-medium shrink-0", labelClass)}>
                      {label}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 ml-3.5 truncate">
                    {ctrl.name.split("—")[1]?.trim() ?? ctrl.location}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 ml-3.5">
                    <span className="text-[9px] font-mono text-muted-foreground/70">
                      {ctrl.provider === "CCURE" ? "C9K" : "LNL"} · {ctrl.doorsManaged} doors
                    </span>
                    {ctrl.alertMessage && (
                      <span className="text-[9px] text-warning flex items-center gap-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        Alert
                      </span>
                    )}
                  </div>
                  {ctrl.alertMessage && (
                    <p className="text-[9px] text-muted-foreground mt-0.5 ml-3.5 line-clamp-1 leading-snug">
                      {ctrl.alertMessage}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Conversion Banner ────────────────────────────────── */}
      <div className="mt-2">
        <DemoBanner />
      </div>
    </div>
  );
}
