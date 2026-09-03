import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Wand2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost, apiPut, apiUpload, ApiError } from "@/lib/api";
import { meKey, useCurrentUser } from "@/lib/session";
import type { ResumeParseResult, SkillCatalog, User } from "@/lib/types";

export default function Profile() {
  const { data: user } = useCurrentUser();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [years, setYears] = useState("0");
  const [resume, setResume] = useState("");

  useEffect(() => {
    if (user) {
      setSelected(user.skills);
      setYears(String(user.experience_years ?? 0));
      setResume(user.resume_text ?? "");
    }
  }, [user]);

  const { data: catalog } = useQuery<SkillCatalog>({
    queryKey: ["skills", "catalog"],
    queryFn: () => apiGet<SkillCatalog>("/skills"),
    staleTime: Infinity,
  });

  const save = useMutation({
    mutationFn: () =>
      apiPut<User>("/auth/me", {
        skills: selected,
        experience_years: Number(years) || 0,
        resume_text: resume,
      }),
    onSuccess: (updated) => {
      qc.setQueryData(meKey, updated);
      qc.invalidateQueries({ queryKey: ["insights"] });
      qc.invalidateQueries({ queryKey: ["progress"] });
      qc.invalidateQueries({ queryKey: ["analyses"] });
      qc.invalidateQueries({ queryKey: ["analysis"] });
      toast.success("Skill profile saved");
    },
    onError: () => toast.error("Could not save your profile"),
  });

  const parse = useMutation({
    mutationFn: () => apiPost<ResumeParseResult>("/resume/parse", { resume_text: resume }),
    onSuccess: (result) => {
      const keys = result.skills.map((s) => s.key);
      setSelected((prev) => Array.from(new Set([...prev, ...keys])));
      toast.success(`Detected ${keys.length} skills from your resume`);
    },
    onError: () => toast.error("Could not parse that resume text"),
  });

  const upload = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return apiUpload<ResumeParseResult>("/resume/upload", form);
    },
    onSuccess: (result) => {
      const keys = result.skills.map((s) => s.key);
      setSelected((prev) => Array.from(new Set([...prev, ...keys])));
      if (result.resume_text) setResume(result.resume_text);
      toast.success(`Extracted ${keys.length} skills from your file`);
    },
    onError: (err) => {
      const detail = err instanceof ApiError ? (err.body as { detail?: unknown })?.detail : null;
      toast.error(typeof detail === "string" ? detail : "Could not read that file");
    },
  });

  function toggle(key: string) {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">My skill profile</h1>
        <p className="text-muted-foreground">
          Every analysis compares a job description against these skills.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card data-testid="resume-import-panel">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Import from resume</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="rounded-lg border border-dashed border-border p-4">
              <p className="text-sm font-medium">Upload a PDF resume</p>
              <p className="mb-3 text-xs text-muted-foreground">
                We read the text server-side and detect your skills automatically. Text-based PDFs and .txt
                files, up to 5 MB.
              </p>
              <input
                type="file"
                accept=".pdf,.txt,.md,application/pdf,text/plain"
                data-testid="resume-file-input"
                disabled={upload.isPending}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) upload.mutate(file);
                  e.target.value = "";
                }}
                className="w-full text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary-foreground"
              />
              {upload.isPending && (
                <p className="mt-2 text-xs text-muted-foreground" data-testid="resume-upload-status">
                  Reading your file…
                </p>
              )}
            </div>
            <Textarea
              rows={8}
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="…or paste your resume text here."
              className="font-mono text-sm"
              data-testid="resume-textarea"
            />
            <Button
              variant="outline"
              onClick={() => parse.mutate()}
              disabled={parse.isPending || resume.trim().length < 10}
              data-testid="parse-resume-button"
            >
              <Wand2 className="size-4" /> {parse.isPending ? "Scanning…" : "Extract skills from text"}
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="experience-panel">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Experience & summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="years">Years of experience</Label>
              <Input
                id="years"
                type="number"
                min="0"
                step="0.5"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                data-testid="experience-years-input"
              />
            </div>
            <p className="text-sm text-muted-foreground" data-testid="selected-skill-count">
              {selected.length} skills selected
            </p>
            <Button onClick={() => save.mutate()} disabled={save.isPending} data-testid="save-profile-button">
              <Save className="size-4" /> {save.isPending ? "Saving…" : "Save profile"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="skill-catalog-panel">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Pick your skills</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {!catalog && <p className="text-sm text-muted-foreground">Loading skill catalog…</p>}
          {catalog &&
            Object.entries(catalog.categories).map(([category, rows]) => (
              <div key={category}>
                <p className="mb-2 font-mono text-[11px] tracking-widest text-muted-foreground">
                  {(catalog.category_labels[category] ?? category).toUpperCase()}
                </p>
                <div className="flex flex-wrap gap-2">
                  {rows.map((row) => {
                    const active = selected.includes(row.key);
                    return (
                      <button
                        key={row.key}
                        type="button"
                        onClick={() => toggle(row.key)}
                        data-testid={`skill-pill-${row.key}`}
                        aria-pressed={active}
                        className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {row.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
