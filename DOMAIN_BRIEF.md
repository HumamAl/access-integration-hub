# Domain Knowledge Brief — Physical Access Control Systems (PACS) Integration Middleware

## Sub-Domain Classification

Enterprise PACS integration middleware platform — a software layer that bridges third-party applications (HR platforms, visitor management, workforce apps) with legacy access control management systems (ACMS), specifically **CCURE 9000** (Software House / Johnson Controls) and **Lenel OnGuard** (LenelS2 / Carrier). Targets enterprise facilities with 500–70,000+ cardholders, operating in regulated and security-conscious environments (corporate campuses, data centers, hospitals, government contractors, manufacturing plants).

---

## Job Analyst Vocabulary — Confirmed and Extended

The client's focus is on developing the interface layer between a platform and PACS providers — data exchange, credential sync, and event handling. This is a B2B integration engineering job, not a security guard console.

### Confirmed Primary Entity Names

These are the exact terms that must appear in every UI label — sidebar nav, table headers, KPI card titles, status badges, and search placeholders.

- **Primary record type**: "Cardholder" (not "user", not "employee", not "person")
- **Credential**: The physical or digital token (card, fob, mobile) — never "badge" alone (badge = physical card + credential data together)
- **Access Level** (CCURE) / **Access Level** (Lenel) — the permission group that defines which doors a cardholder can enter. Called "Clearance" in CCURE context and "Access Level" in Lenel context; use "Access Level" as the universal term
- **Controller / ACU (Access Control Unit)**: The hardware panel governing a cluster of doors. Called "iSTAR" in CCURE ecosystem, "LNL-3300" family in Lenel
- **Reader**: The device at the door where cardholders present credentials (card reader, key pad, biometric)
- **Door**: The controlled entry point — the logical unit managed by the system (not "entry" or "gate")
- **Panel**: The field hardware connecting readers and doors to the controller
- **Alarm Point**: A monitored input (motion sensor, door contact) that generates events
- **Event**: Any system-logged activity — access granted, access denied, door forced, alarm triggered
- **Clearance** (CCURE-specific): The CCURE term for an access permission group — equivalent to Access Level in Lenel
- **Schedule / Time Schedule**: The time-window rule controlling when access is permitted
- **Partition**: A logical division of the system for multi-tenant or multi-facility deployments
- **Cardholder Group / Personnel Group**: A collection of cardholders sharing common properties
- **Visitor**: A temporary cardholder with limited, time-bound credentials

### Expanded KPI Vocabulary

| KPI Name | What It Measures | Typical Format |
|---|---|---|
| Total Cardholders | Active personnel enrolled in the system | count (e.g., 4,847) |
| Active Credentials | Credentials currently valid and assigned | count |
| Sync Success Rate | % of cardholder/credential sync operations completed without error | % (e.g., 99.2%) |
| Events Processed / Day | Volume of access events streamed from PACS to platform | count (e.g., 14,320) |
| Offline Controllers | Number of ACUs currently unreachable by the server | count — should be 0 |
| Failed Syncs (24h) | Number of sync operations that failed in the last 24 hours | count — alert if >0 |
| Doors Online | Count of controlled doors currently communicating with controllers | count |
| Average Sync Latency | Time from cardholder change in HR to reflection in PACS | seconds/minutes |
| Anti-Passback Violations | Cardholders who triggered APB rules in the current period | count |
| Credential Expiry in 30 Days | Credentials approaching expiration | count — watchlist |
| Last Full Sync | Timestamp of the most recent complete cardholder database sync | timestamp |
| Integration Uptime | % availability of the integration service connecting platform to PACS | % (e.g., 99.97%) |

### Status Label Vocabulary

**Active states:**
- "Active" — cardholder is enrolled and credentials are valid
- "Synced" — record successfully pushed to PACS provider
- "Online" — controller/panel is communicating normally
- "Enabled" — credential is active and permitted
- "Granted" — event: access was permitted

**Problem states:**
- "Sync Failed" — record failed to push to CCURE or Lenel
- "Offline" — controller or panel is unreachable
- "Anti-Passback Violation" — cardholder triggered APB
- "Door Held Open" — door remained open past configured time threshold
- "Door Forced Open" — door opened without valid credential
- "Tamper Detected" — reader reported physical tampering
- "Credential Conflict" — duplicate or mismatched badge format
- "Pending" — cardholder record created but not yet synced to PACS

