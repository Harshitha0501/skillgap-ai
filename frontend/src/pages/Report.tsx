import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MatchGauge, { ScoreBar } from "@/components/analytics/MatchGauge";
import SkillsMatrix from "@/components/analytics/SkillsMatrix";
import LearningRoadmap from "@/components/roadmap/LearningRoadmap";
import InterviewVault from "@/components/interview/InterviewVault";
import RecruiterReport from "@/components/report/RecruiterReport";
import { apiGet } from "@/lib/api";
import type { Analysis } from "@/lib/types";

export default function Report() {
  const { id = "" } = useParams();
  const { data, isLoading, error } = useQuery<Analysis>({
    queryKey: ["analysis", id],
    queryFn: () => apiGet<Analysis>(`/analyses/${id}`),
    enabled: Boolean(id),
    retry: false,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="no-print flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">GAP ANALYSIS</p>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight" data-testid="analysis-title">
            {data ? data.role_title || "Untitled role" : "Analysis"}
          </h1>
          {data?.company && <p className="text-muted-foreground">{data.company}</p>}
        </div>
        <Link to="/history" className="text-sm font-medium text-primary" data-testid="back-to-history-link">
          ← All analyses
        </Link>
      </div>

      {!data && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {isLoading ? "Loading analysis…" : error ? "This analysis is unavailable." : null}
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          <div className="grid gap-6 lg:grid-cols-[0.55fr_1.45fr]">
            <Card className="items-center justify-center py-8">
              <CardContent className="flex flex-col items-center gap-4">
                <MatchGauge score={data.match_score} />
                <Badge variant="secondary" data-testid="analysis-verdict-badge">
                  {data.verdict}
                </Badge>
              </CardContent>
            </Card>
            <Card data-testid="score-breakdown-panel">
              <CardHeader>
                <CardTitle className="font-heading">Score breakdown</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <ScoreBar label="Technical core" value={data.technical_score} testId="score-technical" />
                <ScoreBar label="Tooling & infra" value={data.tooling_score} testId="score-tooling" />
                <ScoreBar label="Experience match" value={data.experience_match} testId="score-experience" />
                <ScoreBar label="Project scope" value={data.project_score} testId="score-project" />
                <ScoreBar label="Keyword coverage" value={data.keyword_coverage} testId="score-keywords" />
                <ScoreBar label="Interview readiness" value={data.readiness} testId="score-readiness" />
                <div className="flex flex-wrap gap-2 sm:col-span-2">
                  <Badge variant="outline" data-testid="stat-required-count">
                    {data.required_skills.length} required
                  </Badge>
                  <Badge variant="outline" data-testid="stat-strong-count">
                    ✓ {data.strong_skills.length} matched
                  </Badge>
                  <Badge variant="outline" data-testid="stat-partial-count">
                    ⚠ {data.partial_skills.length} partial
                  </Badge>
                  <Badge variant="outline" data-testid="stat-missing-count">
                    ✕ {data.missing_skills.length} missing
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <SkillsMatrix
            strong={data.strong_skills}
            partial={data.partial_skills}
            missing={data.missing_skills}
          />
          <LearningRoadmap steps={data.roadmap} />
          <InterviewVault questions={data.questions} />
          <RecruiterReport analysis={data} />
        </>
      )}
    </div>
  );
}
