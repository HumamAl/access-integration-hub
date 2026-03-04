import { profile, portfolioProjects } from "@/data/proposal";
import { ProjectCard } from "@/components/proposal/project-card";
import { SkillsGrid } from "@/components/proposal/skills-grid";

export default function ProposalPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">

        {/* ── Section 1: Hero — dark panel ── */}
        <section
          className="relative overflow-hidden"
          style={{
            background: "var(--section-dark)",
            borderRadius: "var(--radius)",
          }}
        >
          {/* Subtle radial highlight — navy hue tint at top */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at top, oklch(0.30 0.06 255 / 0.18), transparent 65%)",
            }}
          />

          <div className="relative z-10 p-8 md:p-10 space-y-5">
            {/* "Built this demo for your project" badge — mandatory */}
            <span
              className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase border px-3 py-1"
              style={{
                background: "oklch(1 0 0 / 0.06)",
                borderColor: "oklch(1 0 0 / 0.12)",
                color: "oklch(0.85 0 0)",
                borderRadius: "var(--radius)",
              }}
            >
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              Built this demo for your project
            </span>

            {/* Role prefix */}
            <p
              className="font-mono text-xs tracking-widest uppercase"
              style={{ color: "oklch(0.60 0 0)" }}
            >
              Integration Specialist · Full-Stack Developer
            </p>

            {/* Weight-contrast headline */}
            <h1 className="text-4xl md:text-5xl tracking-tight leading-none">
              <span className="font-light" style={{ color: "oklch(0.75 0 0)" }}>
                Hi, I&apos;m
              </span>{" "}
              <span className="font-black text-white">{profile.name}</span>
            </h1>

            {/* Tailored value prop — specific to CCURE/Lenel integration job */}
            <p
              className="text-base md:text-lg leading-relaxed max-w-2xl"
              style={{ color: "oklch(0.70 0 0)" }}
            >
              {profile.tagline}
            </p>

            {/* Stats shelf */}
            <div
              className="grid grid-cols-3 gap-4 pt-4 mt-4 border-t"
              style={{ borderColor: "oklch(1 0 0 / 0.10)" }}
            >
              {[
                { value: "24+", label: "Projects Shipped" },
                { value: "< 48hr", label: "Demo Turnaround" },
                { value: "15+", label: "Industries Served" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    className="text-xl font-bold"
                    style={{ color: "oklch(0.92 0 0)" }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-xs font-mono"
                    style={{ color: "oklch(0.55 0 0)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 2: Proof of Work — relevant portfolio projects ── */}
        <section className="space-y-4">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-1">
              Proof of Work
            </p>
            <h2 className="text-xl font-semibold tracking-tight">
              Relevant Projects
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {portfolioProjects.map((project) => (
              <ProjectCard
                key={project.id}
                title={project.title}
                description={project.description}
                tech={project.tech}
                relevance={project.relevance}
                outcome={project.outcome}
                liveUrl={project.liveUrl}
              />
            ))}
          </div>
        </section>

        {/* ── Section 3: How I Work — adapted to integration project methodology ── */}
        <section className="space-y-4">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-1">
              Process
            </p>
            <h2 className="text-xl font-semibold tracking-tight">
              How I Work on Integration Projects
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {profile.approach.map((step, i) => (
              <div
                key={step.title}
                className="p-4 space-y-2 bg-card border border-border/60"
                style={{
                  borderRadius: "var(--radius)",
                  boxShadow: "var(--card-shadow)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
                    Step {String(i + 1).padStart(2, "0")}
                  </span>
                  {i === 0 && (
                    <span className="font-mono text-xs text-muted-foreground/60">
                      Week 1
                    </span>
                  )}
                  {i === 1 && (
                    <span className="font-mono text-xs text-muted-foreground/60">
                      Weeks 2–4
                    </span>
                  )}
                  {i === 2 && (
                    <span className="font-mono text-xs text-muted-foreground/60">
                      Weeks 3–6
                    </span>
                  )}
                  {i === 3 && (
                    <span className="font-mono text-xs text-muted-foreground/60">
                      Week 6+
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 4: Skills Grid — filtered to this job's tech ── */}
        <section className="space-y-4">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-1">
              Tech Stack
            </p>
            <h2 className="text-xl font-semibold tracking-tight">
              What I Build With
            </h2>
          </div>

          <SkillsGrid categories={profile.skillCategories} />
        </section>

        {/* ── Section 5: CTA — dark panel close ── */}
        <section
          className="relative overflow-hidden text-center"
          style={{
            background: "var(--section-dark)",
            borderRadius: "var(--radius)",
          }}
        >
          <div className="relative z-10 p-8 md:p-10 space-y-4">
            {/* Pulsing availability indicator */}
            <div className="flex items-center justify-center gap-2">
              <span className="relative inline-flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: "var(--success)" }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: "var(--success)" }}
                />
              </span>
              <span
                className="text-sm"
                style={{
                  color:
                    "color-mix(in oklch, var(--success) 80%, oklch(1 0 0))",
                }}
              >
                Currently available for new projects
              </span>
            </div>

            {/* Tailored CTA headline */}
            <h2
              className="text-xl font-bold"
              style={{ color: "oklch(0.92 0 0)" }}
            >
              Your CCURE and Lenel data shouldn&apos;t live in two separate
              silos.
            </h2>

            {/* Specific body copy */}
            <p
              className="max-w-lg mx-auto leading-relaxed text-sm"
              style={{ color: "oklch(0.65 0 0)" }}
            >
              The demo in Tab 1 shows what a unified sync layer looks like in
              practice — cardholder records, credential status, and access events
              from both providers in one place. I can scope the real adapter
              architecture in the first conversation.
            </p>

            {/* Primary action — text, not a dead link */}
            <p
              className="text-base font-semibold pt-2"
              style={{ color: "oklch(0.92 0 0)" }}
            >
              Reply on Upwork to start
            </p>

            {/* Secondary — back to demo */}
            <a
              href="/"
              className="inline-flex items-center gap-1 text-sm transition-colors text-white/30 hover:text-white/55"
            >
              Back to the demo
            </a>

            {/* Signature */}
            <p
              className="pt-4 text-sm border-t mt-4"
              style={{
                color: "oklch(0.45 0 0)",
                borderColor: "oklch(1 0 0 / 0.10)",
              }}
            >
              -- Humam
            </p>
          </div>
        </section>

        {/* Bottom spacer so last section isn't flush against viewport edge */}
        <div className="h-4" aria-hidden />
      </div>
    </div>
  );
}