**Terminal states:**
- "Revoked" — credential has been deactivated
- "Expired" — credential passed its expiration date
- "Deleted" — cardholder removed from system
- "Denied" — event: access was rejected

### Workflow and Action Vocabulary

**Primary actions:**
- "Sync" — push cardholder/credential changes to PACS provider
- "Provision" — create a new credential in the PACS system
- "Revoke" — immediately disable a credential (urgent termination)
- "Enroll" — add a new cardholder to the system
- "Assign" — link a cardholder to an access level or clearance
- "Grant" — allow access to a specific door or zone

**Secondary actions:**
- "Override" — manually force a door state (lock/unlock)
- "Acknowledge" — mark an alarm event as seen/handled
- "Replay" — re-attempt a failed sync operation
- "Export" — generate audit report of events or cardholder records
- "Purge" — remove inactive cardholder records after defined retention period
- "Validate" — test credential against PACS without granting access

### Sidebar Navigation Candidates

For a dashboard-app format covering this integration platform:

1. **Event Monitor** (real-time access event feed from CCURE/Lenel)
2. **Cardholders** (cardholder roster, credential status, sync state)
3. **Sync Status** (integration health, last sync timestamps, error log)
4. **Access Levels** (permission groups, door assignments, schedules)
5. **Door & Controller Map** (hardware status: readers, panels, controllers)
6. **Credentials** (badge types, formats, expiry tracking)
7. **Audit Log** (historical events, compliance exports)

---

## Design Context — Visual Language of This Industry

### What "Premium" Looks Like in This Domain

Physical access control dashboards are used by security operations professionals — people managing corporate or campus security, not end users swiping badges. Their mental model comes from tools like Genetec Security Center, Avigilon Unity Access, and Lenel OnGuard's own operator workstation. These tools share a consistent visual character: structured, status-heavy, and operationally dense. Color is functional — green means online, red means alert, amber means warning — and practitioners read status instantly from color alone.

The design language leans dark or near-dark for the event monitor and map views (operators often work in dimly lit security control rooms), but administration screens tend toward standard light/neutral backgrounds. Integration platforms layered on top of PACS — tools like SwiftConnect, Kisi, or custom middleware — tend to adopt a cleaner SaaS aesthetic while preserving the status-color conventions operators expect. The best ones feel like Datadog or PagerDuty applied to physical security: real-time event feeds, health dashboards, and alert states.

Data density is a must. A security admin managing 12,000 cardholders across 4 sites needs compact rows, not spacious cards. Tables are the primary UI pattern, not card grids. Status badges are expected on every row. Empty states are rare and meaningful (a table with zero sync errors is a good thing — celebrate it quietly).

### Real-World Apps Clients Would Recognize as "Premium"

1. **Genetec Security Center** — The gold standard for unified PACS + video. Clean, structured, tile-based map views. Uses dark operational panels for monitoring alongside light administrative screens. Color-coded alarm states (red/amber/green) are universal. Practitioners consider this "the enterprise choice" — seeing a demo that evokes Security Center's operational density signals domain expertise immediately.

2. **Avigilon Unity Access (formerly ACM)** — Browser-based HTML5 interface, cleaner than Lenel or CCURE's native clients. Compact table-heavy layout, strong status badges, filter-heavy cardholder management. Practitioners view it as "the modern alternative." A UI referencing Avigilon's patterns reads as current and professional.

3. **Kisi Dashboard** — The SaaS-native access control platform. Cleaner and more spacious than legacy PACS tools, strong use of real-time event feeds, visual door/lock status indicators, and activity timelines. Represents what modern PACS management looks like when built web-native — useful reference for an integration middleware demo.

### Aesthetic Validation

- **Job Analyst chose**: (awaiting — will reference Creative Brief once received)
- **Domain validation**: For a PACS integration platform demo, **Corporate Enterprise** or **Data-Dense** are the most authentic aesthetics. The audience is security operations/IT — they use Genetec, Lenel, and CCURE all day. A clean data-dense layout with status-color conventions feels native. Dark Premium works if the demo emphasizes the event monitoring/real-time feed angle. SaaS Modern works if the platform is positioned as the "modern layer" over legacy PACS.
- **One adjustment**: Avoid purely warm/light consumer aesthetics — they signal "we don't know your industry." Use neutral-to-cool colors with strong status semantic colors (green/amber/red). Navy or slate base tones are universally trusted in enterprise security.

