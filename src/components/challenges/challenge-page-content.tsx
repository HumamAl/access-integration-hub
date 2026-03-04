"use client";

import type { ReactNode } from "react";
import { ChallengeList } from "./challenge-list";
import { VizArchitecture } from "./viz-architecture";
import { VizSyncFlow } from "./viz-sync-flow";
import { VizTroubleshooting } from "./viz-troubleshooting";

interface Challenge {
  id: string;
  title: string;
  description: string;
  outcome?: string;
}

interface ChallengePageContentProps {
  challenges: Challenge[];
}

export function ChallengePageContent({ challenges }: ChallengePageContentProps) {
  const visualizations: Record<string, ReactNode> = {
    "challenge-1": <VizArchitecture />,
    "challenge-2": <VizSyncFlow />,
    "challenge-3": <VizTroubleshooting />,
  };

  return <ChallengeList challenges={challenges} visualizations={visualizations} />;
}
