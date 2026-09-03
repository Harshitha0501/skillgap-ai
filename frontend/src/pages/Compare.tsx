import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { toast } from "sonner";
import type { AnalysisSummary, CompareResult } from "@/lib/types";

export default function Compare() {
  const { data: analyses } = useQuery<AnalysisSummary[]>({
    queryKey: ["analyses"],
    queryFn: () => apiGet<AnalysisSummary[]>("/analyses"),
    retry: false,
  });
  const [aId, setAId] = useState("");
  const [bId, setBId] = useState("");

  useEffect(() => {
    if (analyses && analyses.length >= 2) {
      setAId((prev) => prev || analyses[0].id);
      setBId((prev) => prev || analyses[1].id);
    }
  }, [analyses]);

  const compare = useMutation({
    mutationFn: () => apiPost<CompareResult>("/compare", { analysis_a_id: aId, analysis_b_id: bId }),
    onError: (err) => {
      const detail = err instanceof ApiError ? (err.body as { detail?: unknown })?.detail : null;
      toast.error(typeof detail === "string" ? detail : "Could not compare those two jobs");
    },
  });
  const result = compare.data;
  const labels: Record<string, string> = Object.fromEntries(
    (analyses ?? []).map((a) => [a.id, a.role_title]),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">DECISION MATRIX</p>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">Job-to-job comparison</h1>
        <p className="text-muted-foreground">
          Two analyzed roles, side by side against your current skill profile.
        </p>
      </div>

      <Card data-testid="compare-selector-panel">
        <CardContent className="flex flex-wrap items-end gap-4 pt-6">
          <div className="flex min-w-56 flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">Job A</span>
            <Select value={aId} onValueChange={(v: string) => setAId(v)}>
              <SelectTrigger data-testid="compare-select-a">
                <SelectValue>{(v) => labels[v as string] ?? "Select a job"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(analyses ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id} data-testid={`compare-a-option-${a.id}`}>
                    {a.role_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex min-w-56 flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">Job B</span>
            <Select value={bId} onValueChange={(v: string) => setBId(v)}>
              <SelectTrigger data-testid="compare-select-b">
                <SelectValue>{(v) => labels[v as string] ?? "Select a job"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(analyses ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id} data-testid={`compare-b-option-${a.id}`}>
                    {a.role_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => compare.mutate()}
            disabled={!aId || !bId || aId === bId || compare.isPending}
            data-testid="compare-run-button"
          >
            {compare.isPending ? "Comparing…" : "Compare jobs"}
          </Button>
          {aId && bId && aId === bId && (
            <span className="text-sm text-destructive">Pick two different jobs.</span>
          )}
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {[result.a, result.b].map((job, idx) => {
              const isWinner = result.winner === (idx === 0 ? "a" : "b");
              return (
                <Card
                  key={job.id}
                  className={isWinner ? "border-success/50" : ""}
                  data-testid={`compare-card-${idx === 0 ? "a" : "b"}`}
                >
                  <CardContent className="pt-6">
                    <p className="font-mono text-[11px] tracking-widest text-muted-foreground">
                      JOB {idx === 0 ? "A" : "B"}
                    </p>
                    <h3 className="font-heading text-xl font-bold">{job.role_title}</h3>
                    <p className="text-sm text-muted-foreground">{job.company || "—"}</p>
                    <p className="mt-3 font-mono text-4xl font-extrabold">{job.match_score}%</p>
                    {isWinner && (
                      <p
                        className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-success"
                        data-testid={`compare-winner-${idx === 0 ? "a" : "b"}`}
                      >
                        <Trophy className="size-4" /> Best match for you
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-base" data-testid="compare-recommendation">
                {result.recommendation}
              </p>
            </CardContent>
          </Card>

          <Card data-testid="compare-matrix-panel">
            <CardHeader>
              <CardTitle className="font-heading">Skill-by-skill matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <Table data-testid="compare-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Skill</TableHead>
                    <TableHead>Job A</TableHead>
                    <TableHead>Job B</TableHead>
                    <TableHead>You</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.rows.map((row) => (
                    <TableRow key={row.key} data-testid={`compare-row-${row.key}`}>
                      <TableCell className="font-medium">{row.label}</TableCell>
                      <TableCell>{row.in_a ? <Check className="size-4 text-success" /> : <X className="size-4 text-muted-foreground" />}</TableCell>
                      <TableCell>{row.in_b ? <Check className="size-4 text-success" /> : <X className="size-4 text-muted-foreground" />}</TableCell>
                      <TableCell>
                        {row.you_have ? (
                          <Check className="size-4 text-success" />
                        ) : (
                          <X className="size-4 text-destructive" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
