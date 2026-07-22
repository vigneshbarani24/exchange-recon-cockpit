# QA-BANK.md — the 3-minute jury Q&A

**Delivery rules:** answer the question in the first sentence, then one supporting detail, then stop (~20–30s). Never bluff — "I haven't done X; here's how I'd approach it" beats invention. With these two judges, honesty *is* the winning move. Everything here obeys `2026-07-21-grounded/TRUTH.md` (with `VERIFIED-STATE.md` as history).

---

## For Taqi Jaffri (agent governance · evaluation · orchestration)

**"How did you evaluate the agent — how do you know it's right, not just impressive once?"**
> All three agents have LLM-judge eval suites — twelve scenarios against the real PO, scored for semantic similarity to the expected outcome, and all twelve pass. Variance covers clean-match, price-variance, over- and under-delivery, both together, and the tolerance boundary; matching covers clean, extra-line, and partial-reference; posting-prep covers quantity, price, and an ambiguous-action guardrail that must return not-ready. And the ground truth itself is verified, not assumed — a second model acted as an independent tester, validating every expected value directly against the live SAP tenant over the same MCP the agents use. What's still roadmap — and I'll say it plainly — is tool-trajectory scoring and CI-gated regression, which is exactly where UiPath evals / Test Cloud come in. One platform gap I filed as product feedback: portal eval reporting isn't available for CLI-published coded agents, so the results live in the repo and the evidence bucket.

**"What happens when the model drifts, or hits something it wasn't built for?"**
> Two layers. The agent is bounded — read-only prompts, a six-turn tool loop, structured output; if it can't read the PO it returns an empty match rather than guessing. And the architecture caps the blast radius: the worst case is a wrong *proposal* a human rejects, never a wrong *posting* — the agent physically cannot write to SAP. Drift detection over time — watching the classification distribution run-to-run — is the next instrumentation; I haven't wired it yet.

**"Why does the agent sit inside a Maestro workflow instead of orchestrating itself?"**
> Because non-determinism is a liability in a financial control. The workflow is the governance layer — authority lives there, not in the prompt. Maestro gives me the deterministic tolerance gate, the human approval gate, boundary-error escalation, and the audit trail. It's the same reason you don't let a clerk approve their own high-value exceptions — you constrain the actor inside a process.

**"Why is the approval a message and not an Action Center task?"**
> The decision is a correlated message where the message *name* is the decision — deterministic and auditable: no free text to parse, no ambiguity about what was decided. On the surface side I'll be precise about the journey: the Actions service wasn't provisioned on this tenant originally — the API literally answered "service not found" — and we enabled it ourselves at the Admin level the night before this presentation. The inbox is live now; creating tasks in it requires an Action App, which is a single named artifact away. So the gate mechanics are the governed core, Action Center is the reviewer surface arriving next, and I can tell you exactly where that boundary sits because I walked it.

**"How does this governance generalize — across platforms, not just this one UiPath workflow?"**
> Governed agency is two layers here, on purpose. UiPath is the *execution* governance — Maestro holds the authority and the human gate, everything's audited; that's live and proven today. Above it sits a *policy* layer — our cross-platform decide-gate, Warden — where every agent action is checked against policy before it runs: same agents, any platform, one governance contract. UiPath answers "how does it execute and who approves"; the policy gate answers "may it act at all." In this demo the live governance is UiPath-native; the policy layer is how it generalizes across the estate.

**"How is the SAP access governed and identity-scoped?"**
> The agent authenticates to the SAP MCP server with XSUAA client-credentials, pulled from Orchestrator assets — no secrets in the repo. Today it's a service identity scoped to read the PO OData entity. Two honest gaps: it's one shared service principal, not per-user on-behalf-of attribution; and it's an MCP endpoint with the secret governed in an Orchestrator asset, not a first-class Integration Service connection. I chose MCP deliberately — it's the modern, typed, discoverable tool surface a coded agent should reason against — but the productionization step is a governed Integration Service connection with per-user OBO.

**"What exactly is in the audit trail?"**
> Every prepared correction carries the current value, the proposed new value, the classification, the confidence, and the human's decision and note — with the deterministic check, the agent's judgment, and the human's authority as separate logged steps. What isn't yet a queryable persisted ledger is exactly that — it's the job trace plus the prepared-correction record — so a durable decision log is on the list.