### Format Validation

- **Job Analyst chose**: (awaiting Creative Brief)
- **Domain validation**: This is clearly a `dashboard-app` format job. The deliverable is a platform/integration tool — it has screens, cardholder tables, event logs, sync status panels. A `landing-page` or `mobile-app-preview` would be a format mismatch.
- **Format-specific notes for Demo Screen Builder**: The main dashboard should lead with integration health KPIs (sync success rate, events processed, offline controllers). The event feed is the "live" element — a streaming list of access events (granted/denied/alarms) is what operators actually watch. The cardholder table needs visible sync status per row.

### Density and Layout Expectations

**Density**: Compact-to-standard. PACS professionals use dense tools all day. Compact table rows, small status badges, sidebar navigation. A spacious card-based layout would read as inexperienced.

**Primary layout pattern**: List-heavy (tables and event feeds). Cardholders, events, credentials, and sync logs are all row-based tables. Map/floor-plan views are optional but appreciated for door status.

**Chart patterns**: Area/line charts for event volume over time (the most common analytics view in security ops — "events per hour"). Bar charts for event type distribution (granted vs. denied vs. alarm). Radial/gauge charts for sync success rate and uptime.

---

## Entity Names (10+ realistic names)

### Companies / Organizations (Integration Platform Clients)

Realistic enterprise organizations that would use PACS integration middleware:

- Meridian Biosciences Group (pharma campus, regulated access)
- Harbor Point Capital Advisors (financial services, strict badge control)
- TeleCross Data Centers (colocation/data center, tiered zone access)
- Northgate Manufacturing LLC (multi-site factory, shift-based access)
- Silverton Health System (hospital network, HIPAA-adjacent, visitor management)
- Apex Government Services Corp (government contractor, FICAM-compliant)
- Ridgeview Corporate Park (multi-tenant office, property management)
- ClearPath Logistics Inc. (distribution center, contractor badge access)
- NeoChem Industries (chemical plant, hazmat zones, strict access tiers)
- Bayshore University Medical Center (healthcare, patient area access control)

### People Names (Cardholders and Roles)

Demographically varied — enterprise workforce:

**Security Admins / Integration Engineers:**
- Marcus Okafor (Security Operations Manager)
- Priya Nair (IT Security Engineer)
- Derek Huttmann (Physical Security Analyst)
- Lena Vasquez (Facilities Access Coordinator)

**Cardholders (realistic enterprise personnel):**
- James Whitfield — Senior Engineer, Badge #10482
- Tanaka Hiroshi — Contractor, Badge #C-8831
- Sofia Reinholt — HR Manager, Badge #10093
- Antoine Beaumont — IT Director, Badge #10007
- Keisha Monroe — Security Guard, Badge #90012
- Pradeep Subramaniam — Data Center Technician, Badge #10559
- Maria Santos — Visitor (temp), Badge #V-0041
- Chad Bellamy — Terminated (revoked), Badge #9887

### Products / Credential Types

- HID iCLASS SE Credential (13.56 MHz smart card)
- HID Proximity Card 26-Bit H10301 (legacy 125kHz prox)
- HID Mobile Access (Bluetooth mobile credential)
- SEOS Card (HID Seos, multi-layered encryption)
- MIFARE Classic 1K (legacy facility, common in older deployments)
- HID iCLASS Seos + Duress PIN (dual-factor, executive access zones)
- Allegion Schlage Encode Plus (smart lock credential)
- CCURE iSTAR Ultra G2 Controller (ACU hardware)
- LNL-3300 Access Control Unit (Lenel panel, 2-reader module)
- Wiegand 34-bit Custom Format (legacy format, finance sector)

---

## Realistic Metric Ranges

