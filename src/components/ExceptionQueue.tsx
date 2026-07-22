import { useEffect, useState, useCallback } from "react";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { config } from "../lib/config";
import { listExchangeInstances, needsAttention, type InstanceRow } from "../lib/exchange";
import { sendGateDecision, type GateDecision } from "../lib/gate";

function statusTone(status = ""): string {
  const s = status.toLowerCase();
  if (s.includes("fault")) return "text-danger border-danger/40";
  if (s.includes("pause") || s.includes("pending")) return "text-amberb border-amber/40";
  if (s.includes("complete") || s.includes("success")) return "text-greenb border-green/40";
  return "text-muted border-line";
}

export function ExceptionQueue({
  sdk,
  selectedId,
  onSelect,
  onCount,
}: {
  sdk: UiPath;
  selectedId?: string;
  onSelect: (r: InstanceRow) => void;
  onCount: (n: number) => void;
}) {
  const [rows, setRows] = useState<InstanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>();
  const [gatePo, setGatePo] = useState("4500000021");
  const [gateNote, setGateNote] = useState("Accept the proposed correction.");
  const [gateBusy, setGateBusy] = useState<GateDecision | null>(null);
  const [gateMsg, setGateMsg] = useState<string>();

  const decide = useCallback(
    async (decision: GateDecision) => {
      setGateBusy(decision);
      setGateMsg(undefined);
      try {
        const res = await sendGateDecision(sdk, {
          decision,
          purchaseOrder: gatePo.trim(),
          note: gateNote.trim(),
        });
        setGateMsg(`${decision === "approve" ? "Approved" : "Escalated"} · message ${res.id.slice(0, 8)}`);
      } catch (e) {
        setGateMsg(e instanceof Error ? e.message : String(e));
      } finally {
        setGateBusy(null);
      }
    },
    [sdk, gatePo, gateNote],
  );

  const refresh = useCallback(async () => {
    try {
      const all = await listExchangeInstances(sdk);
      setRows(all);
      onCount(all.filter(needsAttention).length);
      setErr(undefined);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [sdk, onCount]);

  useEffect(() => {
    void refresh();
    const t = setInterval(() => void refresh(), config.pollMs);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <div className="rounded-xl border border-line bg-canvas2 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-line">
        <span className="font-disp font-semibold">Instances</span>
        <button onClick={() => void refresh()} className="font-mono text-[0.7rem] text-muted hover:text-ink">
          refresh
        </button>
      </div>

      {loading && <div className="px-5 py-6 text-muted text-sm">Loading live instances…</div>}
      {err && <div className="px-5 py-6 font-mono text-xs text-danger break-words">{err}</div>}
      {!loading && !err && rows.length === 0 && (
        <div className="px-5 py-6 text-muted text-sm">
          No Exchange instances yet. Start one in Maestro to see it here.
        </div>
      )}

      <div className="px-5 py-4 border-b border-line bg-node/40">
        <div className="font-mono text-[0.65rem] uppercase tracking-wide text-muted mb-2">
          Human gate — the decision is a governed message
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={gatePo}
            onChange={(e) => setGatePo(e.target.value)}
            placeholder="Purchase order"
            className="w-36 bg-canvas2 border border-line rounded px-2 py-1.5 font-mono text-xs"
            aria-label="Purchase order reference"
          />
          <input
            value={gateNote}
            onChange={(e) => setGateNote(e.target.value)}
            placeholder="Reviewer note (goes to the audit trail)"
            className="flex-1 min-w-[180px] bg-canvas2 border border-line rounded px-2 py-1.5 text-xs"
            aria-label="Reviewer note"
          />
          <button
            onClick={() => void decide("approve")}
            disabled={gateBusy !== null || !gatePo.trim()}
            className="px-3 py-1.5 rounded border border-green/40 text-greenb font-mono text-xs uppercase tracking-wide hover:bg-green/10 disabled:opacity-40"
          >
            {gateBusy === "approve" ? "Sending…" : "Approve"}
          </button>
          <button
            onClick={() => void decide("escalate")}
            disabled={gateBusy !== null || !gatePo.trim()}
            className="px-3 py-1.5 rounded border border-amber/40 text-amberb font-mono text-xs uppercase tracking-wide hover:bg-amber/10 disabled:opacity-40"
          >
            {gateBusy === "escalate" ? "Sending…" : "Escalate"}
          </button>
        </div>
        {gateMsg && <div className="mt-2 font-mono text-[0.7rem] text-muted break-words">{gateMsg}</div>}
      </div>

      <ul className="divide-y divide-line">
        {rows.map((r) => (
          <li key={r.id}>
            <button
              onClick={() => onSelect(r)}
              className={`w-full text-left px-5 py-3 hover:bg-node transition flex items-center justify-between gap-3 ${
                selectedId === r.id ? "bg-node2" : ""
              }`}
            >
              <div className="min-w-0">
                <div className="font-mono text-xs text-muted truncate">{r.id || "—"}</div>
                <div className="text-sm truncate">{r.displayName}</div>
              </div>
              <span className={`shrink-0 font-mono text-[0.65rem] uppercase tracking-wide px-2 py-1 rounded border ${statusTone(r.status)}`}>
                {r.status || "unknown"}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