**"How does it scale beyond the demo?"**
> The pattern is per-process, not per-invoice — Maestro fans out instances and each agent is stateless per case. The real constraint at ten thousand invoices is SAP API throughput, which is batchable, and agent-runtime capacity, which is an allocation question, not an architecture one.

---

## For Ingo Philipp (testing · quality · edge cases)

**"How did you test this? What are the edge cases?"**
> Three layers. Unit tests cover the cockpit's pure logic — instance-status triage, the response unwrap, the formatters. Twelve eval cases across the three agents, all passing, with the ground truth independently validated against live SAP by a second model. And at the process level, ten completed governed Maestro instances across six different live purchase orders (nine in the shipped campaign manifest plus the enriched twin's approve proof, with tonight's twin runs on top), exercising both gate branches — approve-then-correct and escalate. The deterministic auto-clear ending is designed but parked behind a script-output platform defect I filed, so today in-tolerance cases deliberately route to the human — conservative by default. The edge cases I reasoned about but haven't all hardened: malformed or adversarial supplier docs, PO-not-found, SAP timeout, multi-line and multi-material POs, unit-of-measure and currency mismatch. I can tell you for any of those whether it's handled in code, in the prompt, or not yet.

**"A green demo isn't release-readiness. What's your quality signal?"**
> Completely agree — a passing demo proves nothing. My signal today is three-fold: ten completed governed instances across six live purchase orders covering both gate branches, twelve passing eval cases per-agent with independently validated ground truth, and the structural guarantee that the failure mode is a rejected proposal, not a bad posting. What it still isn't is continuous: release-readiness needs tool-trajectory assertions and a CI-gated regression suite that turns every incident into a permanent test — that's Test Cloud territory, and it's roadmap, not done.

**"Where does it break, and what's the blast radius?"**
> It breaks first at the single MCP dependency to SAP and at supplier-document parsing. But the blast radius is deliberately tiny: the agent reads and proposes, it never writes. Worst case, a human sees a wrong proposal and rejects it. Nothing reaches SAP without a governed human approval — and even then it's a *separate* deterministic step that would do the write, and today even that step is armed and held. The agent can't.

**"Did you use Test Cloud or agentic testing?"**
> Not Test Cloud yet — honestly. I have twelve eval cases across the three agents via the UiPath eval framework, with a second model as an independent tester validating ground truth against live SAP, plus unit tests on the cockpit. Agentic testing with Test Cloud is the clear next step, and it's the right tool, because what I need to test next is behavior and tool-trajectory, not just outputs.

**"Is your quality work visible anywhere a QA team would look?"**
> Yes — there's a Test Manager project, "Exchange Recon - Agent Evals", created to hold the twelve documented eval cases with their results, so a QA team lands exactly where they'd expect to look. One honest wrinkle: the v2 API rejected automated test-case creation — another finding I filed as product feedback — so the case set is documented rather than pipeline-generated, and wiring it into Test Cloud automation is the roadmap step that makes it continuous.

**"How do you trust an auto-clear versus an escalation?"**
> The auto-clear is deterministic, not agentic — a fixed tolerance rule (2% price, 1 unit) decides it, so it's auditable and repeatable. The agent's judgment only ever produces a *proposal* that a human sees. So the thing I trust automatically is a rule; the thing that needs a human is the agent's judgment. That split is deliberate. And to be precise: today the auto-clear ending itself is parked behind a script-output platform defect I filed, so in-tolerance cases deliberately route to the human — conservative by default until the defect clears.

**"Your read-only guarantee — is that tested, or just asserted?"**
> Tested at two levels, structurally first. The agents have no write tool bound — a write instruction can't execute because the capability doesn't exist in their tool set; that's not a prompt promise, it's the tool contract. And resilience is proven, not claimed: in the enriched twin of this flow, a notification step was made to fail three separate times, and every time the boundary error event degraded the flow gracefully to the human gate — an integration failure can never block governance. The negative case isn't hypothetical; it ran.

---

## Business impact & adoption (either judge may ask)