| Metric | Low | Typical | High | Notes |
|--------|-----|---------|------|-------|
| Total Cardholders | 500 | 4,200 | 70,000 | CCURE supports 500K; typical mid-enterprise 2K-8K |
| Active Credentials | 450 | 3,800 | 65,000 | Usually 90-95% of cardholder count |
| Doors Controlled | 20 | 280 | 5,000 | CCURE supports 5K readers per server |
| Controllers (ACUs) Online | 2 | 18 | 200+ | Enterprise deployment: 200+ iSTAR controllers reported |
| Events per Day | 800 | 14,500 | 120,000 | High-volume: hospital or large campus |
| Sync Operations per Day | 5 | 85 | 400 | Depends on HR change frequency |
| Sync Latency (avg) | 4 sec | 45 sec | 8 min | Network/load dependent |
| Sync Success Rate | 92% | 99.2% | 100% | Below 98% warrants investigation |
| Failed Sync Events (24h) | 0 | 3 | 47 | Edge case: 47 indicates configuration error |
| Anti-Passback Violations/Day | 0 | 4 | 28 | Tailgating at busy entry points |
| Credential Expiry <30 Days | 0 | 12 | 150 | Contractors and visitors most common |
| Integration Uptime (30-day) | 96.4% | 99.7% | 100% | SLA typically 99.5%+ |

---

## Industry Terminology Glossary (15+ terms)

| Term | Definition | Usage Context |
|------|-----------|---------------|
| Cardholder | An enrolled person with credentials in the PACS | Primary record type in all PACS systems |
| Access Level | A permission group defining which doors/zones a cardholder can enter and when | Assigned to cardholders; maps to "Clearance" in CCURE |
| Clearance | CCURE 9000's term for an access permission group (equivalent to Access Level) | CCURE-specific; do NOT use "clearance" in Lenel context |
| iSTAR | Software House's brand name for their access control unit (ACU) | The CCURE hardware controller family (Edge, Ultra, Ultra G2) |
| ACU (Access Control Unit) | The field hardware controller that manages a cluster of readers and doors | Generic term; "controller" in everyday speech |
| DataConduIT | Lenel OnGuard's WMI-based integration platform for data exchange with external systems | Used for HR sync, credential management via WBEM queries |
| OpenAccess | Lenel's RESTful web service API for real-time integration with OnGuard | Preferred modern integration method for Lenel |
| Victor Web Services | CCURE 9000's web service layer used by integrations for data exchange | Required CCURE integration component (ports 80/9618) |
| APB (Anti-Passback) | A rule preventing cardholders from re-entering a zone without first exiting | Prevents badge-sharing; triggers APB Violation events |
| REX (Request to Exit) | A sensor/button on the exit side of a door allowing egress without credential | Generates REX events; important for two-way APB tracking |
| Wiegand | The legacy electrical protocol used to transmit card data from reader to controller | 26-bit H10301 is the most common; being superseded by OSDP |
| OSDP (Open Supervised Device Protocol) | The modern, encrypted, bidirectional protocol replacing Wiegand | Supports AES-128 encryption; now an ANSI standard |
| Facility Code | An 8-bit site identifier embedded in Wiegand card formats (0-255) | Part of the 26-bit H10301 format; critical for card programming |
| Badge Format | The data structure encoding on a credential (bit length, facility code position) | "Wrong badge format" is a common integration error |
| Event Journal | The log of all access events, alarms, and system messages | Core audit trail; compliance teams need 90-day+ retention |
| Partition | A logical system subdivision used for multi-tenant or multi-facility PACS deployments | CCURE and Lenel both use partitions for enterprise segmentation |
| PSIA PLAI | Physical Security Interoperability Alliance — Physical Logical Access Interoperability spec | Both Lenel and CCURE support this standard for cross-system integration |
| Tailgating / Piggybacking | Person entering a secured area by following behind an authorized cardholder without swiping | Security vulnerability; detected via video analytics + APB |
| Muster Report | An emergency evacuation report showing which cardholders are inside a facility | Critical for fire/emergency compliance |
| Dead Zone / Hold Unlock | A door configured to remain unlocked during certain hours or events | Common in lobbies; integration platform must respect scheduled states |

---

## Common Workflows

### Workflow 1: Cardholder Provisioning (New Employee Onboarding)

