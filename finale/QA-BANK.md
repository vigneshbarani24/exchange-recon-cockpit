# QA-BANK.md — the 3-minute jury Q&A

**Delivery rules:** answer the question in the first sentence, then one supporting detail, then stop (~20–30s). Never bluff — "I haven't done X; here's how I'd approach it" beats invention. With these two judges, honesty *is* the winning move. Everything here obeys `VERIFIED-STATE.md`.

---

## For Taqi Jaffri (agent governance · evaluation · orchestration)

**"How did you evaluate the agent — how do you know it's right, not just impressive once?"**
> Honestly, my evaluation today is narrow and I'll tell you exactly where. The variance agent has an eval set — an LLM-judge semantic-similarity check on its reconciliation output. Matching and posting-prep don't have evals yet. The repeatability signal I trust is that across runs it consistently returns the correct PO side it read from S/4. The real productionization step is an evalset per agent with tool-trajectory scoring, gated in CI — that's the honest next step, and it's where UiPath evals / Test Cloud fit.

**"What happens when the model drifts, or hits something it wasn't built for?"**
> Two layers. The agent is bounded — read-only prompts, a six-turn tool loop, structured output; if it can't read the PO it returns an empty match rather than guessing. And the architecture caps the blast radius: the worst case is a wrong *proposal* a human rejects, never a wrong *posting* — the agent physically cannot write to SAP. Drift detection over time — watching the classification distribution run-to-run — is the next instrumentation; I haven't wired it yet.

**"Why does the agent sit inside a Maestro workflow instead of orchestrating itself?"**
> Because non-determinism is a liability in a financial control. The workflow is the governance layer — authority lives there, not in the prompt. Maestro gives me the deterministic tolerance gate, the human approval gate, boundary-error escalation, and the audit trail. It's the same reason you don't let a clerk approve their own high-value exceptions — you constrain the actor inside a process.

**"How is the SAP access governed and identity-scoped?"**
> The agent authenticates to the SAP MCP server with XSUAA client-credentials, pulled from Orchestrator assets — no secrets in the repo. Today it's a service identity scoped to read the PO OData entity. The honest gap: it's one shared service principal, not per-user on-behalf-of attribution — that's what I'd add so every read is individually attributable.

**"What exactly is in the audit trail?"**
> Every prepared correction carries the current value, the proposed new value, the classification, the confidence, and the human's decision and note — with the deterministic check, the agent's judgment, and the human's authority as separate logged steps. What isn't yet a queryable persisted ledger is exactly that — it's the job trace plus the prepared-correction record — so a durable decision log is on the list.

**"How does it scale beyond the demo?"**
> The pattern is per-process, not per-invoice — Maestro fans out instances and each agent is stateless per case. The real constraint at ten thousand invoices is SAP API throughput, which is batchable, and agent-runtime capacity, which is an allocation question, not an architecture one.

---

## For Ingo Philipp (testing · quality · edge cases)

**"How did you test this? What are the edge cases?"**
> Unit tests cover the cockpit's pure logic — instance-status triage, the response unwrap, the formatters. The agent I tested against the golden path plus the one variance eval case. The edge cases I reasoned about but haven't all hardened: malformed or adversarial supplier docs, PO-not-found, SAP timeout, multi-line and multi-material POs, unit-of-measure and currency mismatch, and tolerance-boundary exactness. I can tell you for any of those whether it's handled in code, in the prompt, or not yet.

**"A green demo isn't release-readiness. What's your quality signal?"**
> Completely agree — a passing demo proves nothing. My honest signal today is narrow: one golden path proven live, one eval case, and the structural guarantee that the failure mode is a rejected proposal, not a bad posting. Release-readiness needs an evalset per agent, tool-trajectory assertions, and a regression suite that turns every incident into a permanent test — that's Test Cloud territory, and it's roadmap, not done.

**"Where does it break, and what's the blast radius?"**
> It breaks first at the single MCP dependency to SAP and at supplier-document parsing. But the blast radius is deliberately tiny: the agent reads and proposes, it never writes. Worst case, a human sees a wrong proposal and rejects it. Nothing reaches SAP without a human clicking approve — and even then a *separate* deterministic step does the write. The agent can't.

**"Did you use Test Cloud or agentic testing?"**
> Not yet — honestly. I have a functional eval on the variance agent and unit tests on the cockpit. Agentic testing with Test Cloud is the clear next step, and it's the right tool, because what I need to test is behavior and tool-trajectory, not just outputs.

**"How do you trust an auto-clear versus an escalation?"**
> The auto-clear is deterministic, not agentic — a fixed tolerance rule (2% price, 1 unit) decides it, so it's auditable and repeatable. The agent's judgment only ever produces a *proposal* that a human sees. So the thing I trust automatically is a rule; the thing that needs a human is the agent's judgment. That split is deliberate.

---

## Honesty / trap questions (rehearse these hardest)

**"Did the three agents run end-to-end inside one Maestro instance?"**
> No — and let me be precise. All three ran live as separate jobs against real SAP — I re-ran them this week on the real PO: matching aligns the supplier lines at full confidence, variance classifies the price and quantity variances and prepares the corrections, posting-prep prepares the exact S/4 update. Three live jobs, real system of record, receipts in the repo. What has *not* run is the three composed inside one Maestro instance — built, validated, deployed, and bound, but capacity-blocked. I won't claim the instance completed.

**"Is the demo live, or a mock?"**
> The agent reading SAP is live — real S/4HANA over MCP. The tell is that it's handed only the supplier's numbers yet returns the PO side. The cockpit's default view renders captured output from that live run so it always displays — and I label it as captured. The write-back is prepared and held, not executed.

**"Why don't you write the correction back to SAP?"**
> Two reasons, one principled and one practical. Principled: a governed agent shouldn't post to the system of record — a human authorizes and a deterministic step writes. Practical: the write path is coded but currently 404s on an upstream MCP-server bug that returns empty key properties. So it's armed and held, honestly.

**"How much of this did Claude Code build?"**
> Substantially. The coded agents, the Maestro BPMN, and the cockpit were scaffolded and hardened with Claude Code through UiPath for Coding Agents, using the official `uip` skills — then hand-reviewed. It's documented with the commit trail in `CODING-AGENTS.md`. Deliberately blended — that's where the platform is going.

**"What would you do next / what's not production-ready?"**
> Three things, in order: reconcile the BPMN-to-agent contract and prove one composed Maestro run; land the write-back once the MCP key bug is fixed; and build the evalset-per-agent plus regression suite in Test Cloud. I know exactly what's real and what's next — that's the point.

---

## The one rule under pressure
If a question has a false premise ("so your agent pays invoices?"), reframe *before* answering: "Actually it never pays — it reads and proposes; a human authorizes and a deterministic step writes. Here's how…" Agree with the concern, correct the premise, then answer.
