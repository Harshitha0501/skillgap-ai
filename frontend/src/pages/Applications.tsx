import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiGet, apiPatch } from "@/lib/api";
import { toneFor } from "@/components/analytics/MatchGauge";
import { APP_STATUS_LABELS } from "@/lib/types";
import type { AnalysisSummary, Insights } from "@/lib/types";

const STATUSES = ["not_applied", "applied", "interviewing", "rejected", "offer"];

const STATUS_TONE: Record<string, string> = {
  not_applied: "text-muted-foreground",
  applied: "text-primary",
  interviewing: "text-warning",
  rejected: "text-destructive",
  offer: "text-success",
};

function ApplicationRow({ job }: { job: AnalysisSummary }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState(job.app_status);
  const [date, setDate] = useState(job.applied_date ?? "");
  const [notes, setNotes] = useState(job.notes ?? "");
  const tone = toneFor(job.match_score);

  const save = useMutation({
    mutationFn: () =>
      apiPatch<AnalysisSummary>(`/analyses/${job.id}/application`, {
        app_status: status,
        applied_date: date || null,
        notes,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["analyses"] });
      qc.invalidateQueries({ queryKey: ["insights"] });
      toast.success(`${job.role_title} updated`);
    },
    onError: () => toast.error("Could not save that application"),
  });

  return (
    <div
      className="grid gap-4 border-b border-border py-4 last:border-0 lg:grid-cols-[1.1fr_0.7fr_0.7fr_1.2fr_auto]"
      data-testid={`application-row-${job.id}`}
    >
      <div>
        <Link
          to={`/report/${job.id}`}
          className="font-heading text-base font-semibold text-primary hover:underline"
          data-testid={`application-open-${job.id}`}
        >
          {job.role_title}
        </Link>
        <p className="text-sm text-muted-foreground">{job.company || "—"}</p>
        <p
          className={`mt-1 font-mono text-sm font-bold ${
            tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-destructive"
          }`}
          data-testid={`application-match-${job.id}`}
        >
          {job.match_score}% match
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground">STATUS</span>
        <Select value={status} onValueChange={(v: string) => setStatus(v)}>
          <SelectTrigger data-testid={`application-status-select-${job.id}`}>
            <SelectValue>{(v) => APP_STATUS_LABELS[v as string] ?? "Not applied"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} data-testid={`application-status-option-${s}-${job.id}`}>
                {APP_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground">APPLIED ON</span>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          data-testid={`application-date-input-${job.id}`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground">NOTES</span>
        <Textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Recruiter name, round feedback…"
          data-testid={`application-notes-input-${job.id}`}
        />
      </div>

      <div className="flex items-end">
        <Button
          size="sm"
          variant="outline"
          onClick={() => save.mutate()}
          disabled={save.isPending}
          data-testid={`application-save-${job.id}`}
        >
          <Save className="size-3.5" /> {save.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default function Applications() {
  const { data, isLoading, error } = useQuery<AnalysisSummary[]>({
    queryKey: ["analyses"],
    queryFn: () => apiGet<AnalysisSummary[]>("/analyses"),
    retry: false,
  });
  const { data: insights } = useQuery<Insights>({
    queryKey: ["insights"],
    queryFn: () => apiGet<Insights>("/insights"),
    retry: false,
  });

  const jobs = error ? [] : (data ?? []);
  const counts = insights?.status_counts ?? {};

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">PIPELINE</p>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">Application tracker</h1>
        <p className="text-muted-foreground">
          Log what happened to each application and see how outcomes track your match score.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        {STATUSES.map((s) => (
          <Card key={s} data-testid={`application-count-${s}`}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{APP_STATUS_LABELS[s]}</p>
              <p className={`font-mono text-3xl font-extrabold ${STATUS_TONE[s]}`}>{counts[s] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/40 bg-primary/5" data-testid="application-outcome-insight">
        <CardContent className="pt-6">
          <p className="font-mono text-[11px] tracking-widest text-muted-foreground">OUTCOME INSIGHT</p>
          <p className="mt-1 text-base leading-relaxed">
            {insights?.outcome_insight ??
              "Log the outcome of your applications to see how match score correlates with rejections."}
          </p>
        </CardContent>
      </Card>

      <Card data-testid="applications-panel">
        <CardHeader>
          <CardTitle className="font-heading">Your applications</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground" data-testid="applications-empty-state">
              {isLoading ? "Loading…" : "Analyze a job description first, then track it here."}
            </p>
          ) : (
            <div className="flex flex-col" data-testid="applications-list">
              {jobs.map((job) => (
                <ApplicationRow key={job.id} job={job} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
