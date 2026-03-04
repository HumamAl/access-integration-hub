"use client";

// Architecture diagram: CCURE + Lenel -> Adapter Layer -> Platform
// Interactive: hover over each component to reveal its protocol details

import { useState } from "react";
import { Server, Layers, Database, ArrowRight, Info } from "lucide-react";

interface ArchNode {
  id: string;
  label: string;
  sublabel: string;
  detail: string;
  type: "provider" | "adapter" | "platform";
}

const nodes: ArchNode[] = [
  {
    id: "ccure",
    label: "CCURE 9000",
    sublabel: "Victor Web Services",
    detail: "SOAP API on port 9618 — authentication via session token, iSTAR controller events, CCURE Clearances",
    type: "provider",
  },
  {
    id: "lenel",
    label: "Lenel OnGuard",
    sublabel: "OpenAccess REST + DataConduIT",
    detail: "REST API with OAuth2, DataConduIT for legacy access, LNL-3300 controllers, Access Levels schema",
    type: "provider",
  },
  {
    id: "adapter",
    label: "Adapter Layer",
    sublabel: "Normalized interface",
    detail: "Translates CCURE Clearances and Lenel Access Levels into a unified cardholder schema. One sync queue, one retry logic path, provider-agnostic event model",
    type: "adapter",
  },
  {
    id: "platform",
    label: "Integration Platform",
    sublabel: "Unified cardholder management",
    detail: "Single API surface for cardholder provisioning, credential sync, and access level mapping — regardless of which PACS provider is connected",
    type: "platform",
  },
];

const typeStyles: Record<string, string> = {
  provider:
    "border-primary/30 bg-primary/5",
  adapter:
    "border-accent/40 bg-accent/10",
  platform:
    "border-border/80 bg-muted/40",
};

export function VizArchitecture() {
  const [hovered, setHovered] = useState<string | null>(null);

  const hoveredNode = nodes.find((n) => n.id === hovered);

  return (
    <div className="space-y-3">
      {/* Diagram */}
      <div className="flex flex-col gap-2">
        {/* Providers row */}
        <div className="grid grid-cols-2 gap-2">
          {nodes.slice(0, 2).map((node) => (
            <button
              key={node.id}
              type="button"
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(node.id)}
              onBlur={() => setHovered(null)}
              className={`text-left border rounded-sm px-3 py-2.5 transition-all cursor-default ${typeStyles[node.type]} ${hovered === node.id ? "ring-1 ring-primary/30" : ""}`}
              style={{ transitionDuration: "100ms" }}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Server className="h-3 w-3 text-primary/60 shrink-0" />
                <span className="text-xs font-semibold text-foreground">{node.label}</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground leading-tight block">{node.sublabel}</span>
            </button>
          ))}
        </div>

        {/* Arrow down */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-0.5">
            <div className="h-4 w-px bg-primary/30" />
            <ArrowRight className="h-3 w-3 text-primary/40 rotate-90" />
          </div>
        </div>

        {/* Adapter */}
        <button
          type="button"
          onMouseEnter={() => setHovered("adapter")}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered("adapter")}
          onBlur={() => setHovered(null)}
          className={`text-left border rounded-sm px-3 py-2.5 transition-all cursor-default ${typeStyles["adapter"]} ${hovered === "adapter" ? "ring-1 ring-accent/40" : ""}`}
          style={{ transitionDuration: "100ms" }}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <Layers className="h-3 w-3 text-accent shrink-0" />
            <span className="text-xs font-semibold text-foreground">Adapter Layer</span>
            <span className="ml-auto text-[10px] font-mono text-accent/80 uppercase tracking-wide">Proposed</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground leading-tight block">Normalized cardholder + credential interface</span>
        </button>

        {/* Arrow down */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-0.5">
            <div className="h-4 w-px bg-border/60" />
            <ArrowRight className="h-3 w-3 text-muted-foreground/50 rotate-90" />
          </div>
        </div>

        {/* Platform */}
        <button
          type="button"
          onMouseEnter={() => setHovered("platform")}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered("platform")}
          onBlur={() => setHovered(null)}
          className={`text-left border rounded-sm px-3 py-2.5 transition-all cursor-default ${typeStyles["platform"]} ${hovered === "platform" ? "ring-1 ring-border" : ""}`}
          style={{ transitionDuration: "100ms" }}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <Database className="h-3 w-3 text-foreground/50 shrink-0" />
            <span className="text-xs font-semibold text-foreground">Integration Platform</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground leading-tight block">Unified cardholder management API</span>
        </button>
      </div>

      {/* Detail panel — shows on hover */}
      <div
        className="rounded-sm px-3 py-2 border border-border/40 bg-muted/30 min-h-[48px] transition-all"
        style={{ transitionDuration: "100ms" }}
      >
        {hoveredNode ? (
          <div className="flex items-start gap-2">
            <Info className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">{hoveredNode.detail}</p>
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground/50 italic">Hover any component to see protocol details</p>
        )}
      </div>
    </div>
  );
}
