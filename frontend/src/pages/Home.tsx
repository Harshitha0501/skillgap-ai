import { Link } from "react-router-dom";
import { ArrowRight, Radar, Target, Route, MessageSquareQuote, FileText, Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useTheme } from "@/lib/useTheme";

const FEATURES = [
  {
    icon: Target,
    title: "Deterministic gap engine",
    body: "A 90+ skill dictionary with alias expansion extracts requirements from any JD and scores you by weighted category — no AI, no latency, no API bill.",
  },
  {
    icon: Route,
    title: "Prioritised learning roadmap",
    body: "Gaps are ordered by dependency and category weight, each with a HIGH/MEDIUM/LOW priority and an estimated number of days.",
  },
  {
    icon: MessageSquareQuote,
    title: "Tiered interview vault",
    body: "Basic, intermediate, project-based and JD-specific questions generated from the exact stack the job asks for.",
  },
  {
    icon: FileText,
    title: "Recruiter view + PDF",
    body: "A printable scorecard with sub-scores, top strengths, top gaps, readiness bar and a verdict stamp.",
  },
];

export default function Home() {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Radar className="size-4" />
          </span>
          <span className="font-heading text-lg font-extrabold tracking-tight">
            SkillGap<span className="text-primary">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground"
            data-testid="landing-theme-toggle"
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <Link to="/login" className={buttonVariants({ variant: "outline", size: "sm" })} data-testid="landing-login-link">
            Sign in
          </Link>
          <Link to="/signup" className={buttonVariants({ size: "sm" })} data-testid="landing-signup-link">
            Get started
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
        <div className="animate-rise">
          <p className="font-mono text-xs tracking-[0.22em] text-primary">
            JOB DESCRIPTION → SKILL GAP → ROADMAP
          </p>
          <h1 className="mt-4 font-heading text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Stop guessing why you were not shortlisted.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Paste a job description. SkillGap AI compares it against your resume skills and tells you the
            match percentage, exactly what is missing, what to learn first, and which interview questions to
            prepare — then hands you a recruiter-style PDF scorecard.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/signup" className={buttonVariants({ size: "lg" })} data-testid="hero-signup-button">
              Analyze my first JD <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/login"
              className={buttonVariants({ variant: "outline", size: "lg" })}
              data-testid="hero-demo-button"
            >
              Try the demo account
            </Link>
          </div>
          <p className="mt-4 font-mono text-xs text-muted-foreground" data-testid="demo-credentials">
            demo@skillgap.ai / demo1234 — pre-loaded with 5 analyzed jobs
          </p>
          <a
            href="/skillgap-ai.zip"
            download
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            data-testid="download-source-zip-link"
          >
            <Download className="size-4" /> Download full source code (.zip)
          </a>
        </div>

        <div className="animate-rise rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">SAMPLE OUTPUT</p>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-mono text-5xl font-extrabold text-warning">72%</span>
            <span className="text-sm text-muted-foreground">job match — Associate Software Developer</span>
          </div>
          <div className="mt-6 flex flex-col gap-2 text-sm">
            <p className="font-mono text-[11px] tracking-widest text-destructive">MISSING</p>
            {["Microservices", "Docker", "AWS", "Kafka"].map((s) => (
              <div key={s} className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-1.5">
                ✕ {s}
              </div>
            ))}
            <p className="mt-3 font-mono text-[11px] tracking-widest text-success">STRONG</p>
            {["Java", "Spring Boot", "SQL", "REST API"].map((s) => (
              <div key={s} className="rounded-md border border-success/30 bg-success/10 px-3 py-1.5">
                ✓ {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Not another resume keyword counter
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-5 transition-transform duration-200 ease-out hover:-translate-y-0.5"
            >
              <f.icon className="size-5 text-primary" />
              <h3 className="mt-3 font-heading text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
