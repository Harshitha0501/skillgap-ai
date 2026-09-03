export function ScoreBar({
  label,
  value,
  testId,
  tone = "primary",
}: {
  label: string;
  value: number;
  testId: string;
  tone?: "primary" | "success" | "warning" | "destructive";
}) {
  const bg =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
        ? "bg-warning"
        : tone === "destructive"
          ? "bg-destructive"
          : "bg-primary";
  return (
    <div data-testid={testId}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-mono text-sm font-bold" data-testid={`${testId}-value`}>
          {value}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full animate-sweep rounded-full ${bg}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

export function toneFor(score: number): "success" | "warning" | "destructive" {
  return score >= 80 ? "success" : score >= 65 ? "warning" : "destructive";
}

export default function MatchGauge({ score, label = "JOB MATCH" }: { score: number; label?: string }) {
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  const offset = circumference - (clamped / 100) * circumference;
  const tone = toneFor(clamped);
  const stroke =
    tone === "success" ? "var(--success)" : tone === "warning" ? "var(--warning)" : "var(--destructive)";

  return (
    <div className="relative grid size-[188px] place-items-center" data-testid="match-gauge">
      <svg width="188" height="188" viewBox="0 0 188 188" className="absolute inset-0 -rotate-90">
        <circle cx="94" cy="94" r={radius} fill="none" stroke="var(--muted)" strokeWidth="14" />
        <circle
          cx="94"
          cy="94"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="relative flex flex-col items-center">
        <span className="font-mono text-4xl font-extrabold" data-testid="match-score-value">
          {clamped}%
        </span>
        <span className="mt-1 font-mono text-[10px] tracking-[0.18em] text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