1. HR system creates new employee record (name, department, start date)
2. Integration platform receives HR webhook or polls for new records
3. Platform maps HR department to corresponding PACS access level/clearance
4. Platform creates cardholder record in CCURE 9000 via Victor Web Services API (or Lenel via OpenAccess API)
5. Platform assigns credential (badge number, card format, facility code) to cardholder record
6. Platform logs sync result (success/failure) with timestamp
7. Badge is encoded and issued to employee (physical step, outside platform scope)
8. Integration platform monitors for failed provisioning and surfaces to admin for manual retry
9. HR system updated with PACS cardholder ID for future sync reference

**Integration challenge**: Step 4 can fail if the CCURE/Lenel server is unreachable, if the access level name doesn't exist in PACS, or if the card number conflicts with an existing credential. The platform must handle partial failures gracefully.

### Workflow 2: Cardholder Termination (Offboarding / Credential Revocation)

1. HR system marks employee as terminated (or security admin initiates emergency revocation)
2. Integration platform receives termination event (must support near-real-time for security reasons)
3. Platform sends revocation command to CCURE (disable credential) and Lenel (if dual-system site)
4. Platform waits for acknowledgment from PACS server (synchronous or async with retry)
5. Cardholder status updated to "Revoked" in platform with timestamp
6. Event logged in audit trail
7. Platform generates alert if revocation fails (e.g., PACS server offline — escalation required)
8. Expired credentials purged after retention period (typically 90 days)

**Integration challenge**: If the PACS server is offline during an emergency termination, the platform must queue and re-attempt immediately upon reconnection, while alerting the security team to take manual action.

### Workflow 3: Real-Time Event Streaming and Alarm Monitoring

1. PACS generates access events continuously (granted, denied, door held, door forced, etc.)
2. Integration platform subscribes to CCURE event stream (via CrossFire/Victor Web Services) or Lenel event notifications (via DataConduIT WMI or OpenAccess webhooks)
3. Platform normalizes events from CCURE format and Lenel format into a unified schema
4. Platform routes events to downstream subscribers (SIEM, HR audit, visitor management, etc.)
5. Platform filters high-priority events (forced doors, anti-passback violations, offline controllers) and generates alerts
6. Alarms acknowledged by operators in the platform (or in native PACS client)
7. Events stored in audit log with 90–365 day retention for compliance

---

## Common Edge Cases

1. **Controller Goes Offline During Business Hours** — Cardholder attempts access; controller is unreachable from server. Door behavior depends on "fail-safe" vs. "fail-secure" configuration. Integration platform must surface offline controllers immediately in the dashboard.

2. **Anti-Passback Violation — Legitimate Use** — Employee follows colleague through a tailgate (common in busy lobbies). PACS logs APB violation; employee can't enter next door until exiting the zone. Integration platform may need to support APB forgive/reset operations.

3. **Duplicate Card Number Conflict** — Two cardholders in the system have the same card number (common during migrations from legacy systems). Credential conflict must be surfaced and resolved before either record can be synced.

4. **Access Level Name Mismatch** — HR system sends "Engineering-Level-2" but PACS system uses "ENG-L2-Access". Mapping table is missing or misconfigured; sync fails silently if not validated. Platform must normalize and validate access level names before pushing.

5. **Partial Sync During Server Maintenance** — CCURE server goes into maintenance mode mid-sync. 847 of 1,200 cardholder updates are applied; 353 are not. Platform must track partial sync state and resume cleanly without duplicating the completed records.

6. **Visitor Credential Expiration Not Propagated** — Visitor credential is set to expire at 5:00 PM; integration platform does not push the expiration event in time due to queue backlog. Visitor retains access past scheduled expiry. Time-sensitive expiration events must be prioritized.

7. **Badge Format Mismatch After Hardware Upgrade** — Legacy 26-bit Wiegand readers are replaced with OSDP readers. Card formats need to be reprogrammed; old credentials no longer work. Integration platform must flag credentials with incompatible format codes.

8. **Dual-Provider Site Desync** — Enterprise uses CCURE at Site A and Lenel at Site B. A cardholder record is updated in CCURE successfully but fails in Lenel. Person can enter Site A but not Site B. Platform must surface per-provider sync status per cardholder.

---

## What Would Impress a Domain Expert

