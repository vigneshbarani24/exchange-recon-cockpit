# QA.md

The 3 minute jury Q&A. Supersedes `finale/QA-BANK.md`, which contains two answers that are
now factually wrong and one wrong volume figure.

**Delivery rules.** Answer in the first sentence. One supporting detail. Stop. About 20 to 30
seconds. Never bluff: "I have not done that; here is how I would approach it" beats
invention, and with these two judges honesty is the winning move, not damage control.

**If a question carries a false premise**, correct it before answering. "Actually it never
pays. It reads and proposes; a human authorises and a deterministic step writes. Here is
how." Agree with the concern, correct the premise, then answer.

---

## The three answers that changed today. Drill these hardest.

**"Did the three agents actually run end to end inside one Maestro instance?"**
> Yes, this morning. Instance `2db6d4d8`, package 1.0.5, completed in two minutes fifty-six.
> Matching agent, deterministic tolerance gate, variance agent, then the process suspended at
> the human gate, and on approval the posting-prep agent ran and the correction was prepared
> and held. Three real Orchestrator agent jobs inside one BPMN instance, against live SAP.
> Job keys and element executions are committed in the repo. And a second instance completed
> down the escalate branch, so both sides of the gate are proven.

**"So the human gate is a real approval? Who approved it?"**
> The gate is real and the suspension is real. It is a Maestro message event correlated on
> message name plus the purchase order, and it genuinely suspends and resumes a durable
> process; on one run it waited about six minutes. What it does not do yet is verify the
> approver's role. Today I send that message authenticated as myself from the CLI. The
> production step is an Action Center task or a Teams approval card so the identity is
> attached to the decision, and I will not describe what I have as role-based approval.

**"Is anyone actually going to use this, or is it a hackathon toy?"**
> Two real workloads shaped it. One is a US refiner where a de-identified discovery counted
> a hundred and eight recurring manual activities in procure to pay, about five point seven
> million dollars a year, with invoice processing and disputes the largest concentration. The
> other is a UK travel group taking about two hundred supplier invoices a week where the data
> already flows into S/4 automatically and only the human judgment step is left. Same pattern,
> two workloads. Deploying it is swapping the document source and the S/4 tenant.

---

## For Taqi Jaffri: governance, evaluation, orchestration

**"How do you know the agent is reliable, not just impressive once? What is your evaluation approach?"**
> All three agents have LLM-judge eval suites, twelve scenarios against the real PO scored for
> semantic similarity to the expected outcome. Variance covers clean match, price variance,
> over and under delivery, both together, and the tolerance boundary. Posting-prep includes an
> ambiguous-action guardrail that must return not-ready. So it is multi-scenario behaviour,
> not one happy path. What is still roadmap, and I will say it plainly, is tool-trajectory
> scoring and CI-gated regression, which is exactly where UiPath evals and Test Cloud come in.

**"Why does the agent sit inside a Maestro workflow instead of orchestrating itself?"**
> Because non-determinism is a liability in a financial control. The workflow is the
> governance layer; authority lives there, not in the prompt. Maestro gives me the
> deterministic tolerance gate, a human gate that genuinely suspends the process, boundary
> error escalation and the audit trail. It is the same reason you do not let a clerk approve
> their own high-value exceptions. You constrain the actor inside a process.

**"How is read-only enforced beyond a prompt?"** *(the question that separates you from rivals)*
> Structurally, in three independent layers. The agents have no write tool bound at all, so
> there is nothing to call. The only write path in the codebase is a separate deterministic
> CLI that the agents cannot invoke. And the tolerance decision that gates everything is
> plain JavaScript inside the BPMN, two percent price and one unit quantity, not a model call.
> The prompt says read-only as well, but the prompt is the weakest of the four and it is not
> what I am relying on.

**"What happens when the model drifts, or hits something it was not built for?"**
> Two layers. The agent is bounded: read-only prompts, a six-turn tool loop, structured
> output, and if it cannot read the PO it returns an empty match rather than guessing. And the
> architecture caps the blast radius: the worst case is a wrong proposal that a human rejects,
> never a wrong posting. Drift detection over time, watching the classification distribution
> run to run, is the next instrumentation and I have not wired it yet.

**"How does this scale?"**
> By process group, not by invoice. Maestro fans out instances and every agent is stateless
> per case, so the reasoning does not accumulate state; only the process does. In the discovery
> that shaped this, the sequencing rule was exception density times provider ownership times
> portfolio concentration, which is what decides which group goes next. The real constraint at
> ten thousand invoices is SAP API throughput, which is batchable, and agent runtime capacity,
> which is an allocation question rather than an architecture one.

**"How is the SAP access governed and identity-scoped?"**
> XSUAA client credentials to the SAP MCP server, pulled from Orchestrator assets, no secrets
> in the repo, scoped to read the purchase order OData entity. Two honest gaps: it is one
> shared service principal rather than per-user on-behalf-of attribution, and it is an MCP
> endpoint rather than a first-class Integration Service connection. I chose MCP deliberately
> because it is the typed, discoverable tool surface a coded agent should reason against, and
> the productionisation step is a governed connection with per-user OBO.

---

## For Ingo Philipp: testing, quality, edge cases

