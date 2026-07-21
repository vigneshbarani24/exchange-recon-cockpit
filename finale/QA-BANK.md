# QA-BANK.md — the 3-minute jury Q&A

**Delivery rules:** answer the question in the first sentence, then one supporting detail, then stop (~20–30s). Never bluff — "I haven't done X; here's how I'd approach it" beats invention. With these two judges, honesty *is* the winning move. Everything here obeys `VERIFIED-STATE.md`.

---

## For Taqi Jaffri (agent governance · evaluation · orchestration)

**"How did you evaluate the agent — how do you know it's right, not just impressive once?"**
> All three agents have LLM-judge eval suites now — twelve scenarios against the real PO, scored for semantic similarity to the expected outcome. Variance covers clean-match, price-variance, over- and under-delivery, both together, and the tolerance boundary; matching covers clean, extra-line, and partial-reference; posting-prep covers quantity, price, and an ambiguous-action guardrail that must return not-ready. So it's multi-scenario behaviour, not one happy path. What's still roadmap — and I'll say it plainly — is tool-trajectory scoring and CI-gated regression, which is exactly where UiPath evals / Test Cloud come in.

**"What happens when the model drifts, or hits something it wasn't built for?"**
> Two layers. The agent is bounded — read-only prompts, a six-turn tool loop, structured output; if it can't read the PO it returns an empty match rather than guessing. And the architecture caps the blast radius: the worst case is a wrong *proposal* a human rejects, never a wrong *posting* — the agent physically cannot write to SAP. Drift detection over time — watching the classification distribution run-to-run — is the next instrumentation; I haven't wired it yet.

**"Why does the agent sit inside a Maestro workflow instead of orchestrating itself?"**
> Because non-determinism is a liability in a financial control. The workflow is the governance layer — authority lives there, not in the prompt. Maestro gives me the deterministic tolerance gate, the human approval gate, boundary-error escalation, and the audit trail. It's the same reason you don't let a clerk approve their own high-value exceptions — you constrain the actor inside a process.

**"How does this governance generalize — across platforms, not just this one UiPath workflow?"**
> Governed agency is two layers here, on purpose. UiPath is the *execution* governance — Maestro holds the authority, Action Center is the human gate, everything's audited; that's live and proven today. Above it sits a *policy* layer — our cross-platform decide-gate, Warden — where every agent action is checked against policy before it runs: same agents, any platform, one governance contract. UiPath answers "how does it execute and who approves"; the policy gate answers "may it act at all." In this demo the live governance is UiPath-native; the policy layer is how it generalizes across the estate.

**"How is the SAP access governed and identity-scoped?"**
> The agent authenticates to the SAP MCP server with XSUAA client-credentials, pulled from Orchestrator assets — no secrets in the repo. Today it's a service identity scoped to read the PO OData entity. Two honest gaps: it's one shared service principal, not per-user on-behalf-of attribution; and it's an MCP endpoint with the secret governed in an Orchestrator asset, not a first-class Integration Service connection. I chose MCP deliberately — it's the modern, typed, discoverable tool surface a coded agent should reason against — but the productionization step is a governed Integration Service connection with per-user OBO.

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

## Business impact & adoption (either judge may ask)

**"Is anyone actually going to use this — or is it a hackathon toy?"**
> It's real — there's a live customer POC for exactly this. A UK travel-sector enterprise gets about 200 supplier invoices a week landing in SAP automatically, and attaching each one to its matching purchase order is still fully manual. That's precisely the workflow this agent governs. So the business case isn't illustrative — it's a funded engagement, which is the strongest adoption signal I can give you.

**"What's the roadmap — how does this become a product?"**
> Three moves. One: ingest the real invoice PDF with UiPath IXP / Document Understanding, so it starts from the document, not structured text — that's what the customer needs next. Two: extend the same governed pattern to the rest of the repeatable back office — goods-receipt matching, dispute triage, dunning — one control model, many agents. Three: the two-layer governance makes it portable across the estate. This reconciliation is agent #1.

---

## Honesty / trap questions (rehearse these hardest)

**"Did the three agents run end-to-end inside one Maestro instance?"**
> Yes — proven on July 21st, and I can show you the trace. One Maestro instance ran matching, variance, and posting-prep as three real agent jobs against live S/4HANA, paused at the human gate, took a governed Approve message, and closed on "Corrected" — job keys and the full element trace are in the repo, and the instance is in the tenant. We then ran a campaign across six *different* live purchase orders covering all three endings — auto-approved within tolerance, approved-then-corrected, and escalated-to-buyer. And I'll be precise about the journey: at submission time the composition was built but blocked on a binding-resolution defect the CLI packer couldn't express — the fix came through Studio Web's canvas, which is itself a platform-usage story I'm happy to tell.

**"Is the demo live, or a mock?"**
> The agent reading SAP is live — real S/4HANA over MCP. The tell is that it's handed only the supplier's numbers yet returns the PO side. The cockpit's default view renders captured output from that live run so it always displays — and I label it as captured. The write-back is prepared and held, not executed.

**"Why don't you write the correction back to SAP?"**
> Two reasons, one principled and one practical. Principled: a governed agent shouldn't post to the system of record — a human authorizes and a deterministic step writes. Practical: the write path is coded but currently 404s on an upstream MCP-server bug that returns empty key properties. And a deliberate third: I chose not to stake a governance demo on a live mutation of a shared system-of-record object that could fail on camera — "armed and held" is the honest, safer story, and it's one server-side fix away from landing.

**"How much of this did Claude Code build?"**
> Substantially. The coded agents, the Maestro BPMN, and the cockpit were scaffolded and hardened with Claude Code through UiPath for Coding Agents, using the official `uip` skills — then hand-reviewed. It's documented with the commit trail in `CODING-AGENTS.md`. Deliberately blended — that's where the platform is going.

**"What would you do next / what's not production-ready?"**
> Three things, in order: reconcile the BPMN-to-agent contract and prove one composed Maestro run; land the write-back once the MCP key bug is fixed; and build the evalset-per-agent plus regression suite in Test Cloud. I know exactly what's real and what's next — that's the point.

---

## The one rule under pressure
If a question has a false premise ("so your agent pays invoices?"), reframe *before* answering: "Actually it never pays — it reads and proposes; a human authorizes and a deterministic step writes. Here's how…" Agree with the concern, correct the premise, then answer.
