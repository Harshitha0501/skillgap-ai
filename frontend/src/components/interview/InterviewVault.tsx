import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InterviewQuestion } from "@/lib/types";

const TIERS = [
  { key: "basic", label: "Basic" },
  { key: "intermediate", label: "Intermediate" },
  { key: "project", label: "Project-based" },
  { key: "jd_specific", label: "JD-specific" },
];

function QuestionCard({ q, testId }: { q: InterviewQuestion; testId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <li
      data-testid={testId}
      className="rounded-lg border border-border bg-secondary/30 p-3 transition-colors duration-200 hover:border-primary/40"
    >
      <p className="text-sm leading-relaxed">{q.question}</p>
      {q.hint && (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            data-testid={`${testId}-hint-toggle`}
            className="mt-2 flex items-center gap-1.5 font-mono text-[11px] tracking-widest text-primary"
          >
            <Lightbulb className="size-3.5" /> {open ? "HIDE ANSWER POINTERS" : "SHOW ANSWER POINTERS"}
          </button>
          {open && (
            <p
              className="mt-2 animate-rise rounded-md border-l-2 border-primary bg-primary/5 p-3 text-sm leading-relaxed text-muted-foreground"
              data-testid={`${testId}-hint`}
            >
              {q.hint}
            </p>
          )}
        </>
      )}
    </li>
  );
}

export default function InterviewVault({ questions }: { questions: InterviewQuestion[] }) {
  return (
    <Card data-testid="interview-vault-panel">
      <CardHeader>
        <CardTitle className="font-heading">Interview Question Vault</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList variant="line" data-testid="interview-tabs">
            {TIERS.map((tier) => (
              <TabsTrigger key={tier.key} value={tier.key} data-testid={`interview-tab-${tier.key}`}>
                {tier.label} ({questions.filter((q) => q.tier === tier.key).length})
              </TabsTrigger>
            ))}
          </TabsList>
          {TIERS.map((tier) => {
            const rows = questions.filter((q) => q.tier === tier.key);
            return (
              <TabsContent key={tier.key} value={tier.key} className="pt-4">
                {rows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No questions in this tier.</p>
                ) : (
                  <ul className="flex flex-col gap-2" data-testid={`interview-list-${tier.key}`}>
                    {rows.map((q, i) => (
                      <QuestionCard
                        key={`${tier.key}-${i}`}
                        q={q}
                        testId={`interview-question-${tier.key}-${i}`}
                      />
                    ))}
                  </ul>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
