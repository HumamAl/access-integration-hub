import type { LucideIcon } from "lucide-react";

// ─── Sidebar navigation ──────────────────────────────────────────────────────
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// ─── Challenge visualization types ───────────────────────────────────────────
export type VisualizationType =
  | "flow"
  | "before-after"
  | "metrics"
  | "architecture"
  | "risk-matrix"
  | "timeline"
  | "dual-kpi"
  | "tech-stack"
  | "decision-flow";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  visualizationType: VisualizationType;
  outcome?: string;
}

// ─── Proposal types ───────────────────────────────────────────────────────────
export interface Profile {
  name: string;
  tagline: string;
  bio: string;
  approach: { title: string; description: string }[];
  skillCategories: { name: string; skills: string[] }[];
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  tech: string[];
  relevance?: string;
  outcome?: string;
  liveUrl?: string;
}

// ─── Screen definition for frame-based demo formats ─────────────────────────
export interface DemoScreen {
  id: string;
  label: string;
  icon?: LucideIcon;
  href: string;
}

// ─── Conversion element variant types ────────────────────────────────────────
export type ConversionVariant = "sidebar" | "inline" | "floating" | "banner";

// ─── Physical Access Control: Domain Types ────────────────────────────────────

/**
 * CCURE 9000 uses "Clearance"; Lenel OnGuard uses "Access Level".
 * Both map to this entity. The provider field distinguishes them.
 */
export type AccessProvider = "CCURE" | "Lenel" | "Both";

export type CardholderStatus =
  | "Active"
  | "Pending"
  | "Revoked"
  | "Expired"
  | "Suspended";

export type SyncStatus =
  | "Synced"
  | "Sync Failed"
  | "Pending Sync"
  | "Partial Sync"
  | "Not Enrolled";

export type CredentialFormat =
  | "HID-H10301"
  | "HID-SEOS"
  | "MIFARE Classic"
  | "MIFARE DESFire"
  | "Mobile (BLE)"
  | "Wiegand 26-bit"
  | "OSDP";

export type CredentialStatus = "Enabled" | "Disabled" | "Expired" | "Lost" | "Revoked";

export type ControllerModel =
  | "iSTAR Ultra G2"
  | "iSTAR Edge G2"
  | "iSTAR Door Controller"
  | "LNL-3300"
  | "LNL-1300"
  | "LNL-500";

export type ControllerStatus = "Online" | "Offline" | "Warning" | "Degraded";

export type AccessEventType =
  | "Access Granted"
  | "Access Denied"
  | "Door Forced Open"
  | "Door Held Open"
  | "Anti-Passback Violation"
  | "Controller Offline"
  | "Credential Expired"
  | "Duress Code Used"
  | "Lockdown Activated";

export type SyncOperationType = "Full Sync" | "Delta Sync" | "Cardholder Sync" | "Credential Sync" | "Access Level Sync";

export type SyncOperationStatus = "Success" | "Failed" | "Partial" | "In Progress" | "Queued";

// ─── Cardholder ────────────────────────────────────────────────────────────────
export interface Cardholder {
  id: string;                      // "CHR-04821"
  firstName: string;
  lastName: string;
  badgeNumber: string;             // Physical badge number, e.g. "B-10472"
  department: string;
  title: string;
  status: CardholderStatus;
  accessLevelId: string;           // references AccessLevel.id
  /** CCURE credential type or Lenel access level group */
  credentialType: CredentialFormat;
  syncProvider: AccessProvider;
  syncStatus: SyncStatus;
  lastSync: string;                // ISO datetime
  /** The controller site this cardholder primarily accesses */
  primarySite: string;
  email: string;
  phone: string;
  activatedAt: string;
  expiresAt: string | null;        // null = no expiry
  /** Present when syncStatus === "Sync Failed" */
  syncErrorMessage?: string;
}

