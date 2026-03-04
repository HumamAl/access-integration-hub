import type { Profile, PortfolioProject } from "@/lib/types";

export const profile: Profile = {
  name: "Humam",
  tagline:
    "I build adapter-layer integrations for physical access control systems — connecting CCURE 9000 and Lenel OnGuard to unified management platforms.",
  bio: "Full-stack developer with experience building API monitoring tools, webhook pipelines, and structured data exchange systems. I study the vendor API docs before writing a line of code, so the adapter gets the edge cases right from the start.",
  approach: [
    {
      title: "API Audit",
      description:
        "Read the Victor Web Services (CCURE) and OpenAccess REST / DataConduIT (Lenel) documentation end to end. Map the object models, identify delta-sync endpoints, and surface the credential format gotchas before writing any code.",
    },
    {
      title: "Adapter Development",
      description:
        "Build typed adapters for each provider in isolation — cardholder sync, credential enrollment, access level mapping. Each adapter gets its own error handling and retry logic. No shared mutable state between CCURE and Lenel paths.",
    },
    {
      title: "Integration Testing",
      description:
        "Test against a staging environment with realistic cardholder payloads — including edge cases like Wiegand 26-bit vs OSDP credential formats, expired access levels, and partial-sync failure recovery.",
    },
    {
      title: "Handoff",
      description:
        "Production-ready TypeScript, documented sync endpoints, and a runbook for the ops team. Code you can extend when a third provider needs to be added without rewriting the core adapter logic.",
    },
  ],
  skillCategories: [
    {
      name: "API Integration",
      skills: [
        "REST API Design",
        "Webhook Architecture",
        "OAuth / API Key Auth",
        "Delta Sync Patterns",
        "Error Handling & Retries",
      ],
    },
    {
      name: "Backend",
      skills: [
        "Node.js",
        "TypeScript",
        "Data Mapping",
        "Schema Normalization",
        "Structured Logging",
      ],
    },
    {
      name: "Frontend / Dashboard",
      skills: [
        "Next.js",
        "React",
        "Tailwind CSS",
        "shadcn/ui",
        "Real-time Status UI",
      ],
    },
    {
      name: "Tooling",
      skills: [
        "n8n Pipelines",
        "Vercel",
        "GitHub Actions",
        "ESLint / TypeScript Strict",
      ],
    },
  ],
};

export const portfolioProjects: PortfolioProject[] = [
  {
    id: "ebay-pokemon-monitor",
    title: "eBay Pokemon Monitor",
    description:
      "eBay Browse API monitoring tool that polls for new listings, detects price changes, and fires Discord webhook alerts in real time. Built to handle rate limiting and deduplication across polling cycles.",
    tech: ["Next.js", "TypeScript", "Tailwind", "shadcn/ui"],
    outcome: "Real-time listing monitor with webhook-based Discord alerts and price trend tracking",
    liveUrl: "https://ebay-pokemon-monitor.vercel.app",
    relevance:
      "Closest match to CCURE/Lenel adapter work: REST API polling, webhook delivery, third-party integration, and handling provider-specific response schemas.",
  },
  {
    id: "wmf-agent",
    title: "WMF Agent Dashboard",
    description:
      "AI-powered workflow tool for Windsor Metal Finishing. Automated email classification via Claude API, RFQ data extraction with confidence scoring, and human-in-the-loop approval — all orchestrated through an n8n pipeline with Microsoft Graph for email delivery.",
    tech: ["Next.js", "TypeScript", "Claude API", "n8n", "Microsoft Graph"],
    outcome: "Replaced a 4-hour manual quote review process with a 20-minute structured extraction and approval flow",
    liveUrl: "https://wmf-agent-dashboard.vercel.app",
    relevance:
      "Demonstrates structured data exchange between external APIs, pipeline orchestration with n8n, and handling multi-step workflows with partial failure recovery — the same concerns that come up in PACS sync engines.",
  },
  {
    id: "auction-violations",
    title: "Auction Violations Monitor",
    description:
      "Compliance monitoring tool tracking seller violations, flagging behavior patterns, and recording enforcement actions. Event-driven architecture with a filterable audit log and status-based alert management.",
    tech: ["Next.js", "TypeScript", "Tailwind", "shadcn/ui"],
    outcome: "Compliance dashboard with violation detection, seller flagging, and enforcement action tracking",
    liveUrl: "https://auction-violations.vercel.app",
    relevance:
      "Event monitoring, acknowledgment workflows, and compliance tracking — the same audit log and alert patterns used in access event management.",
  },
  {
    id: "payguard",
    title: "PayGuard — Transaction Monitor",
    description:
      "Transaction monitoring dashboard with real-time flagging, linked account tracking, alert management, and prohibited merchant detection. Multi-source data aggregation with a structured alert delivery system.",
    tech: ["Next.js", "TypeScript", "Tailwind", "shadcn/ui", "Recharts"],
    outcome: "Compliance monitoring dashboard with transaction flagging, multi-account linking, and alert delivery tracking",
    liveUrl: "https://payment-monitor.vercel.app",
    relevance:
      "Multi-source data integration, alert lifecycle management, and status-based filtering — directly applicable to cross-provider access event dashboards.",
  },
];