1. **Knowing CCURE uses "Clearances" not "Access Levels"** — CCURE 9000 terminology uses "clearance" for permission groups; Lenel uses "access level." A demo that shows a sync mapping table with "CCURE Clearance → Lenel Access Level" immediately signals the developer did the homework.

2. **iSTAR controller naming conventions** — Real CCURE deployments reference iSTAR Edge, iSTAR Ultra, iSTAR Ultra G2 controllers. Using "iSTAR" as the controller name (not "panel" or "ACU") shows platform-specific knowledge.

3. **Victor Web Services on port 9618** — The CCURE integration requires the CrossFire Framework Service and Victor Web Service running on port 9618. Referencing these in technical details or a connection status check impresses engineers who have actually deployed CCURE.

4. **Lenel DataConduIT vs OpenAccess distinction** — Experienced Lenel integrators know that DataConduIT (WMI-based, legacy) and OpenAccess (REST, modern) are different integration paths with different capabilities. Showing both options in a provider configuration screen signals deep domain knowledge.

5. **Anti-Passback Forgive operation** — APB violations are one of the most common admin tasks in PACS operations. Showing a "Forgive APB" button on a cardholder record — which clears their anti-passback state — is an insider detail that only someone who has actually used these systems would include.

---

## Common Systems & Tools Used

1. **CCURE 9000 (Software House / Johnson Controls)** — The dominant enterprise PACS in the US; server-based, iSTAR controllers, Victor Web Services API
2. **Lenel OnGuard (LenelS2 / Carrier)** — Strong in government and financial sectors; Mercury Security hardware base; OpenAccess REST API + DataConduIT
3. **Genetec Security Center (Synergis)** — Unified video + access platform; open architecture; SQL Server backend; popular for new deployments
4. **Avigilon Unity Access (ACM)** — Browser-based, HTML5; acquired by Motorola Solutions; modern UI; competitive with Lenel
5. **HID Global DigitalPersona** — Biometric credential management platform; common in high-security zones
6. **Milestone XProtect** — VMS that integrates with CCURE and Lenel for video-triggered access events
7. **Mercury Security EP/LP Boards** — The OEM controller hardware inside many Lenel systems (LP1501, LP1502); hardware-layer knowledge
8. **OSDP v2 (ANSI SIA OSDP-2022)** — The current protocol standard replacing Wiegand; mandatory for many government deployments
9. **Workday / SAP SuccessFactors / ADP** — The HR systems that feed cardholder provisioning via the integration middleware
10. **Splunk / Microsoft Sentinel** — SIEM platforms that consume the normalized event stream from the integration layer

---

## Geographic / Cultural Considerations

- **US market primary**: CCURE and Lenel have their strongest footing in the US corporate and government sectors. US DOD and federal government sites often require **FICAM (Federal Identity, Credential, and Access Management)** compliance and **PIV/CAC card** support — if the client's platform touches government sites, PIV credential formats are a must.
- **Wiegand vs. OSDP**: US deployments still heavily use legacy Wiegand infrastructure; OSDP adoption is growing but many existing buildings are Wiegand. Integration platform must handle both.
- **Time zones**: Multi-site enterprise deployments span time zones; time schedules in PACS are controller-local. Sync operations must account for TZ normalization.
- **No specific non-US constraints identified** for this job, but the technology stack is globally deployed.

---

## Data Architect Notes

- **Primary entity**: `Cardholder` (not "user" or "employee") — fields: `id`, `firstName`, `lastName`, `badgeNumber`, `status` (Active/Pending/Revoked/Expired), `accessLevelId`, `department`, `credentialType`, `lastSync`, `syncProvider` (CCURE/Lenel/Both), `syncStatus`
- **Secondary entity**: `Credential` — fields: `id`, `cardholderId`, `badgeFormat` (HID-H10301/HID-SEOS/MIFARE/Mobile), `facilityCode`, `cardNumber`, `status` (Enabled/Disabled/Expired), `expiresAt`, `issueDate`
- **Access levels**: `AccessLevel` — fields: `id`, `name`, `description`, `provider` (CCURE/Lenel), `doors[]`, `scheduleId`
- **Events dataset**: `AccessEvent` — fields: `id`, `timestamp`, `cardholderId`, `doorId`, `eventType` (Access Granted/Access Denied/Door Forced/Door Held/Anti-Passback Violation/Controller Offline), `provider`, `acknowledged`
- **Hardware**: `Controller` — fields: `id`, `name` (iSTAR Ultra G2, LNL-3300), `provider`, `status` (Online/Offline/Warning), `doorsManaged`, `lastHeartbeat`, `location`
- **Sync log**: `SyncOperation` — fields: `id`, `timestamp`, `type` (Full/Delta/Cardholder/Credential), `provider`, `status` (Success/Failed/Partial), `recordsProcessed`, `recordsFailed`, `errorMessage`

