import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

export const meKey = ["auth", "me"] as const;

/** Session lives in an httpOnly cookie set by the backend; we only cache "who am I". */
export function useCurrentUser() {
  return useQuery<User>({
    queryKey: meKey,
    queryFn: () => apiGet<User>("/auth/me"),
    retry: false,
    staleTime: 30_000,
  });
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export async function endSession(qc: ReturnType<typeof useQueryClient>) {
  try {
    await apiPost("/auth/logout");
  } finally {
    qc.clear();
  }
}
