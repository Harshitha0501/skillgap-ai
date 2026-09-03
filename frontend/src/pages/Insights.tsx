import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGet } from "@/lib/api";
import type { Insights as InsightsData } from "@/lib/types";

export default function Insights() {
  const { data, isLoading, error } = useQuery<InsightsData>({
    queryKey: ["insights"],
    queryFn: () => apiGet<InsightsData>("/insights"),
    retry: false,
  });
  const insights = error ? null : data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">MARKET INTELLIGENCE</p>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">
          Why am I not getting shortlisted?
        </h1>
        <p className="text-muted-foreground">
          Aggregated across every job description you have analyzed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card data-testid="insights-total-jobs">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Jobs analyzed</p>
            <p className="font-mono text-3xl font-extrabold">{insights?.total_jobs ?? 0}</p>
          </CardContent>
        </Card>
        <Card data-testid="insights-average-match">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Average match</p>
            <p className="font-mono text-3xl font-extrabold">{insights?.average_match ?? 0}%</p>
          </CardContent>
        </Card>
        <Card data-testid="insights-biggest-blocker">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Biggest recurring gap</p>
            <p className="font-heading text-2xl font-bold text-destructive">
              {insights?.biggest_blocker?.label ?? "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-warning/40 bg-warning/5" data-testid="insights-unlock-callout">
        <CardContent className="flex items-start gap-3 pt-6">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
          <p className="text-base leading-relaxed">
            {insights?.unlock_message ??
              (isLoading ? "Crunching your analyses…" : "Analyze a few jobs to unlock market insights.")}
          </p>
        </CardContent>
      </Card>

      <Card data-testid="insights-outcome-callout">
        <CardHeader>
          <CardTitle className="font-heading">Application outcomes vs match score</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-base leading-relaxed" data-testid="insights-outcome-text">
            {insights?.outcome_insight ??
              "Log the outcome of your applications to see how match score correlates with rejections."}
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline" data-testid="insights-rejected-avg">
              Rejected avg: {insights?.rejected_avg_match ?? "—"}%
            </Badge>
            <Badge variant="outline" data-testid="insights-progressed-avg">
              Interview/offer avg: {insights?.progressed_avg_match ?? "—"}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="insights-demand-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <TrendingUp className="size-4 text-primary" /> Most frequently requested skills
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {(insights?.demand ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No demand data yet.</p>
          )}
          {(insights?.demand ?? []).map((row, i) => (
            <div
              key={row.key}
              className="animate-rise"
              style={{ animationDelay: `${i * 30}ms` }}
              data-testid={`demand-row-${row.key}`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm font-medium">
                  {row.label}{" "}
                  {row.you_have ? (
                    <Badge variant="secondary" className="ml-1 text-success">
                      you have it
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="ml-1 text-destructive">
                      gap
                    </Badge>
                  )}
                </span>
                <span className="font-mono text-sm text-muted-foreground">
                  {row.requested_in}/{row.total_jobs}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full animate-sweep rounded-full ${row.you_have ? "bg-success" : "bg-destructive"}`}
                  style={{ width: `${(row.requested_in / Math.max(1, row.total_jobs)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card data-testid="insights-recurring-gaps">        <CardHeader>
          <CardTitle className="font-heading">Fast-track: close these first</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(insights?.top_recurring_gaps ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No recurring gaps.</p>
          )}
          {(insights?.top_recurring_gaps ?? []).map((row) => (
            <span
              key={row.key}
              data-testid={`recurring-gap-${row.key}`}
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-sm font-semibold"
            >
              {row.label} — asked in {row.requested_in}/{row.total_jobs}
            </span>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
