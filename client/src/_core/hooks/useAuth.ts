import { trpc } from "@/lib/trpc";
import { useCallback, useMemo } from "react";

/**
 * @hook useAuth
 * @description Local authentication using localStorage + tRPC
 * @security-note Token stored in localStorage, cleared on logout
 * @modified 2026-06-13 - Removed OAuth dependency, using local JWT
 */
export function useAuth() {
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      localStorage.removeItem("nour-ai-token");
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    localStorage.removeItem("nour-ai-token");
    await logoutMutation.mutateAsync();
    window.location.href = "/login";
  }, [logoutMutation]);

  const state = useMemo(() => {
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
