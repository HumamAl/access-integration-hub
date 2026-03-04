import type { Challenge } from "@/lib/types";

export interface ExecutiveSummaryData {
  commonApproach: string;
  differentApproach: string;
  accentWord?: string;
}

export const executiveSummary: ExecutiveSummaryData = {
  commonApproach:
    "Most integration developers treat CCURE 9000 and Lenel OnGuard as two separate projects — writing one-off scripts for each, hardcoding vendor API quirks, and leaving error recovery as an afterthought. The result: brittle point-to-point connections that break with every firmware update.",
  differentApproach:
    "I build a common adapter layer that abstracts Victor Web Services and OpenAccess REST behind a single normalized interface — so cardholder sync, credential management, and access level mapping work the same way regardless of which provider is on the other end. Failures are queued, retried, and surfaced with event-level detail rather than buried in log files.",
  accentWord: "common adapter layer",
};

export const challenges: Challenge[] = [
  {
    id: "challenge-1",
    title: "Bridging Proprietary CCURE and Lenel APIs into a Unified Interface",
    description:
      "CCURE 9000 exposes a SOAP-based Victor Web Services API on port 9618, while Lenel OnGuard uses a REST-based OpenAccess API supplemented by DataConduIT for legacy access. These protocols have incompatible authentication flows, different cardholder schemas, and divergent event models — making a shared integration interface non-trivial.",
    visualizationType: "architecture",
    outcome:
      "Could reduce integration time per new access control provider from 3-4 weeks to 3-5 days by abstracting both vendors behind a common adapter layer with a normalized cardholder schema.",
  },
  {
    id: "challenge-2",
    title: "Reliable Bi-Directional Data Exchange with Error Recovery",
    description:
      "Syncing cardholders, credentials, and access levels between the platform and both PACS providers must be resilient. Network interruptions, API timeouts, and partial-write failures can leave the platform and the PACS provider in inconsistent states — with no indication that a sync event was dropped.",
    visualizationType: "flow",
    outcome:
      "Could reduce undetected sync failures from a silent failure mode to a tracked, retry-able queue — with automatic alert generation when retry attempts exceed the configured threshold.",
  },
  {
    id: "challenge-3",
    title: "Testing and Troubleshooting Integration Issues Across Systems",
    description:
      "When a sync fails or a cardholder event doesn't propagate, diagnosing the root cause currently means SSH-ing into each PACS server and manually tailing log files. There is no unified view of which records failed, why they failed, or which system owns the failure.",
    visualizationType: "before-after",
    outcome:
      "Could cut average troubleshooting time from 45+ minutes of log file inspection down to under 5 minutes by surfacing event-level error detail, auto-categorized by provider and failure type, with one-click retry.",
  },
];
