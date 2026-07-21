// Runs board — every composed reconciliation run, rendered from the committed
// manifest (src/data/runsManifest.json, written by scripts/run_invoice_campaign.py).
// Offline by design: real data, zero network, cannot fail on stage.
import { useState } from "react";
import manifest from "../data/runsManifest.json";

type Step = {
  elementId: string;
  type: string;
  extension: string | null;
  status: string;
  jobKey: string | null;
  started?: string | null;
  completed?: string | null;
};

type RunRecord = {
  id: number;
  po: string;
  invoice: string;
  scenario: string;
  decision: string;
  expected: string;
  ending: string;
  instanceStatus: string | null;
  instanceId: string;
  agentJobs: Record<string, string | null>;
  startedUtc: string;
  finishedUtc: string;
  durationSec: number;
  steps: Step[];
};

const runsData = manifest as RunRecord[];

const ENDING_LABEL: Record<string, string> = {
  "auto-approved": "Auto-approved",
  "approved-corrected": "Approved → corrected",
  escalated: "Escalated to buyer",
};

const START_COMMAND =
  'python scripts/run_invoice_campaign.py --only <n>   # or: portal → Shared/ExchangeReconCanvas → ExchangeReconBpmn → Start';

function endingClass(ending: string): string {
  if (ending === "approved-corrected") return "rb-end corrected";
  if (ending === "auto-approved") return "rb-end auto";
  if (ending === "escalated") return "rb-end escalated";
  return "rb-end";
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function RunsBoard({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const campaign = runsData.filter((r) => r.id < 100);
  const proofs = runsData.filter((r) => r.id >= 100);
  const ordered = [...campaign, ...proofs];
  const agents = ordered.reduce((n, r) => n + Object.keys(r.agentJobs).length, 0);

  return (
    <section className="rboard">
      <style>{CSS}</style>
      <div className="rb-head">
        <div>
          <div className="k">Runs · composed Maestro instances</div>
          <h2 className="rb-h">
            {ordered.length} runs, <i>{agents}</i> real agent jobs, three endings.
          </h2>
          <p className="rb-sub">
            Each row is one governed reconciliation of a live SAP purchase order — started, gated,
            and finished in UiPath Maestro. Job keys are real Orchestrator jobs.
          </p>
        </div>
        <button className="rb-back" onClick={onBack}>↩ Board</button>
      </div>

      <div className="rb-trigger mono">{START_COMMAND}</div>

      <ul className="rb-list">
        {ordered.map((r) => (
          <li className="rb-row" key={r.id}>
            <button className="rb-line" onClick={() => setOpen(open === r.id ? null : r.id)}>
              <span className={endingClass(r.ending)}>{ENDING_LABEL[r.ending] ?? r.ending}</span>
              <span className="rb-po mono">PO {r.po}</span>
              <span className="rb-scenario">{r.scenario}</span>
              <span className="rb-jobs">
                {Object.entries(r.agentJobs).map(([name, key]) => (
                  <span className="rb-job mono" key={name} title={`${name}: ${key ?? ""}`}>
                    {(key ?? "").slice(0, 8)}
                  </span>
                ))}
              </span>
              <span className="rb-meta">
                <b>{r.durationSec}s</b>
                <span>{fmtTime(r.startedUtc)}</span>
              </span>
            </button>
            {open === r.id && (
              <div className="rb-detail">
                <div className="rb-detail-row">
                  <span className="k">Invoice</span> {r.invoice} · decision: {r.decision} ·
                  instance <span className="mono">{r.instanceId.slice(0, 8)}</span>
                </div>
                {r.steps.length > 0 ? (
                  <ol className="rb-steps">
                    {r.steps.map((s) => (
                      <li key={s.elementId}>
                        <span className={`rb-sdot ${s.status.toLowerCase()}`} />
                        <span className="rb-sname">{s.elementId}</span>
                        <span className="rb-stype">{s.extension ?? s.type}</span>
                        {s.jobKey && <span className="rb-sjob mono">{s.jobKey.slice(0, 8)}</span>}
                        <span className="rb-sstat">{s.status}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="rb-detail-row">
                    Full element trace in <span className="mono">finale/maestro/</span> — this proof
                    run predates step capture.
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

const CSS = `
.rboard{animation:osrise .5s cubic-bezier(.215,.61,.355,1) both}
.rb-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:14px}
.rb-h{font-size:clamp(22px,3vw,32px);font-weight:600;letter-spacing:-.025em;margin:6px 0 6px}
.rb-h i{color:var(--accent-ink)}
.rb-sub{font-size:14.5px;color:#3a3d42;max-width:640px}
.rb-back{font-size:13px;color:var(--muted);background:#fff;border:1px solid var(--line);border-radius:999px;
  padding:8px 14px;cursor:pointer;font-family:inherit;white-space:nowrap}
.rb-back:hover{color:var(--ink);border-color:#cfccc7}
.rb-trigger{font-size:11.5px;color:var(--muted);background:#f6f4f1;border:1px dashed var(--line);border-radius:10px;
  padding:9px 12px;margin-bottom:16px;overflow-x:auto;white-space:nowrap}
.rb-list{list-style:none;display:flex;flex-direction:column;gap:10px}
.rb-row{background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden}
.rb-line{display:grid;grid-template-columns:158px 130px 1fr auto auto;align-items:center;gap:14px;width:100%;
  padding:14px 18px;background:none;border:0;cursor:pointer;font-family:inherit;text-align:left;font-size:14px}
.rb-line:hover{background:#faf8f5}
.rb-end{font-family:ui-monospace,monospace;font-size:10px;text-transform:uppercase;letter-spacing:.08em;
  border-radius:6px;padding:5px 8px;text-align:center;white-space:nowrap}
.rb-end.corrected{background:#eaf6ef;color:#1b7f4c}
.rb-end.auto{background:#f2f0ec;color:#5a5d62}
.rb-end.escalated{background:#fff1ea;color:var(--accent-ink)}
.rb-po{font-size:12.5px;color:var(--ink);font-weight:600}
.rb-scenario{color:#3a3d42;font-size:13.5px;line-height:1.35}
.rb-jobs{display:flex;gap:6px}
.rb-job{font-size:10.5px;color:var(--muted);border:1px solid var(--line);border-radius:6px;padding:3px 6px}
.rb-meta{display:flex;flex-direction:column;align-items:flex-end;gap:2px;font-size:12px;color:var(--muted)}
.rb-meta b{color:var(--ink);font-weight:600}
.rb-detail{border-top:1px solid var(--line);padding:12px 18px;background:#fcfbf9}
.rb-detail-row{font-size:13px;color:#3a3d42;margin-bottom:8px}
.rb-steps{list-style:none;display:flex;flex-direction:column;gap:4px}
.rb-steps li{display:flex;align-items:center;gap:10px;font-size:12.5px;padding:4px 0}
.rb-sdot{width:7px;height:7px;border-radius:999px;background:var(--line);flex:none}
.rb-sdot.completed{background:#1b7f4c}
.rb-sdot.terminated{background:#c9c6c1}
.rb-sdot.faulted{background:#c2410c}
.rb-sname{font-weight:600;min-width:170px}
.rb-stype{color:var(--muted);flex:1}
.rb-sjob{color:var(--accent-ink);font-size:11px}
.rb-sstat{color:var(--muted);font-size:11px}
@media(max-width:920px){.rb-line{grid-template-columns:1fr auto;grid-auto-flow:row}}
`;
