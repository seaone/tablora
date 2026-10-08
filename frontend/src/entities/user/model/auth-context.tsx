"use client";

import * as React from "react";
import type { AuthUser } from "@tablora/shared";
import { fetchCurrentUser, signOut as apiSignOut } from "@/shared/api";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthState | null>(null);

/** Loads the current user once on mount and exposes it plus sign-out to the tree. */
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    const current = await fetchCurrentUser();
    setUser(current);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = React.useCallback(async () => {
    await apiSignOut();
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({ user, loading, refresh, signOut }),
    [user, loading, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth(): AuthState {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
