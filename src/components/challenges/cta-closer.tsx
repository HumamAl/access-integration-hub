"use client";

export function CtaCloser() {
  return (
    <section
      className="px-5 py-4 rounded-sm border border-primary/20"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklch, var(--primary) 4%, transparent), transparent)",
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Ready to discuss the integration approach?
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
            I have experience with CCURE and Lenel API quirks. Happy to walk through the adapter design or any part of this on a call.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/proposal"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
            style={{ transitionDuration: "100ms" }}
          >
            See the proposal
          </a>
          <span
            className="text-xs font-medium px-3 py-1.5 rounded-sm border border-primary/25 text-primary"
            style={{
              background: "color-mix(in oklch, var(--primary) 6%, transparent)",
            }}
          >
            Reply on Upwork to start
          </span>
        </div>
      </div>
    </section>
  );
}
