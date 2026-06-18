import { useState } from "react";
import { useAuth } from "./auth/useAuth";
import { LoginScreen } from "./components/LoginScreen";
import { Header } from "./components/Header";
import { ExceptionQueue } from "./components/ExceptionQueue";
import { VarianceDrawer } from "./components/VarianceDrawer";
import type { InstanceRow } from "./lib/exchange";

export default function App() {
  const { sdk, status } = useAuth();
  const [selected, setSelected] = useState<InstanceRow | null>(null);
  const [count, setCount] = useState(0);

  if (status !== "ready" || !sdk) return <LoginScreen />;

  return (
    <div className="min-h-screen">
      <Header count={count} />
      <main className="mx-auto max-w-[1200px] px-6 py-6">
        <ExceptionQueue
          sdk={sdk}
          selectedId={selected?.id}
          onSelect={setSelected}
          onCount={setCount}
        />
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
    </div>
  );
}
