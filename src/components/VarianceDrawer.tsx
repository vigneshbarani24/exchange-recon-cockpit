import { useEffect, useState } from "react";
import type { UiPath } from "@uipath/uipath-typescript/core";
import {
  getInstanceVariables,
  findOpenTaskForInstance,
  decideGate,
  type InstanceRow,
  type GateDecision,
} from "../lib/exchange";
import { fmt, timeOpen } from "../lib/format";

type Var = { name?: string; value?: unknown };

export function VarianceDrawer({
  sdk,
  instance,
  onClose,
  onActed,
}: {
  sdk: UiPath;
  instance: InstanceRow;
  onClose: () => void;
  onActed: () => void;
}) {
  const [vars, setVars] = useState<Var[]>([]);
  const [taskId, setTaskId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>();

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [v, task] = await Promise.all([
          getInstanceVariables(sdk, instance.id),
          findOpenTaskForInstance(sdk, instance.id),
        ]);
        if (!live) return;
        setVars(v as Var[]);
        const id = task ? Number((task as Record<string, unknown>).id) : null;
        setTaskId(Number.isFinite(id) ? id : null);
      } catch (e) {
        if (live) setMsg(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      live = false;
    };
  }, [sdk, instance.id]);

  async function decide(decision: GateDecision) {
    if (taskId == null) {
      setMsg("No open human-gate task is linked to this instance.");
      return;
    }
    setBusy(true);
    setMsg(undefined);
    try {
      await decideGate(sdk, taskId, decision, note);
      setMsg(`${decision} submitted.`);
      onActed();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  // Pull a few headline fields the variance agent is expected to write.
  const pick = (k: string) => vars.find((v) => (v.name || "").toLowerCase().includes(k))?.value;
  const variance = pick("variance");
  const confidence = pick("confidence");
  const proposal = pick("proposal") ?? pick("correction");

  return (
    <aside className="fixed inset-y-0 right-0 w-[420px] max-w-[92vw] bg-canvas2 border-l border-teal overflow-y-auto z-50 shadow-2xl">
      <div className="sticky top-0 bg-canvas2 border-b border-line px-6 py-4 flex items-start justify-between">
        <div>
          <div className="font-mono text-[0.65rem] tracking-[0.16em] uppercase text-tealb">Variance review</div>
          <h3 className="font-disp font-bold text-lg mt-1 break-all">{instance.id}</h3>
          <div className="font-mono text-xs text-muted mt-1">{instance.status}</div>
        </div>
        <button onClick={onClose} className="text-muted hover:text-ink text-xl leading-none">&times;</button>
      </div>

      <div className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Variance" value={fmt(variance)} tone="amber" />
          <Stat label="Agent confidence" value={fmt(confidence)} tone="teal" />
          <Stat label="Time open" value={timeOpen(instance.startedAt)} tone="ink" />
        </div>

        <div className="rounded-lg border border-line p-4">
          <div className="font-mono text-[0.65rem] uppercase tracking-wide text-muted mb-2">Agent proposal</div>
          <div className="text-sm leading-relaxed">{fmt(proposal) || "No proposal field on this instance."}</div>
        </div>

        <details className="rounded-lg border border-line p-4">
          <summary className="cursor-pointer font-mono text-[0.65rem] uppercase tracking-wide text-muted">
            All variables ({vars.length})
          </summary>
          <ul className="mt-3 space-y-2">
            {vars.map((v, i) => (
              <li key={i} className="text-xs">
                <span className="text-muted">{v.name}: </span>
                <span className="break-words">{fmt(v.value)}</span>
              </li>
            ))}
          </ul>
        </details>

        <div className="rounded-lg border border-amber/40 bg-amber/5 p-4">
          <div className="font-mono text-[0.65rem] uppercase tracking-wide text-amberb mb-2">Human gate</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reviewer note (optional)"
            className="w-full rounded-md bg-canvas border border-line p-2 text-sm outline-none focus:border-teal"
            rows={2}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => void decide("Approve")}
              disabled={busy}
              className="flex-1 rounded-lg bg-green py-2 text-sm font-semibold text-[#06121a] hover:bg-greenb disabled:opacity-60"
            >
              Approve correction
            </button>
            <button
              onClick={() => void decide("Escalate")}
              disabled={busy}
              className="flex-1 rounded-lg border border-danger text-danger py-2 text-sm font-semibold hover:bg-danger/10 disabled:opacity-60"
            >
              Escalate to desk
            </button>
          </div>
          {taskId == null && (
            <p className="mt-2 font-mono text-[0.65rem] text-muted">No linked open task found for this instance.</p>
          )}
          {msg && <p className="mt-2 font-mono text-xs text-tealb break-words">{msg}</p>}
        </div>
      </div>
    </aside>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "amber" | "teal" | "ink" }) {
  const c = tone === "amber" ? "text-amberb" : tone === "teal" ? "text-tealb" : "text-ink";
  return (
    <div className="rounded-lg border border-line p-3">
      <div className="font-mono text-[0.6rem] uppercase tracking-wide text-muted">{label}</div>
      <div className={`mt-1 font-disp font-semibold ${c}`}>{value || "—"}</div>
    </div>
  );
}

