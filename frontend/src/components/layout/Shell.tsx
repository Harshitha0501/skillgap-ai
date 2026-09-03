import { Link, NavLink, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Moon, Sun, LogOut, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser, endSession } from "@/lib/session";
import { useTheme } from "@/lib/useTheme";

const NAV = [
  { label: "Analyze JD", to: "/analyze", testId: "nav-analyze-link" },
  { label: "My Skills", to: "/profile", testId: "nav-profile-link" },
  { label: "Why Not Shortlisted?", to: "/insights", testId: "nav-insights-link" },
  { label: "Progress", to: "/progress", testId: "nav-progress-link" },
  { label: "Applications", to: "/applications", testId: "nav-applications-link" },
  { label: "Compare Jobs", to: "/compare", testId: "nav-compare-link" },
  { label: "History", to: "/history", testId: "nav-history-link" },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const { data: user } = useCurrentUser();
  const { theme, toggle } = useTheme();
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function logout() {
    await endSession(qc);
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="no-print sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
          <Link to="/" className="flex items-center gap-2" data-testid="brand-home-link">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Radar className="size-4" />
            </span>
            <span className="font-heading text-lg font-extrabold tracking-tight">
              SkillGap<span className="text-primary">AI</span>
            </span>
          </Link>
          <nav className="flex flex-1 flex-wrap items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                data-testid={item.testId}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggle}
              aria-label="Toggle theme"
              data-testid="theme-toggle-button"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            {user ? (
              <>
                <span
                  className="hidden text-sm text-muted-foreground sm:inline"
                  data-testid="current-user-name"
                >
                  {user.name}
                </span>
                <Button variant="outline" size="sm" onClick={logout} data-testid="logout-button">
                  <LogOut className="size-3.5" /> Sign out
                </Button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-primary"
                data-testid="header-login-link"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">{children}</main>
    </div>
  );
}