**Metric ranges for mock data calibration**:
- Revenue/cost not applicable; use event counts and cardholder counts
- Total cardholders: 4,200–4,847 (realistic mid-enterprise)
- Events today: 13,800–16,400 (active corporate campus)
- Sync success rate: 98.4–99.7% (show slight variance from 100%)
- Offline controllers: 0–2 (show 1 offline for edge case realism)
- Credentials expiring in 30 days: 8–23

**Status labels to use verbatim**: "Active", "Pending Sync", "Sync Failed", "Revoked", "Expired", "Online", "Offline", "Access Granted", "Access Denied", "Door Forced Open", "Door Held Open", "Anti-Passback Violation", "Controller Offline", "Sync Partial"

**Edge case records to include**:
- 1 cardholder with "Sync Failed" status (access level name mismatch)
- 1 controller "Offline" in hardware table
- 2–3 credentials with "Expired" status
- 1 anti-passback violation event in the event feed
- 1 "Door Forced Open" alarm event
- 1 cardholder with dual-provider mismatch (synced to CCURE, failed on Lenel)

**Date patterns**:
- Last 30 days for event timeline chart (daily event counts)
- Last 7 days for sync operations log
- Credential issue dates: 90–730 days ago
- Expiry dates: scattered across next 6 months (some already expired)

---

## Layout Builder Notes

- **Recommended density**: Compact-to-standard. Tables should use compact row height (similar to Datadog or GitHub's issue tables). Status badges must be visible without vertical stretching.
- **Domain-specific visual patterns**: Color-coded status badges are mandatory — practitioners read status by color instantly:
  - Green = Active/Online/Synced
  - Red = Failed/Offline/Door Forced/Revoked
  - Amber/Yellow = Warning/Expiring/Pending/Partial
  - Blue/Slate = Informational events (Access Granted)
- **Sidebar width**: Standard (16rem) is appropriate. Navigation labels are concise ("Event Monitor", "Cardholders", "Sync Status") — no need to go wider.
- **Color direction**: Cool tones — navy, slate, or steel blue as the primary. Avoid warm tones. Enterprise security operators associate warm/orange tones with alert states; using them in the primary palette creates visual confusion.
- **Event feed**: Real-time event list is the "live" element that makes the demo feel operational. Should have subtle motion — new events appearing at the top with a fade-in.
- **No consumer-style gradients or card illustrations** — this is a professional ops tool, not a marketing page.

---

## Demo Screen Builder Notes

- **Single most important metric (hero KPI)**: **Sync Success Rate** (e.g., 99.2%) — this is what the integration platform *is*. It's the metric that answers "is the system working?" Displayed as a large percentage stat card with a trend indicator.
- **Second most important metric**: **Events Processed Today** (e.g., 14,320) — shows the system is processing live data.
- **Chart recommendation**: Area chart for "Access Events — Last 30 Days" (daily event volume, colored by event type). This is the universal visualization in security ops — every PACS dashboard has it. Y-axis should show realistic event counts (500–2,000/day range).
- **Primary table**: Cardholder table with columns: Name, Badge #, Access Level, Credential Type, Last Sync, Sync Status (badge-colored). Should be sortable and have a search input.
- **Insider panel that impresses practitioners**: A **Real-Time Event Feed** panel showing the last 15–20 access events with timestamp, cardholder name, door name, event type, and a color-coded status dot. This is what a security ops professional actually watches — it signals "this developer has seen a PACS control room."
- **Secondary insight panel**: **Controller Status** — a compact table or grid showing all controllers (iSTAR/LNL units) with their Online/Offline status, doors managed, and last heartbeat. Showing 1 offline controller creates realistic tension.
- **Format**: `dashboard-app` — sidebar nav + main content area. No frame needed.
