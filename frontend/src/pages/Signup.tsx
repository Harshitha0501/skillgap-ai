import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost, ApiError } from "@/lib/api";
import { meKey } from "@/lib/session";
import type { User } from "@/lib/types";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const qc = useQueryClient();
  const navigate = useNavigate();

  const signup = useMutation({
    mutationFn: () => apiPost<User>("/auth/signup", { name, email, password }),
    onSuccess: (user) => {
      qc.clear();
      qc.setQueryData(meKey, user);
      toast.success("Account created — add your skills next");
      navigate("/profile");
    },
    onError: (err) => {
      const detail = err instanceof ApiError ? (err.body as { detail?: string })?.detail : null;
      toast.error(typeof detail === "string" ? detail : "Could not create the account");
    },
  });

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-center gap-4 bg-secondary/40 p-12 lg:flex">
        <p className="font-mono text-xs tracking-[0.22em] text-primary">GET STARTED IN 3 STEPS</p>
        <ol className="flex flex-col gap-3 text-lg">
          <li>1. Paste your resume — we extract your skills automatically.</li>
          <li>2. Paste a job description — get your match score and gaps.</li>
          <li>3. Follow the roadmap and prep the generated questions.</li>
        </ol>
      </div>

      <div className="flex flex-col justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-sm">
          <h2 className="font-heading text-2xl font-bold tracking-tight">Create your account</h2>
          <form
            className="mt-8 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              signup.mutate();
            }}
            data-testid="signup-form"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                data-testid="signup-name-input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="signup-email-input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password (min 6 characters)</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                data-testid="signup-password-input"
              />
            </div>
            <Button type="submit" disabled={signup.isPending} data-testid="signup-submit-button">
              {signup.isPending ? "Creating…" : "Create account"}
            </Button>
          </form>
          <p className="mt-6 text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-primary" data-testid="signup-to-login-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
