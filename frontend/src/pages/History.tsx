import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiDelete, apiGet } from "@/lib/api";
import { toneFor } from "@/components/analytics/MatchGauge";
import type { AnalysisSummary } from "@/lib/types";

export default function History() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery<AnalysisSummary[]>({
    queryKey: ["analyses"],
    queryFn: () => apiGet<AnalysisSummary[]>("/analyses"),
    retry: false,
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete<{ ok: boolean }>(`/analyses/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["analyses"] });
      qc.invalidateQueries({ queryKey: ["insights"] });
      toast.success("Analysis deleted");
    },
    onError: () => toast.error("Could not delete that analysis"),
  });

  const rows = error ? [] : (data ?? []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">Analysis history</h1>
        <p className="text-muted-foreground">Every job description you have analyzed.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {rows.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground" data-testid="history-empty-state">
              {isLoading ? "Loading…" : "No analyses yet — paste your first job description."}
            </p>
          ) : (
            <Table data-testid="history-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Readiness</TableHead>
                  <TableHead>Gaps</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const tone = toneFor(row.match_score);
                  return (
                    <TableRow key={row.id} data-testid={`history-row-${row.id}`}>
                      <TableCell className="font-medium">
                        <Link
                          to={`/report/${row.id}`}
                          className="text-primary hover:underline"
                          data-testid={`history-open-${row.id}`}
                        >
                          {row.role_title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.company || "—"}</TableCell>
                      <TableCell>
                        <span
                          className={`font-mono font-bold ${
                            tone === "success"
                              ? "text-success"
                              : tone === "warning"
                                ? "text-warning"
                                : "text-destructive"
                          }`}
                        >
                          {row.match_score}%
                        </span>
                      </TableCell>
                      <TableCell className="font-mono">{row.readiness}%</TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.missing_count} missing</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Delete analysis"
                          onClick={() => remove.mutate(row.id)}
                          data-testid={`history-delete-${row.id}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
