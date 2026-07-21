// The governed back office, operating — a Bizdex/VB-identity operating surface for the
// P2P reconciliation. Phase 1: renders entirely from the captured real reconciliation
// (src/lib/reconDemo.ts) — zero network, always renders. The live-run panel is Phase 2.
import { useState } from "react";
import { reconCase, agentPipeline } from "../lib/reconDemo";
import { RunsBoard } from "./RunsBoard";

// Deep links to the real systems. The Orchestrator folder is where the 3 agent jobs ran.
// SAP_PORTAL opens "Manage Purchase Orders" — search PO 4500000021 to show the two lines
// (RM27 Packaging Box, RM16) the variance agent read live over MCP.
const UIPATH_PORTAL =
  "https://staging.uipath.com/hackathon26_751/DefaultTenant/orchestrator_/?tid=743053&fid=3093256";
const SAP_PORTAL = "https://my405139.s4hana.cloud.sap/ui#PurchaseOrder-manage";

// The three agents' real Orchestrator jobs (all Successful, Shared/ExchangeReconDemo).
const runs = [
  { name: "matching-agent", role: "aligns the supplier invoice to the live PO lines (MCP → S/4)", job: "750a5c3e", secs: 52 },
  { name: "variance-agent", role: "classifies each discrepancy, scores confidence, proposes a fix", job: "c51ac7fa", secs: 64 },
  { name: "posting-prep-agent", role: "turns the approved fix into the S/4 update payload", job: "d7b8891e", secs: 52 },
];

const line10 = reconCase.lines[0];
const line20 = reconCase.lines[1];

