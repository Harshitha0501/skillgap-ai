import { Navigate, useLocation } from "react-router-dom";
import Shell from "@/components/layout/Shell";
import { isUnauthorized, useCurrentUser } from "@/lib/session";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error } = useCurrentUser();
  const location = useLocation();

  if (isUnauthorized(error)) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return (
    <Shell>
      {isLoading && !data ? (
        <div className="h-40 animate-pulse rounded-xl border border-border bg-card" />
      ) : (
        children
      )}
    </Shell>
  );
}
