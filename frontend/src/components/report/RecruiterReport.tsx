import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreBar, toneFor } from "@/components/analytics/MatchGauge";
import type { Analysis } from "@/lib/types";

export default function RecruiterReport({ analysis }: { analysis: Analysis }) {
  const tone = toneFor(analysis.readiness);
  const stamp =
    tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-destructive";

  return (
    <section
      className="print-sheet rounded-xl border border-border bg-card p-6"
      data-testid="recruiter-report-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
            CANDIDATE ANALYSIS
          </p>
          <h2 className="font-heading text-2xl font-bold" data-testid="report-role-title">
            {analysis.role_title || "Untitled role"}
            {analysis.company ? ` — ${analysis.company}` : ""}
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="no-print"
          onClick={() => window.print()}
          data-testid="export-pdf-button"
        >
          <Printer className="size-3.5" /> Export PDF
        </Button>
      </div>

      <div className="grid gap-6 py-5 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <ScoreBar label="Overall Match" value={analysis.match_score} testId="report-overall-match" />
          <ScoreBar label="Technical Skills" value={analysis.technical_score} testId="report-technical" />
          <ScoreBar label="Tooling & Infra" value={analysis.tooling_score} testId="report-tooling" />
          <ScoreBar label="Experience Match" value={analysis.experience_match} testId="report-experience" />
          <ScoreBar label="Project Match" value={analysis.project_score} testId="report-project" />
          <ScoreBar label="Keyword Coverage" value={analysis.keyword_coverage} testId="report-keywords" />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-1.5 font-mono text-[11px] tracking-widest text-muted-foreground">
              TOP STRENGTHS
            </p>
            <ul className="flex flex-wrap gap-1.5" data-testid="report-top-strengths">
              {analysis.strong_skills.slice(0, 5).map((s) => (
                <li
                  key={s.key}
                  className="rounded-md border border-success/40 bg-success/10 px-2 py-1 text-xs font-semibold"
                >
                  ✓ {s.label}
                </li>
              ))}
              {analysis.strong_skills.length === 0 && (
                <li className="text-sm text-muted-foreground">None recorded</li>
              )}
            </ul>
          </div>
          <div>
            <p className="mb-1.5 font-mono text-[11px] tracking-widest text-muted-foreground">TOP GAPS</p>
            <ol className="flex flex-col gap-1 text-sm" data-testid="report-top-gaps">
              {analysis.missing_skills.slice(0, 5).map((s, i) => (
                <li key={s.key}>
                  {i + 1}. {s.label}
                </li>
              ))}
              {analysis.missing_skills.length === 0 && (
                <li className="text-muted-foreground">No critical gaps</li>
              )}
            </ol>
          </div>
          <ScoreBar
            label="Interview Readiness"
            value={analysis.readiness}
            testId="report-readiness"
            tone={tone}
          />
          <div className="rounded-lg border border-border bg-secondary/40 p-3">
            <p className="font-mono text-[11px] tracking-widest text-muted-foreground">RECOMMENDATION</p>
            <p className={`font-heading text-lg font-extrabold ${stamp}`} data-testid="report-verdict">
              {analysis.verdict}
            </p>
            <p className="text-sm text-muted-foreground">{analysis.verdict_note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