export function OperatingSurface({ onExit }: { onExit?: () => void }) {
  const [showRuns, setShowRuns] = useState(false);
  return (
    <div className="osurf">
      <style>{CSS}</style>

      <header className="os-header">
        <div className="os-brand">
          <span className="os-wordmark">Exchange&nbsp;Recon</span>
          <nav className="os-nav">
            <a className={`on ${showRuns ? "" : "active"}`} onClick={() => setShowRuns(false)}>Home</a>
            <a className={`on ${showRuns ? "active" : ""}`} onClick={() => setShowRuns(true)}>Runs</a>
            <a className="on">Brain</a>
            <a className="on">Audit</a>
          </nav>
        </div>
        <div className="os-headright">
          <span className="os-date">Governed P2P · live SAP</span>
          {onExit && <button className="os-exit" onClick={onExit}>Classic cockpit ↩</button>}
          <span className="os-avatar">VB</span>
        </div>
      </header>

      <main className="os-main">
        <div className="k">Your operating surface</div>
        <h1 className="os-h1">
          The back office, <i>governed</i>.
        </h1>
        <p className="os-status">
          Three agents ran against live SAP. One caught a variance and is{" "}
          <b className="accent">waiting for your sign-off</b>.
        </p>

        <div className="os-cmd">
          <span className="os-cmd-prompt">›</span>
          <span className="os-cmd-ph">Ask the back office, or run a reconciliation…</span>
          <kbd className="os-kbd">⌘K</kbd>
          <button className="os-cmd-go" aria-label="run">↑</button>
        </div>

        <div className="os-actions">
          <button className="chip chip-accent" onClick={() => setShowRuns(true)}>＋ Run another invoice</button>
          <a className="chip" href={UIPATH_PORTAL} target="_blank" rel="noreferrer">Open in UiPath Orchestrator ↗</a>
          <a className="chip" href={SAP_PORTAL} target="_blank" rel="noreferrer">Open in SAP S/4HANA ↗</a>
        </div>

        {showRuns ? (
          <RunsBoard onBack={() => setShowRuns(false)} />
        ) : (
        <div className="os-grid">
          {/* HERO — sign-off (cols 1-2, rows 1-2) */}
          <section className="card hero">
            <div className="card-head">
              <span className="k">Needs your sign-off</span>
              <span className="badge">Approval</span>
            </div>
            <h2 className="hero-h">
              PO {reconCase.purchaseOrder} was <i>over-delivered</i> and <i>overpriced</i>.
            </h2>
            <p className="hero-p">
              The variance agent read the live purchase order from S/4HANA over MCP, matched it to
              supplier invoice {reconCase.invoice}, classified the discrepancies — and paused
              instead of paying.
            </p>

            <div className="hero-lines">
              <div className="hl">
                <div className="hl-tag price">price-variance</div>
                <div className="hl-body">
                  <b>Item {line10.item} · {line10.material}</b> — {line10.poPrice} → {line10.supplierPrice}{" "}
                  {reconCase.currency}/ea <span className="hl-delta">{line10.varianceAmount}</span>
                </div>
              </div>
              <div className="hl">
                <div className="hl-tag qty">over-delivery</div>
                <div className="hl-body">
                  <b>Item {line20.item} · {line20.material}</b> — {line20.poQty} ordered, {line20.supplierQty} delivered{" "}
                  <span className="hl-delta">{line20.varianceAmount}</span>
                </div>
              </div>
            </div>

            <div className="hero-prepared">
              <span className="pk">Prepared, held</span>
              {reconCase.prepared.summary}
            </div>

            <div className="hero-actions">
              <button className="btn-dark">● Approve &amp; record</button>
              <button className="btn-line">Reject</button>
              <a className="link" href={UIPATH_PORTAL} target="_blank" rel="noreferrer">See the full run →</a>
            </div>
          </section>

          {/* YOUR RUNS — with real job proof (cols 3-4, row 1) */}
          <section className="card runs">
            <div className="card-head">
              <span className="k">Agent runs · proven live</span>
              <a className="hint link-hint" href={UIPATH_PORTAL} target="_blank" rel="noreferrer">Orchestrator ↗</a>
            </div>
            <ul className="run-list">
              {runs.map((a, i) => (
                <li className="run" key={a.name}>
                  <span className={`dot ${i === 1 ? "on" : "pass"}`} />
                  <div className="run-body">
                    <div className="run-name">{a.name}</div>
                    <div className="run-role">{a.role}</div>
                  </div>
                  <div className="run-meta">
                    <span className="run-ok">✓ {a.secs}s</span>
                    <span className="run-job mono">{a.job}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* LIVE PROOF (col 3, row 2) */}
          <section className="card proof">
            <div className="card-head">
              <span className="k">The live tell</span>
              <span className="live">● live</span>
            </div>
            <p className="proof-p">
              Handed only the supplier’s numbers, the agent returned the <b>PO side</b> —{" "}
              <span className="mono">£{line10.poPrice}</span>, qty <span className="mono">{line20.poQty.replace(" PC", "")}</span> — which it
              could only read from S/4 at runtime.
            </p>
            <div className="proof-src">{reconCase.source}</div>
          </section>

          {/* TODAY (inverted) (col 4, row 2) */}
          <section className="card today">
            <div className="k klight">Today</div>
            <div className="today-num">3<span> agents ran</span></div>
            <div className="today-sub"><b>1</b> exception caught · <b>0</b> auto-posts</div>
          </section>

          {/* GOVERNANCE MEMORY (cols 1-2, row 3) */}
          <section className="card memory">
            <div className="card-head">
              <span className="k">Governance memory</span>
              <span className="hint">the three laws</span>
            </div>
            <ul className="mem-list">
              <li><span className="mem-t">Law 1</span> Every agent action is authorized before it happens.</li>
              <li><span className="mem-t">Law 2</span> Every exception reaches a human, with evidence.</li>
              <li><span className="mem-t">Law 3</span> Every decision is reconstructable afterward.</li>
            </ul>
          </section>

          {/* SPECIALISTS (col 3, row 3) */}
          <section className="card specialists">
            <div className="card-head">
              <span className="k">Specialists</span>
              <span className="hint">{agentPipeline.length}</span>
            </div>
            <ul className="spec-list">
              <li><span className="dot on" />Variance <span className="spec-s">active</span></li>
              <li><span className="dot pass" />Matching <span className="spec-s">done</span></li>
              <li><span className="dot pass" />Posting-prep <span className="spec-s">done</span></li>
            </ul>
          </section>

          {/* AUDIT LOG (col 4, row 3) */}
          <section className="card audit">
            <div className="card-head"><span className="k">Audit log</span></div>
            <ul className="audit-list">
              <li><span className="hash">a71e0d</span> PO read from S/4 (MCP)</li>
              <li><span className="hash">55c2b9</span> Variance classified</li>
              <li><span className="hash">1e8f44</span> Correction prepared · held</li>
              <li><span className="hash">c3d902</span> Awaiting human sign-off</li>
            </ul>
          </section>

          {/* CONNECTED SYSTEMS (cols 1-4, row 4 — closing strip) */}
          <section className="card systems">
            <div className="card-head">
              <span className="k">Connected systems</span>
              <span className="hint">via MCP</span>
            </div>
            <div className="sys-grid">
              <a className="sys" href={SAP_PORTAL} target="_blank" rel="noreferrer">
                <span className="dot pass" />SAP S/4HANA<span className="sys-s">read live ↗</span>
              </a>
              <a className="sys" href={UIPATH_PORTAL} target="_blank" rel="noreferrer">
                <span className="dot pass" />UiPath Orchestrator<span className="sys-s">3 jobs ↗</span>
              </a>
              <div className="sys"><span className="dot pass" />LLM Gateway<span className="sys-s">gpt-4o</span></div>
              <div className="sys"><span className="dot" />Write-back<span className="sys-s">held</span></div>
            </div>
          </section>
        </div>
        )}

        <div className="os-foot">
          Numbers are the agents’ actual output against live SAP S/4HANA. The write-back is prepared and held.
        </div>
      </main>
    </div>
  );
}

const CSS = `
.osurf{
  --paper:#ffffff; --soft:#fafaf9; --ink:#0a0a0a; --muted:#6e7178; --line:#e7e5e2;
  --accent:#ff7a45; --accent-ink:#c2410c; --accent-strong:#9a3412; --wash:#fff1ea;
  --pass:#1b7f4c; --body:#2c2f34;
  --r:18px; --ez:cubic-bezier(.215,.61,.355,1);
  min-height:100vh; width:100%; background:#fdfcfa; color:var(--ink);
  font-family:'Instrument Sans',ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif;
  -webkit-font-smoothing:antialiased;
}
.osurf b{font-weight:600}
.osurf i{font-style:italic}
.osurf .accent{color:var(--accent-ink)}
.osurf .mono{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace}
.os-header{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;
  padding:16px 40px;background:rgba(253,252,250,.85);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.os-brand{display:flex;align-items:baseline;gap:26px}
.os-wordmark{font-weight:700;font-size:17px;letter-spacing:-.01em}
.os-nav{display:flex;gap:20px}
.on{font-size:14px;color:var(--muted);cursor:pointer;transition:color .2s var(--ez)}
.on.active{color:var(--ink);font-weight:600}
.on:hover{color:var(--ink)}
.os-headright{display:flex;align-items:center;gap:16px}
.os-date{font-size:13px;color:var(--muted)}
.os-exit{font-size:13px;color:var(--muted);background:none;border:0;cursor:pointer;font-family:inherit}
.os-exit:hover{color:var(--ink)}
.os-avatar{width:30px;height:30px;border-radius:999px;background:#efe9e1;color:#0a0a0a;font-size:11px;font-weight:600;
  display:flex;align-items:center;justify-content:center}
.os-main{max-width:1240px;margin:0 auto;padding:40px 40px 56px}
.k{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)}
.os-h1{font-size:clamp(30px,4vw,44px);font-weight:600;letter-spacing:-.03em;line-height:1.04;margin:8px 0 8px}
.os-status{font-size:18px;color:#3a3d42;margin-bottom:26px}
.os-cmd{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--line);border-radius:999px;
  padding:16px 18px;margin-bottom:14px;box-shadow:0 1px 2px rgba(10,10,10,.04),0 14px 34px -24px rgba(10,10,10,.28)}
.os-cmd-prompt{font-family:ui-monospace,monospace;color:var(--muted)}
.os-cmd-ph{flex:1;color:#9a9ca1;font-size:15px}
.os-kbd{font-family:ui-monospace,monospace;font-size:11px;color:var(--muted);border:1px solid var(--line);border-radius:6px;padding:2px 6px}
.os-cmd-go{width:30px;height:30px;border-radius:999px;background:var(--ink);color:#fff;border:0;cursor:pointer;font-size:14px}
.os-actions{display:flex;gap:10px;margin-bottom:28px;flex-wrap:wrap}
.chip{font-size:13px;font-weight:500;color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:999px;
  padding:8px 14px;cursor:pointer;text-decoration:none;font-family:inherit;transition:transform .2s var(--ez),border-color .2s var(--ez)}
.chip:hover{transform:translateY(-1px);border-color:#cfccc7}
.chip-accent{border-color:#f2c4ab;color:var(--accent-ink);background:var(--wash)}
.os-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;grid-auto-rows:minmax(140px,auto)}
.card{background:var(--paper);border:1px solid var(--line);border-radius:var(--r);padding:20px 22px;
  box-shadow:0 1px 2px rgba(10,10,10,.04);animation:osrise .5s var(--ez) both}
.card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.hint{font-size:12px;color:var(--muted)}
.link-hint{color:var(--accent-ink);text-decoration:none}
.badge{font-family:ui-monospace,monospace;font-size:9.5px;text-transform:uppercase;letter-spacing:.13em;
  color:var(--accent-ink);border:1px solid #f2c4ab;border-radius:999px;padding:3px 8px}
.dot{width:8px;height:8px;border-radius:999px;background:var(--line);flex:none}
.dot.on{background:var(--accent);animation:ospulse 2s ease-in-out infinite}
.dot.pass{background:var(--pass)}
/* explicit grid — no dead cells */
.hero{grid-column:1 / 3;grid-row:1 / 3;
  background:radial-gradient(130% 100% at 0% 0%,#fff1ea 0%,#fff7f2 55%,#fffdfc 100%);border:1px solid #f2c4ab;
  display:flex;flex-direction:column}
.runs{grid-column:3 / 5;grid-row:1}
.proof{grid-column:3;grid-row:2}
.today{grid-column:4;grid-row:2;background:var(--ink);color:#fff}
.memory{grid-column:1 / 3;grid-row:3}
.specialists{grid-column:3;grid-row:3}
.audit{grid-column:4;grid-row:3}
.systems{grid-column:1 / 5;grid-row:4}
.hero-h{font-size:26px;font-weight:600;letter-spacing:-.025em;line-height:1.14;margin:2px 0 10px}
.hero-p{font-size:15px;color:var(--body);line-height:1.5;margin-bottom:16px}
.hero-lines{display:flex;flex-direction:column;gap:10px;margin-bottom:14px}
.hl{display:flex;gap:12px;align-items:flex-start}
.hl-tag{font-family:ui-monospace,monospace;font-size:10px;text-transform:uppercase;letter-spacing:.08em;
  border-radius:6px;padding:4px 7px;white-space:nowrap;margin-top:1px}
.hl-tag.price{background:#fff1ea;color:var(--accent-ink)}
.hl-tag.qty{background:#f2f0ec;color:#5a5d62}
.hl-body{font-size:14px;color:var(--body);line-height:1.4}
.hl-delta{font-family:ui-monospace,monospace;font-size:12px;color:var(--accent-ink);margin-left:4px}
.hero-prepared{font-size:13px;color:var(--body);background:rgba(255,255,255,.6);border:1px solid #f2c4ab;
  border-radius:10px;padding:10px 12px;margin-bottom:auto}
.pk{display:inline-block;font-family:ui-monospace,monospace;font-size:9.5px;text-transform:uppercase;letter-spacing:.1em;
  color:var(--accent-ink);margin-right:8px}
.hero-actions{display:flex;align-items:center;gap:12px;margin-top:18px}
.btn-dark{background:var(--ink);color:#fff;border:0;border-radius:999px;padding:11px 18px;font-size:14px;font-weight:600;
  font-family:inherit;cursor:pointer;transition:transform .25s var(--ez),box-shadow .25s var(--ez)}
.btn-dark:hover{transform:translateY(-2px);box-shadow:0 12px 26px -14px rgba(10,10,10,.5)}
.btn-line{background:#fff;color:var(--ink);border:1px solid var(--line);border-radius:999px;padding:11px 18px;font-size:14px;
  font-weight:600;font-family:inherit;cursor:pointer;transition:transform .25s var(--ez),box-shadow .25s var(--ez)}
.btn-line:hover{transform:translateY(-2px);box-shadow:0 10px 22px -14px rgba(10,10,10,.25)}
.link{font-size:14px;font-weight:600;color:var(--accent-ink);cursor:pointer;text-decoration:none}
.link:hover{color:var(--accent-strong)}
.run-list,.mem-list,.spec-list,.audit-list{list-style:none;display:flex;flex-direction:column;gap:2px}
.run{display:flex;align-items:center;gap:12px;padding:10px 8px;border-radius:12px;transition:background .2s var(--ez)}
.run:hover{background:#faf8f5}
.run-body{flex:1}
.run-name{font-size:14px;font-weight:600}
.run-role{font-size:12.5px;color:var(--muted);line-height:1.35}
.run-meta{text-align:right;flex:none}
.run-ok{display:block;font-size:12px;font-weight:600;color:var(--pass)}
.run-job{font-size:11px;color:var(--muted)}
.proof-p{font-size:14px;color:var(--body);line-height:1.5}
.proof-src{font-family:ui-monospace,monospace;font-size:11px;color:var(--muted);margin-top:12px}
.live{font-size:12px;color:var(--pass);font-weight:600}
.klight{color:#8a8d92}
.today-num{font-size:44px;font-weight:600;letter-spacing:-.04em;font-variant-numeric:tabular-nums;margin-top:8px}
.today-num span{font-size:15px;font-weight:400;color:#b9bcc0;margin-left:8px;letter-spacing:0}
.today-sub{font-size:13px;color:#c7cacd;margin-top:8px}
.today-sub b{color:var(--accent)}
.mem-list li{font-size:13.5px;color:var(--body);line-height:1.5;padding:6px 0}
.mem-t{font-family:ui-monospace,monospace;font-size:11px;color:var(--accent-ink);margin-right:10px}
.spec-list li{display:flex;align-items:center;gap:10px;font-size:14px;padding:8px 0}
.spec-s{margin-left:auto;font-size:12px;color:var(--muted)}
.audit-list li{font-size:13.5px;color:var(--body);padding:6px 0}
.hash{font-family:ui-monospace,monospace;font-size:12px;color:var(--muted);margin-right:10px}
.sys-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.sys{display:flex;align-items:center;gap:10px;font-size:14px;border:1px solid var(--line);border-radius:12px;padding:14px 16px;
  text-decoration:none;color:var(--ink);transition:border-color .2s var(--ez)}
a.sys:hover{border-color:#cfccc7}
.sys-s{margin-left:auto;font-size:12px;color:var(--muted)}
.os-foot{text-align:center;font-size:12px;color:var(--muted);margin-top:34px}
@keyframes osrise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes ospulse{0%,100%{opacity:1}50%{opacity:.4}}
@media(max-width:920px){.os-grid{grid-template-columns:1fr 1fr;grid-auto-rows:auto}
  .hero,.runs,.memory,.systems{grid-column:1 / 3}.hero,.proof,.today,.specialists,.audit{grid-row:auto}}
`;
