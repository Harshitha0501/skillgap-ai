import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGet } from "@/lib/api";
import type { ProgressData } from "@/lib/types";

export default function Progress() {
  const { data, isLoading, error } = useQuery<ProgressData>({
    queryKey: ["progress"],
    queryFn: () => apiGet<ProgressData>("/progress"),
    retry: false,
  });
  const progress = error ? null : data;
  const points = progress?.points ?? [];
  const delta = progress?.delta ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">PROGRESS</p>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">Readiness timeline</h1>
        <p className="text-muted-foreground">
          Your average match score across all analyzed jobs, week by week, as you tick off roadmap skills.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card data-testid="progress-latest">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Average match now</p>
            <p className="font-mono text-3xl font-extrabold">{progress?.latest_average ?? 0}%</p>
          </CardContent>
        </Card>
        <Card data-testid="progress-delta">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Change since start</p>
            <p
              className={`font-mono text-3xl font-extrabold ${
                delta > 0 ? "text-success" : delta < 0 ? "text-destructive" : ""
              }`}
            >
              {delta > 0 ? "+" : ""}
              {delta} pts
            </p>
          </CardContent>
        </Card>
        <Card data-testid="progress-skills-added">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Skills added</p>
            <p className="font-mono text-3xl font-extrabold">{progress?.skills_added ?? 0}</p>
          </CardContent>
        </Card>
        <Card data-testid="progress-weeks">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Weeks tracked</p>
            <p className="font-mono text-3xl font-extrabold">{progress?.weeks_tracked ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/40 bg-primary/5" data-testid="progress-headline-card">
        <CardContent className="flex items-start gap-3 pt-6">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-base leading-relaxed" data-testid="progress-headline">
            {progress?.headline ??
              (isLoading
                ? "Loading your timeline…"
                : "Analyze a job and tick off a roadmap skill to start your timeline.")}
          </p>
        </CardContent>
      </Card>

      <Card data-testid="progress-chart-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <TrendingUp className="size-4 text-primary" /> Average match over time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {points.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground" data-testid="progress-empty-state">
              No history yet — every analysis you run and every skill you tick adds a point here.
            </p>
          ) : (
            <div className="h-72 w-full" data-testid="progress-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 10, right: 16, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      color: "var(--popover-foreground)",
                    }}
                    formatter={(value, name) => [
                      name === "average_match" ? `${value}%` : `${value}`,
                      name === "average_match" ? "Average match" : "Skills",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="average_match"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "var(--primary)" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="skills_count"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {points.length > 0 && (
        <Card data-testid="progress-table-card">
          <CardHeader>
            <CardTitle className="font-heading">Week by week</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {points
              .slice()
              .reverse()
              .map((point) => (
                <div
                  key={point.week}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2"
                  data-testid={`progress-week-${point.week}`}
                >
                  <span className="font-mono text-sm text-muted-foreground">
                    {point.week} · {point.label}
                  </span>
                  <span className="text-sm">
                    {point.skills_count} skills · {point.jobs_count} jobs
                  </span>
                  <span className="font-mono text-lg font-bold">{point.average_match}%</span>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
