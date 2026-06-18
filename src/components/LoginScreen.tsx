import { useAuth } from "../auth/useAuth";

export function LoginScreen() {
  const { login, status, error } = useAuth();
  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-line bg-canvas2 p-8">
        <div className="flex items-center gap-2 font-disp font-bold text-lg">
          <span className="inline-block h-2.5 w-2.5 rotate-45 rounded-[2px] bg-tealb" />
          Exchange Recon · Ops Cockpit
        </div>
        <p className="mt-3 text-muted text-sm leading-relaxed">
          Live triage for the Maestro Exchange Settlement Reconciliation process.
          Review the agent&apos;s variance proposals and clear the human gate.
        </p>
        <button
          onClick={() => void login()}
          disabled={status === "authenticating"}
          className="mt-6 w-full rounded-xl bg-teal py-3 font-semibold text-[#06121a] transition hover:bg-tealb disabled:opacity-60"
        >
          {status === "authenticating" ? "Connecting…" : "Sign in with UiPath"}
        </button>
        {error && (
          <p className="mt-4 font-mono text-xs text-danger break-words">{error}</p>
        )}
      </div>
    </div>
  );
}