**"How did you test this? What are the edge cases?"**
> Unit tests on the cockpit's pure logic, eval suites on all three agents, and the composed
> instance now proven on both branches of the gate. The edge cases I reasoned about and have
> not all hardened: malformed or adversarial supplier documents, PO not found, SAP timeout,
> multi-line and multi-material POs, unit-of-measure and currency mismatch, and tolerance
> boundary exactness. I can tell you for any of those whether it is handled in code, in the
> prompt, or not yet.

**"A green demo is not release readiness. What is your quality signal?"**
> Completely agree, and a passing demo proves nothing. My honest signal is narrow: a golden
> path proven live on real SAP, eval suites per agent, and one structural guarantee that is
> worth more than the tests, which is that the failure mode is a rejected proposal and never a
> bad posting. Release readiness needs tool-trajectory assertions and a regression suite that
> turns every incident into a permanent test. That is Test Cloud territory and it is roadmap.

**"Where does it break, and what is the blast radius?"**
> It breaks first at the single MCP dependency to SAP, and second at supplier document
> parsing. The blast radius is deliberately tiny: the agent reads and proposes, it never
> writes. Worst case a human sees a wrong proposal and rejects it. Nothing reaches SAP without
> a person approving, and even then a separate deterministic step does the write. The agent
> cannot.

**"How do you trust an auto-clear versus an escalation?"**
> The auto-clear is deterministic, not agentic. A fixed rule decides it, two percent price and
> one unit, so it is auditable and repeatable and it fails the same way every time. The
> agent's judgment only ever produces a proposal that a human sees. So the thing I trust
> automatically is a rule, and the thing that needs a human is the agent's judgment. That
> split is the design.

**"Did you use Test Cloud?"**
> Not yet, honestly. I have eval suites per agent and unit tests on the cockpit. Agentic
> testing with Test Cloud is the clear next step and it is the right tool, because what needs
> testing here is behaviour and tool trajectory, not just outputs.

---

## Track and platform questions

**"Your track says humans, robots, agents and APIs. Where are the robots?"**
> Three of the four are in the flow and proven: agents as StartAgentJob service tasks, the
> human as a suspending message gate, and APIs as the live SAP read. There is no robot,
> deliberately, because in both real workloads the ingestion is already system to system, so
> an RPA leg would be theatre. The obvious extension is RPA ingestion for suppliers who send
> PDFs by email, and that is where IXP and an unattended robot would come in.

**"Why BPMN and not Maestro Case?"**
> Because BPMN is for flow complexity and Case is for context complexity. Invoice-to-PO
> reconciliation has a known shape and a predictable path, so it maps cleanly to a modelled
> flow with gateways and handoffs. A supplier dispute is the opposite; that has no predictable
> path and it would open as a Case. If this grew a dispute arm, that arm would be a Case
> hanging off this flow.

**"How much of this did Claude Code build?"**
> Substantially. The coded agents, the Maestro BPMN and the cockpit were scaffolded and
> hardened with Claude Code through UiPath for Coding Agents using the official skills, then
> hand reviewed. The commit trail documents it. The most useful thing it did was not writing
> code, it was diagnosing why every hand-authored BPMN faulted at runtime with missing binding
> resolution, which took five CLI variants to prove.

**"Is the demo live, or a mock?"**
> The agents reading SAP are live, real S/4HANA over MCP. The tell is that the agent is handed
> only the supplier's numbers yet returns the PO side. The cockpit's default view renders
> captured output from a live run so it always displays, and I label it captured. The
> write-back is prepared and held, not executed.

**"Why do you not write the correction back to SAP?"**
> Three reasons, and only one of them is a limitation. Principled: a governed agent should not
> post to the system of record; a human authorises and a deterministic step writes. Deliberate:
> I would not stake a governance demo on a live mutation of a shared system-of-record object
> that could fail on camera. Practical: the write path is coded but currently returns 404 on an
> upstream MCP server bug that returns empty key properties, so it is one server-side fix from
> landing. Armed, not fired.

**"What is not production ready?"**
> Three things, in order. Approver identity at the gate, which needs an Action Center task or
> a Teams approval so the decision carries a person. The write-back, once the MCP key bug is
> fixed. And the evalset plus regression suite in Test Cloud. I know exactly what is real and
> what is next, and that is the point.

---

## The traps

**"So your agent pays invoices?"**
> Correct the premise first. It never pays and it never posts. It reads and proposes. A human
> authorises and a separate deterministic step writes.

**"Isn't this just RPA with an LLM bolted on?"**
> That is close to the thesis, and I would put it the other way round. AI is the new RPA. RPA
> won because the industry wrapped it in orchestration, audit and human checkpoints, and that
> made it deployable inside a control environment. Agents are taking the judgment layer now and
> they need the same discipline. What is new here is not the reasoning, it is that the
> reasoning has no authority attached.

**"Aren't you under-using the agents? They barely decide anything."**
> That is the design, and I would call it second-class agents by design. They hold no write
> tool, no authority and no autonomy over money. We already constrain human employees inside
> workflows above a spend threshold. These agents get the same treatment. Low handling autonomy
> is the feature, because it is the only version an enterprise will actually deploy.

**"What is the ROI?"**
> Time to decision on the judgment step, with the method stated. The agent's verdict took
> fifty-seven seconds inside the instance and the whole governed run took under three minutes.
> In the de-identified discovery that shaped this, the same exception touched five desks over
> four days at about forty dollars a case, modelled down to about six. The human still signs,
> so the value is analyst hours reclaimed on reconciliation, not headcount removed.
