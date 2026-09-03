import { ArrowDown, Clock, ExternalLink, Link2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { apiPost } from "@/lib/api";
import { meKey } from "@/lib/session";
import type { RoadmapStep, User } from "@/lib/types";

const PRIORITY_TONE: Record<string, string> = {
  HIGH: "border-destructive/40 bg-destructive/10 text-destructive",
  MEDIUM: "border-warning/40 bg-warning/10 text-warning",
  LOW: "border-border bg-muted text-muted-foreground",
};

export default function LearningRoadmap({ steps }: { steps: RoadmapStep[] }) {
  const totalDays = steps.reduce((sum, s) => sum + s.days, 0);
  const qc = useQueryClient();

  const learn = useMutation({
    mutationFn: (vars: { key: string; label: string }) =>
      apiPost<User>("/skills/learn", { skill_key: vars.key, learned: true }),
    onSuccess: (user, vars) => {
      qc.setQueryData(meKey, user);
      qc.invalidateQueries({ queryKey: ["analysis"] });
      qc.invalidateQueries({ queryKey: ["analyses"] });
      qc.invalidateQueries({ queryKey: ["insights"] });
      qc.invalidateQueries({ queryKey: ["progress"] });
      toast.success(`${vars.label} added to your profile — every match score recalculated`);
    },
    onError: () => toast.error("Could not mark that skill as learned"),
  });

  return (
    <Card data-testid="learning-roadmap-panel">
      <CardHeader className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle className="font-heading">Personalised Learning Roadmap</CardTitle>
        <Badge variant="secondary" data-testid="roadmap-total-days">
          <Clock className="size-3.5" /> {totalDays} days total sprint
        </Badge>
      </CardHeader>
      <CardContent>
        {steps.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No gaps to close for this role — go straight to interview prep.
          </p>
        ) : (
          <ol className="flex flex-col" data-testid="roadmap-steps">
            {steps.map((step, i) => (
              <li key={step.skill_key} className="flex flex-col">
                <div
                  data-testid={`roadmap-step-${step.order}`}
                  className="animate-rise rounded-xl border border-border bg-secondary/40 p-4 transition-transform duration-200 ease-out hover:-translate-y-0.5"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary font-mono text-sm font-bold text-primary-foreground">
                      {step.order}
                    </span>
                    <span className="font-heading text-lg font-semibold">{step.skill}</span>                    <Badge
                      variant="outline"
                      className={PRIORITY_TONE[step.priority] ?? PRIORITY_TONE.LOW}
                      data-testid={`roadmap-step-${step.order}-priority`}
                    >
                      {step.priority} PRIORITY
                    </Badge>
                    <Badge variant="secondary" data-testid={`roadmap-step-${step.order}-days`}>
                      ~{step.days} days
                    </Badge>
                  </div>
                  <p className="mt-2 pl-11 text-sm text-muted-foreground">{step.reason}</p>
                  <label
                    className="mt-3 flex w-fit cursor-pointer items-center gap-2 pl-11 text-sm font-medium"
                    data-testid={`roadmap-step-${step.order}-learned-label`}
                  >
                    <Checkbox
                      checked={false}
                      disabled={learn.isPending}
                      onCheckedChange={() => learn.mutate({ key: step.skill_key, label: step.skill })}
                      data-testid={`roadmap-step-${step.order}-learned-checkbox`}
                    />
                    I have learned {step.skill}
                  </label>
                  {step.depends_on.length > 0 && (
                    <p className="mt-1 flex items-center gap-1.5 pl-11 font-mono text-xs text-muted-foreground">
                      <Link2 className="size-3.5" /> depends on: {step.depends_on.join(" → ")}
                    </p>
                  )}
                  {step.resources.length > 0 && (
                    <div className="mt-3 pl-11" data-testid={`roadmap-step-${step.order}-resources`}>
                      <p className="mb-1.5 font-mono text-[10px] tracking-widest text-muted-foreground">
                        START LEARNING — FREE
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {step.resources.map((res) => (
                          <a
                            key={res.url}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid={`roadmap-resource-${step.skill_key}-${res.url.length}`}
                            className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors duration-200 hover:bg-primary/20"
                          >
                            <ExternalLink className="size-3.5" /> {res.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {i < steps.length - 1 && (
                  <ArrowDown className="my-1 ml-4 size-4 text-muted-foreground" />
                )}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