**"Is anyone actually going to use this — or is it a hackathon toy?"**
> It's real — there's a funded customer pilot for exactly this class of work, proven live on a real S/4HANA cloud tenant. A UK adventure travel group gets about 200 supplier invoices a week landing in SAP automatically, and attaching each one to its matching purchase order is still fully manual. That's precisely the workflow this agent governs. So the business case isn't illustrative — it's a funded engagement, which is the strongest adoption signal I can give you.

**"What's the roadmap — how does this become a product?"**
> Three moves. One: ingest the real invoice PDF with UiPath IXP / Document Understanding, so it starts from the document, not structured text — that's what the customer needs next. Two: extend the same governed pattern to the rest of the repeatable back office — goods-receipt matching, dispute triage, dunning — one control model, many agents. Three: the two-layer governance makes it portable across the estate. This reconciliation is agent #1.

**"What is the next agent on this spine?"**
> The attach agent — invoice documents onto their purchase orders — and it's already live in pilot at a UK adventure travel group. Behind it, dunning and cash application are the named next cards. That's the point of the spine: it's a family of boring, repeatable back-office work, and every member reuses the same three pieces — exception-handling agents, a human gate, and a governed policy. Build the pattern once, stamp it across the family.

---

## Honesty / trap questions (rehearse these hardest)

**"Did the three agents run end-to-end inside one Maestro instance?"**
> Yes — proven on July 21st, and I can show you the trace. One Maestro instance ran matching, variance, and posting-prep as three real agent jobs against live S/4HANA, paused at the human gate, took a governed Approve message, and closed on "Corrected" — job keys and the full element trace are in the repo, and the instance is in the tenant. We then ran a campaign across six *different* live purchase orders covering both gate branches — approved-then-corrected and escalated-to-buyer. The third ending, deterministic auto-clear, is designed in the flow but parked behind a script-output platform defect I filed as product feedback — so today the borderline cases deliberately fail conservative and route to the human. And I'll be precise about the journey: at submission time the composition was built but blocked on a binding-resolution defect the CLI packer couldn't express — the fix came through Studio Web's canvas, which is itself a platform-usage story I'm happy to tell.

**"Is the demo live, or a mock?"**
> The agent reading SAP is live — real S/4HANA over MCP. The tell is that it's handed only the supplier's numbers yet returns the PO side. The cockpit's default view renders captured output from that live run so it always displays — and the badge on screen says exactly that: captured, from the live S/4 run. The write-back is prepared and held, not executed.

**"Why don't you write the correction back to SAP?"**
> Two reasons, one principled and one practical. Principled: a governed agent shouldn't post to the system of record — a human authorizes and a deterministic step writes. Practical: the write path is coded but currently 404s on an upstream MCP-server bug that returns empty key properties. And a deliberate third: I chose not to stake a governance demo on a live mutation of a shared system-of-record object that could fail on camera — "armed and held" is the honest, safer story, and it's one server-side fix away from landing.

**"How much of this did Claude Code build?"**
> Substantially. The coded agents, the Maestro BPMN, and the cockpit were scaffolded and hardened with Claude Code through UiPath for Coding Agents, using the official `uip` skills — then hand-reviewed. It's documented with the commit trail in `CODING-AGENTS.md`. Deliberately blended — that's where the platform is going.

**"What would you do next / what's not production-ready?"**
> Three things, in order: land the held write-back once the upstream MCP key bug is fixed — it's coded and one server-side fix away. Second, harden the escalation path — and the enriched twin of this flow is already deployed with exactly that: a ten-minute timer SLA on the human gate, Gmail and Slack notification legs each shielded by boundary error events so a connector failure can never block governance, and after the canvas round-trip the flow now sends its own notifications live: a Teams card and Slack message on the approve ending, and a full Teams, Gmail, and Slack sweep on escalate — traces in the repo. The ten-minute SLA timer has fired unattended twice. Moving the approval itself into Teams or Action Center, where the reviewers already work, is the surface leg on top of that. Third, make quality continuous with tool-trajectory assertions and CI-gated regression in Test Cloud, on top of the twelve passing evals. I know exactly what's real and what's next — that's the point.

---

## The one rule under pressure
If a question has a false premise ("so your agent pays invoices?"), reframe *before* answering: "Actually it never pays — it reads and proposes; a human authorizes and a deterministic step writes. Here's how…" Agree with the concern, correct the premise, then answer.
