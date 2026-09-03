import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiPost, ApiError } from "@/lib/api";
import { useCurrentUser } from "@/lib/session";
import type { Analysis } from "@/lib/types";

const PRESETS = [
  {
    label: "Associate Software Developer",
    role: "Associate Software Developer",
    company: "Infosys",
    jd: `We are hiring an Associate Software Developer with 2+ years experience.
Requirements: Java, Spring Boot, Hibernate, JPA, Microservices, Docker, AWS, Kafka, SQL, REST API, JUnit.
Nice to have: Maven, Git, Agile.`,
  },
  {
    label: "Senior Full Stack Engineer",
    role: "Senior Full Stack Engineer",
    company: "Fintech Co",
    jd: `5+ years experience. Must have: TypeScript, React, Next.js, Node.js, PostgreSQL, REST API, GraphQL,
Docker, AWS, CI/CD, Jest, system design. Nice to have: Kubernetes, Redis, Terraform.`,
  },
  {
    label: "Python AI Platform Engineer",
    role: "Python AI Platform Engineer",
    company: "AI Labs",
    jd: `Requirements: Python, FastAPI, Django, Pandas, PyTorch, SQL, PostgreSQL, Redis, Docker,
Kubernetes, AWS, CI/CD, Pytest, Linux, microservices architecture. 3+ years experience.`,
  },
  {
    label: "Cloud / DevOps Engineer",
    role: "Cloud Native Engineer",
    company: "Enterprise SaaS",
    jd: `4+ years with AWS, Docker, Kubernetes, Terraform, Jenkins, CI/CD, Linux, Bash, Python,
Prometheus, serverless and microservices. SQL knowledge required.`,
  },
];

export default function Analyze() {
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();
  const [roleTitle, setRoleTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jdText, setJdText] = useState("");

  const analyze = useMutation({
    mutationFn: () =>
      apiPost<Analysis>("/analyses", { role_title: roleTitle, company, jd_text: jdText }),
    onSuccess: (analysis) => {
      toast.success(`Match score: ${analysis.match_score}%`);
      navigate(`/report/${analysis.id}`);
    },
    onError: (err) => {
      const detail = err instanceof ApiError ? (err.body as { detail?: unknown })?.detail : null;
      toast.error(typeof detail === "string" ? detail : "Paste at least 20 characters of a job description");
    },
  });

  const skillCount = user?.skills.length ?? 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
      <Card data-testid="jd-input-panel">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Paste a job description</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Role title</Label>
              <Input
                id="role"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Associate Software Developer"
                data-testid="role-title-input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company">Company (optional)</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Infosys"
                data-testid="company-input"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="jd">Job description / requirements</Label>
            <Textarea
              id="jd"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              rows={14}
              placeholder="Paste the requirements section here…"
              className="font-mono text-sm"
              data-testid="jd-textarea"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => analyze.mutate()}
              disabled={analyze.isPending || jdText.trim().length < 20}
              data-testid="analyze-button"
            >
              <Sparkles className="size-4" />
              {analyze.isPending ? "Analyzing…" : "Run gap analysis"}
            </Button>
            <span className="text-sm text-muted-foreground">
              Comparing against {skillCount} skills in your profile
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card data-testid="preset-panel">
          <CardHeader>
            <CardTitle className="font-heading text-lg">One-click sample jobs</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                className="justify-start"
                data-testid={`preset-${preset.role.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                onClick={() => {
                  setRoleTitle(preset.role);
                  setCompany(preset.company);
                  setJdText(preset.jd);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">How scoring works</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>Requirements are extracted with a 90+ skill dictionary and alias expansion.</p>
            <p>
              Each requirement is weighted by category — languages 30%, frameworks 25%, databases 15%, cloud
              &amp; DevOps 15%, architecture 8%, testing 4%, tooling 3%.
            </p>
            <p>An adjacent skill you already know counts as half a match (⚠️ partial).</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
