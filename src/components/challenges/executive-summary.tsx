// NO "use client" — pure JSX, no hooks

interface ExecutiveSummaryProps {
  commonApproach: string;
  differentApproach: string;
  accentWord?: string;
}

export function ExecutiveSummary({
  commonApproach,
  differentApproach,
  accentWord,
}: ExecutiveSummaryProps) {
  const renderDifferentApproach = () => {
    if (!accentWord) return <span>{differentApproach}</span>;
    const escaped = accentWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = differentApproach.split(new RegExp(`(${escaped})`, "i"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === accentWord.toLowerCase() ? (
            <span key={i} className="text-primary font-semibold">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div
      className="relative overflow-hidden rounded-sm p-5 md:p-6"
      style={{
        background: "oklch(0.10 0.02 255)",
        backgroundImage:
          "radial-gradient(ellipse at 20% 50%, oklch(0.28 0.06 255 / 0.15), transparent 65%)",
        borderLeft: "3px solid oklch(0.28 0.06 255)",
      }}
    >
      <p className="text-sm leading-relaxed text-white/50">{commonApproach}</p>
      <hr className="my-4 border-white/10" />
      <p className="text-sm md:text-base leading-relaxed font-medium text-white/90">
        {renderDifferentApproach()}
      </p>
      <p className="text-xs text-white/40 mt-4">
        <a
          href="/"
          className="hover:text-white/60 transition-colors underline underline-offset-2"
          style={{ transitionDuration: "100ms" }}
        >
          Back to the live demo
        </a>
      </p>
    </div>
  );
}
