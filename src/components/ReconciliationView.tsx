import { useState } from "react";
import { reconCase, agentPipeline, type ReconLine } from "../lib/reconDemo";

function catTone(category: string): string {
  if (category === "none") return "text-greenb border-green/40";
  if (category.includes("price")) return "text-amberb border-amber/40";
  return "text-tealb border-teal/40";
}

function AgentPipeline() {
  return (
    <div className="flex items-stretch gap-2 flex-wrap">
      {agentPipeline.map((a, i) => (
        <div key={a.name} className="flex items-center gap-2">
          <div className="rounded-lg border border-teal/40 bg-node px-3 py-2 max-w-[260px]">
            <div className="font-mono text-[0.7rem] text-tealb">{a.name}</div>
            <div className="text-xs text-muted mt-0.5 leading-snug">{a.role}</div>
          </div>
          {i < agentPipeline.length - 1 && <span className="text-muted">→</span>}
        </div>
      ))}
    </div>
  );
}

export function ReconciliationView() {
  const c = reconCase;
  const [open, setOpen] = useState<ReconLine | null>(c.lines.find((l) => l.category !== "none") ?? null);
  const [decision, setDecision] = useState<"none" | "approved" | "escalated">("none");

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-6 space-y-6">
      {/* Case header */}
      <div className="rounded-xl border border-line bg-canvas2 p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-[0.65rem] tracking-[0.16em] uppercase text-tealb">
              Procure-to-pay reconciliation
            </div>
            <h1 className="font-disp font-bold text-2xl mt-1">
              PO {c.purchaseOrder} · supplier invoice {c.invoice}
            </h1>
            <div className="font-mono text-xs text-muted mt-1">
              company {c.companyCode} · supplier {c.supplier} · {c.currency}
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-[0.6rem] uppercase tracking-wide px-2 py-1 rounded border border-green/40 text-greenb">
              live S/4 · via MCP
            </span>
            <div className="font-mono text-[0.65rem] text-muted mt-2 max-w-[280px]">{c.source}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Stat label="Status" value={c.overallStatus} tone="amber" />
          <Stat label="Agent confidence" value={c.confidence.toFixed(2)} tone="teal" />
          <Stat label="Lines" value={`${c.lines.length} matched`} tone="ink" />
        </div>
      </div>

      {/* Agent pipeline */}
      <div className="rounded-xl border border-line bg-canvas2 p-5">
        <div className="font-mono text-[0.65rem] uppercase tracking-wide text-muted mb-3">
          Three governed agents · Maestro orchestrated · read-only on SAP
        </div>
        <AgentPipeline />
      </div>

      {/* Reconciliation table */}
      <div className="rounded-xl border border-line bg-canvas2 overflow-hidden">
        <div className="px-5 py-3 border-b border-line font-disp font-semibold">
          Line reconciliation · PO (S/4) vs supplier invoice
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted font-mono text-[0.65rem] uppercase tracking-wide">
                <th className="text-left px-5 py-2 font-normal">Item · material</th>
                <th className="text-right px-3 py-2 font-normal">PO qty</th>
                <th className="text-right px-3 py-2 font-normal">PO price</th>
                <th className="text-right px-3 py-2 font-normal">Inv qty</th>
                <th className="text-right px-3 py-2 font-normal">Inv price</th>
                <th className="text-left px-5 py-2 font-normal">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {c.lines.map((l) => (
                <tr
                  key={l.item}
                  onClick={() => setOpen(l)}
                  className={`border-t border-line cursor-pointer hover:bg-node ${open?.item === l.item ? "bg-node2" : ""}`}
                >
                  <td className="px-5 py-3">
                    <div className="font-mono text-xs text-muted">{l.item} · {l.material}</div>
                    <div className="text-sm">{l.description}</div>
                  </td>
                  <td className="text-right px-3 py-3 font-mono">{l.poQty}</td>
                  <td className="text-right px-3 py-3 font-mono">{l.poPrice}</td>
                  <td className="text-right px-3 py-3 font-mono">{l.supplierQty}</td>
                  <td className="text-right px-3 py-3 font-mono">{l.supplierPrice}</td>
                  <td className="px-5 py-3">
                    <span className={`font-mono text-[0.6rem] uppercase tracking-wide px-2 py-1 rounded border ${catTone(l.category)}`}>
                      {l.category}{l.category !== "none" ? ` ${l.varianceAmount}` : ""}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected line detail + the human gate */}
      {open && (
        <div className="rounded-xl border border-line bg-canvas2 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-disp font-semibold">
              Item {open.item} · {open.material}
            </div>
            <span className={`font-mono text-[0.6rem] uppercase tracking-wide px-2 py-1 rounded border ${catTone(open.category)}`}>
              {open.category}
            </span>
          </div>
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-wide text-muted mb-1">Variance agent · explanation</div>
            <div className="text-sm leading-relaxed">{open.explanation}</div>
          </div>
          <div className="rounded-lg border border-line p-4">
            <div className="font-mono text-[0.65rem] uppercase tracking-wide text-muted mb-1">Proposed correction</div>
            <div className="text-sm leading-relaxed">{open.proposal}</div>
          </div>

          {/* Human gate */}
          <div className="border-t border-line pt-4">
            <div className="font-mono text-[0.65rem] uppercase tracking-wide text-muted mb-2">Human gate · buyer authority</div>
            {decision === "none" && (
              <div className="flex gap-3">
                <button
                  onClick={() => setDecision("approved")}
                  className="px-4 py-2 rounded-lg border border-green/50 text-greenb hover:bg-green/10 font-mono text-sm"
                >
                  Approve correction
                </button>
                <button
                  onClick={() => setDecision("escalated")}
                  className="px-4 py-2 rounded-lg border border-line text-muted hover:text-ink hover:bg-node font-mono text-sm"
                >
                  Escalate to buyer
                </button>
              </div>
            )}

            {decision === "approved" && (
              <div className="rounded-lg border border-green/40 bg-green/5 p-4">
                <div className="font-mono text-[0.65rem] uppercase tracking-wide text-greenb mb-2">
                  Approved · posting-prep agent prepared the S/4 update
                </div>
                <div className="font-mono text-sm">
                  {c.prepared.entity}({c.prepared.purchaseOrder}/{c.prepared.poItem}) ·{" "}
                  <span className="text-tealb">{c.prepared.field}</span>{" "}
                  {c.prepared.currentValue} <span className="text-muted">→</span>{" "}
                  <span className="text-greenb">{c.prepared.newValue}</span>
                </div>
                <div className="text-xs text-muted mt-2">{c.prepared.summary}</div>
                <div className="text-[0.7rem] text-amberb mt-2 font-mono">
                  armed, not fired — the deterministic write executes only on this approval; agents never post.
                </div>
              </div>
            )}

            {decision === "escalated" && (
              <div className="rounded-lg border border-line p-4 text-sm text-muted">
                Escalated to the buyer. No correction posted; the case stays open.
              </div>
            )}

            {decision !== "none" && (
              <button
                onClick={() => setDecision("none")}
                className="mt-3 font-mono text-[0.7rem] text-muted hover:text-ink"
              >
                reset
              </button>
            )}
          </div>
        </div>
      )}

      <div className="text-center font-mono text-[0.65rem] text-muted">
        agents read S/4 (read-only) · a human approves · a deterministic step posts the correction
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "amber" | "teal" | "ink" }) {
  const toneCls = tone === "amber" ? "text-amberb" : tone === "teal" ? "text-tealb" : "text-ink";
  return (
    <div className="rounded-lg border border-line p-3">
      <div className="font-mono text-[0.6rem] uppercase tracking-wide text-muted">{label}</div>
      <div className={`font-disp font-semibold mt-1 ${toneCls}`}>{value}</div>
    </div>
  );
}
