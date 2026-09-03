import { Check, CircleAlert, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SkillRow } from "@/lib/types";

function List({
  rows,
  tone,
  icon,
  testId,
  empty,
}: {
  rows: SkillRow[];
  tone: string;
  icon: React.ReactNode;
  testId: string;
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <ul className="flex flex-col gap-1.5" data-testid={testId}>
      {rows.map((row, i) => (
        <li
          key={row.key}
          data-testid={`${testId}-item-${row.key}`}
          className={`flex animate-rise items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium ${tone}`}
          style={{ animationDelay: `${i * 35}ms` }}
        >
          {icon}
          <span>{row.label}</span>
        </li>
      ))}
    </ul>
  );
}

export default function SkillsMatrix({
  strong,
  partial,
  missing,
}: {
  strong: SkillRow[];
  partial: SkillRow[];
  missing: SkillRow[];
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card data-testid="strong-skills-panel">
        <CardHeader>
          <CardTitle className="font-heading">Strong Skills — you already match</CardTitle>
        </CardHeader>
        <CardContent>
          <List
            rows={strong}
            tone="border-success/30 bg-success/10 text-foreground"
            icon={<Check className="size-4 shrink-0 text-success" />}
            testId="strong-skills-list"
            empty="None of the JD requirements matched your profile yet."
          />
        </CardContent>
      </Card>

      <Card data-testid="gap-skills-panel">
        <CardHeader>
          <CardTitle className="font-heading">Skill Gaps — what you are missing</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <p className="mb-2 font-mono text-[11px] tracking-widest text-destructive">CRITICAL / MISSING</p>
            <List
              rows={missing}
              tone="border-destructive/30 bg-destructive/10 text-foreground"
              icon={<X className="size-4 shrink-0 text-destructive" />}
              testId="missing-skills-list"
              empty="No hard blockers — nice."
            />
          </div>
          <div>
            <p className="mb-2 font-mono text-[11px] tracking-widest text-warning">ADJACENT / PARTIAL</p>
            <List
              rows={partial}
              tone="border-warning/30 bg-warning/10 text-foreground"
              icon={<CircleAlert className="size-4 shrink-0 text-warning" />}
              testId="partial-skills-list"
              empty="No adjacent skills detected."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
