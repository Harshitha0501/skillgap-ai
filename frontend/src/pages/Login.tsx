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

export default function Login() {
  const [email, setEmail] = useState("demo@skillgap.ai");
  const [password, setPassword] = useState("demo1234");
  const qc = useQueryClient();
  const navigate = useNavigate();

  const login = useMutation({
    mutationFn: () => apiPost<User>("/auth/login", { email, password }),
    onSuccess: (user) => {
      qc.clear();
      qc.setQueryData(meKey, user);
      toast.success(`Welcome back, ${user.name}`);
      navigate("/analyze");
    },
    onError: (err) => {
      const detail = err instanceof ApiError ? (err.body as { detail?: string })?.detail : null;
      toast.error(detail ?? "Could not sign in");
    },
  });

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-center gap-4 bg-secondary/40 p-12 lg:flex">
        <p className="font-mono text-xs tracking-[0.22em] text-primary">SKILLGAP AI</p>
        <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tight">
          Know your gap before the recruiter does.
        </h1>
        <p className="max-w-md text-muted-foreground">
          Match score, missing skills, a prioritised learning roadmap and a tiered interview vault — from a
          single pasted job description.
        </p>
      </div>

      <div className="flex flex-col justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-sm">
          <h2 className="font-heading text-2xl font-bold tracking-tight">Sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Demo account is pre-filled — just press the button.
          </p>
          <form
            className="mt-8 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              login.mutate();
            }}
            data-testid="login-form"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="login-email-input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="login-password-input"
              />
            </div>
            <Button type="submit" disabled={login.isPending} data-testid="login-submit-button">
              {login.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-sm text-muted-foreground">
            No account?{" "}
            <Link to="/signup" className="font-semibold text-primary" data-testid="login-to-signup-link">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
