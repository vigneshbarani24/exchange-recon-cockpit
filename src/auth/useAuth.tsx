import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { ensureAuth } from "../lib/sdk";

type AuthState = {
  sdk: UiPath | null;
  status: "idle" | "authenticating" | "ready" | "error";
  error?: string;
  login: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sdk, setSdk] = useState<UiPath | null>(null);
  const [status, setStatus] = useState<AuthState["status"]>("idle");
  const [error, setError] = useState<string>();

  async function login() {
    setStatus("authenticating");
    setError(undefined);
    try {
      // For OAuth, initialize() runs the PKCE redirect handshake. If a redirect
      // is in flight the browser navigates away and returns here; calling again
      // on return completes it.
      const ready = await ensureAuth();
      setSdk(ready);
      setStatus("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  }

  // On load, attempt to complete a redirect (no-op if there's nothing pending).
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("code") || url.searchParams.has("state")) {
      void login();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Ctx.Provider value={{ sdk, status, error, login }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
}