// ─── Credential ────────────────────────────────────────────────────────────────
export interface Credential {
  id: string;                      // "CRD-08841"
  cardholderId: string;            // references Cardholder.id
  badgeFormat: CredentialFormat;
  /** HID facility code (legacy Wiegand); null for mobile/OSDP */
  facilityCode: number | null;
  cardNumber: number;
  bitFormat: "26-bit" | "34-bit" | "37-bit" | "48-bit";
  status: CredentialStatus;
  issueDate: string;
  expiresAt: string | null;
  /** Provider system where this credential is enrolled */
  enrolledIn: AccessProvider;
  /** Whether the credential passed the last OSDP/Wiegand read test */
  lastReadTest: string | null;
  note?: string;
}

// ─── Access Level (CCURE: "Clearance"; Lenel: "Access Level") ─────────────────
export interface AccessLevel {
  id: string;                      // "ACL-0291"
  /** Display name — CCURE calls these "Clearances", Lenel calls them "Access Levels" */
  name: string;
  description: string;
  provider: AccessProvider;
  /** Door IDs assigned to this level — references Controller door assignments */
  doorIds: string[];
  scheduleId: string;              // references schedule name, e.g. "24/7", "Business Hours"
  cardholderCount: number;
  /** Whether this level has been mapped/verified across both providers */
  crossProviderMapped: boolean;
}

// ─── Access Event ──────────────────────────────────────────────────────────────
export interface AccessEvent {
  id: string;                      // "EVT-294817"
  timestamp: string;               // ISO datetime
  cardholderId: string | null;     // null for anonymous/tailgating events
  cardholderName?: string;         // denormalized for display
  doorId: string;
  doorName: string;
  controllerId: string;            // references Controller.id
  eventType: AccessEventType;
  provider: AccessProvider;
  /** Whether a security operator has reviewed/acknowledged this event */
  acknowledged: boolean;
  /** Present for denied/alarm events */
  reason?: string;
  /** Site location label */
  site: string;
}

// ─── Controller (iSTAR for CCURE; LNL-3300 etc. for Lenel) ───────────────────
export interface Controller {
  id: string;                      // "CTL-0047"
  name: string;
  model: ControllerModel;
  provider: AccessProvider;
  status: ControllerStatus;
  /** Number of door readers managed by this controller */
  doorsManaged: number;
  lastHeartbeat: string;           // ISO datetime
  /** Firmware version */
  firmwareVersion: string;
  ipAddress: string;
  location: string;
  site: string;
  /** Protocol used for reader communication */
  readerProtocol: "Wiegand" | "OSDP" | "Wiegand+OSDP";
  /** Present when status === "Warning" or "Offline" */
  alertMessage?: string;
}

// ─── Sync Operation ────────────────────────────────────────────────────────────
export interface SyncOperation {
  id: string;                      // "SYN-18841"
  timestamp: string;               // ISO datetime when sync was triggered
  completedAt: string | null;      // null if In Progress or Queued
  type: SyncOperationType;
  provider: AccessProvider;
  status: SyncOperationStatus;
  recordsProcessed: number;
  recordsFailed: number;
  durationSeconds: number | null;
  /** API endpoint used — Victor Web Services (CCURE) or OpenAccess REST / DataConduIT (Lenel) */
  apiEndpoint: string;
  triggeredBy: "Scheduled" | "Manual" | "Webhook";
  /** Present when status === "Failed" or "Partial" */
  errorMessage?: string;
}

// ─── Dashboard Stats ───────────────────────────────────────────────────────────
export interface DashboardStats {
  totalCardholders: number;
  cardholdersChange: number;         // % change vs prior period
  activeCredentials: number;
  credentialsChange: number;
  syncSuccessRate: number;           // percentage 0-100
  syncSuccessRateChange: number;
  offlineControllers: number;
  offlineControllersChange: number;
  credentialsExpiringSoon: number;   // within 30 days
  pendingSync: number;
  eventsToday: number;
  accessDeniedToday: number;
}

// ─── Chart data types ──────────────────────────────────────────────────────────
export interface DailyEventCount {
  date: string;           // "Feb 3"
  granted: number;
  denied: number;
  alarms: number;
}

export interface MonthlySyncSummary {
  month: string;          // "Mar 2025"
  ccure: number;
  lenel: number;
  failed: number;
}

export interface AccessEventBreakdown {
  eventType: string;
  count: number;
  fill: string;
}

export interface SiteActivityBreakdown {
  site: string;
  events: number;
  cardholders: number;
}
