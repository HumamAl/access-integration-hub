import { ExecutiveSummary } from "@/components/challenges/executive-summary";
import { ChallengePageContent } from "@/components/challenges/challenge-page-content";
import { CtaCloser } from "@/components/challenges/cta-closer";
import { challenges, executiveSummary } from "@/data/challenges";

export const metadata = { title: "My Approach | Access Integration Hub" };

export default function ChallengesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 md:px-6 space-y-6">
        {/* Page heading */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">My Engineering Approach</h1>
          <p className="text-xs text-muted-foreground mt-1">
            How I would tackle the core integration challenges for CCURE 9000 and Lenel OnGuard
          </p>
        </div>

        {/* Executive summary — dark banner */}
        <ExecutiveSummary
          commonApproach={executiveSummary.commonApproach}
          differentApproach={executiveSummary.differentApproach}
          accentWord={executiveSummary.accentWord}
        />

        {/* Challenge cards with visualizations */}
        <ChallengePageContent challenges={challenges} />

        {/* CTA closer */}
        <CtaCloser />
      </div>
    </div>
  );
}
