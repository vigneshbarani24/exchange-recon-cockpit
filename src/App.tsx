import { useState } from "react";
import { useAuth } from "./auth/useAuth";
import { LoginScreen } from "./components/LoginScreen";
import { Header } from "./components/Header";
import { ExceptionQueue } from "./components/ExceptionQueue";
import { VarianceDrawer } from "./components/VarianceDrawer";
import { ReconciliationView } from "./components/ReconciliationView";
import type { InstanceRow } from "./lib/exchange";

// The live tenant cockpit — reads running Maestro instances + the Action Center gate.
// Only mounts (and only triggers auth) when the operator chooses "Live tenant".
function LiveCockpit({ onCount }: { onCount: (n: number) => void }) {
  const { sdk, status } = useAuth();
  const [selected, setSelected] = useState<InstanceRow | null>(null);
  if (status !== "ready" || !sdk) return <LoginScreen />;
  return (
    <>
      <main className="mx-auto max-w-[1200px] px-6 py-6">
        <ExceptionQueue sdk={sdk} selectedId={selected?.id} onSelect={setSelected} onCount={onCount} />
      </main>
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelected(null)} />
          <VarianceDrawer
            sdk={sdk}
            instance={selected}
            onClose={() => setSelected(null)}
            onActed={() => setSelected(null)}
          />
        </>
      )}
    </>
  );
}

export default function App() {
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [count, setCount] = useState(0);

  const tab = (m: "demo" | "live", label: string) => (
    <button
      onClick={() => setMode(m)}
      className={`px-3 py-1.5 rounded border font-mono text-xs ${
        mode === m ? "border-teal text-tealb bg-node" : "border-line text-muted hover:text-ink"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen">
      <Header count={mode === "live" ? count : 0} />
      <div className="mx-auto max-w-[1100px] px-6 pt-4 flex gap-2">
        {tab("demo", "Reconciliation")}
        {tab("live", "Live tenant")}
      </div>
      {mode === "demo" ? <ReconciliationView /> : <LiveCockpit onCount={setCount} />}
    </div>
  );
}
