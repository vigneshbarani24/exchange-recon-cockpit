# DUMP.md

Everything, one file, self-contained. Written 2026-07-21. Finale is July 23.
If you load one file into a fresh session, load this one. The other files in this folder are
the expanded versions.

Rules that apply to everything generated from this file: every claim carries a tier (LIVE /
HELD / ASPIRATIONAL); no customer names ever; no em dashes or double hyphens in prose; if
this file conflicts with the codebase, the codebase wins.

---

# 1. STATUS

**Project:** Exchange Recon Cockpit. Governed invoice-to-PO reconciliation in procure to pay,
orchestrated by Maestro BPMN, reasoning over live SAP S/4HANA over MCP.
**Track:** 2, UiPath Maestro BPMN. **Builder:** VB, solo. **Repo:**
github.com/vigneshbarani24/exchange-recon-cockpit.

**The state changed materially on 2026-07-21.** The composed three-agent Maestro instance ran
green end to end. This was the single largest gap in every prior read of the project. It is
closed. Most of the July 20 finale docs still assert it is not, and are stale.

Remaining work is presentation and business case, not engineering.

---

# 2. LIVE: the composed Maestro run

## Run 3, approve path. This is the demo.
Evidence: `finale/maestro/composed-run-3-corrected-element-executions.json`

- Instance `2db6d4d8-b245-4531-9057-8172232524db` (`ExchangeReconBpmn-70812566`), **Completed**
- Package `ExchangeReconSolutionCanvas.Agentic.ExchangeReconBpmn:1.0.5`
- Folder `e3945ea1-de36-4504-bf98-dc6503edc87f`, fid 3252146
- 2026-07-21 06:40:37 to 06:43:34 UTC. **Total 2 min 56 s.**

| Element | Type | Proof | Time |
|---|---|---|---|
| `Event_start` | StartEvent | | 0.3 s |
| `Task_MatchAgent` | `Orchestrator.StartAgentJob` | job `fdbb41a2-6974-44ff-a9d5-7bf9fc732327` | 45 s |
| `Task_Tolerance` | ScriptTask, deterministic JS | 2.0 pct price, 1.0 unit qty, no LLM | 1.1 s |
| `Gateway_Tolerance` | ExclusiveGateway | routed to variance | 0.2 s |
| `Task_VarianceAgent` | `Orchestrator.StartAgentJob` | job `ebee41c4-5b75-4925-8ed8-44d8afc28b19` | 57 s |
| `GW_HumanWait` | EventBasedGateway | raced two message events | 0.2 s |
| `Event_Approve` | `Maestro.ReceiveMessageEvent` (`ApproveGate`) | **suspended 20 s, resumed on message** | 20 s |
| `Event_EscalateMsg` | `Maestro.ReceiveMessageEvent` | **Terminated**, losing branch cancelled by gateway | |
| `Task_PostingPrepAgent` | `Orchestrator.StartAgentJob` | job `c1ee53ae-5c17-4508-bb47-dd7e9a670241` | 46 s |
| `Task_UpdatePO` | ScriptTask | returns prepared and held, no write | 0.4 s |
| `End_Corrected` | EndEvent | | 0.3 s |

## Run 1, escalate path
Instance `f823f696-aa32-466b-99fc-72a84cd74ea7`, package `:1.0.2`, **Completed** on
`End_Escalated`. Matching job `875fc4d3` 53 s, variance job `7631a1d9` 62 s, gate paused about
6 minutes. Use for one sentence only: the same gate, taken the other way, also completes. Its
default-to-escalate was a message-envelope shape bug fixed in 1.0.5; do not present it as a
merits-based escalation.

## Why it had failed for two days, and the real fix
Not capacity. **Binding resolution.** The CLI packer requires binding-backed `name` and
`folderPath` on `StartAgentJob` and forbids literal `releaseKey` and `folderId`, yet nothing
in the CLI pack and deploy path ever resolved those bindings, so every deployed version
faulted at runtime with 170005. Five CLI variants proved it. Fixed by round-tripping through
**Studio Web's canvas**: re-picking each agent runs discovery and emits `releaseKey` bindings
(`propertyAttribute="Key"`), StartAgentJob **v2** payloads with typed schemas, and decisively
materialises the agents as **in-solution resources**, so deploy ships agents plus BPMN into one
folder and resolves bindings locally. The four `SAP_MCP_*` assets were cloned into the
deployment folder. Source: `ExchangeReconSolutionCanvas/`.

**This is also the best product-feedback item you have. Submit it.**

## What the human gate is, precisely
`Maestro.ReceiveMessageEvent` correlated on message **name plus reference**, reference being
the purchase order. Cleared by `uip maestro bpmn instance message send`, authenticated as VB.
**It suspends and resumes a real durable process. It does not verify the approver's role or
identity.** Never imply role-based approval today. This is the one honest weakness, and the
Teams work in section 11 is exactly the fix.

Reproduce:
```
uip maestro bpmn instance message send -f e3945ea1-de36-4504-bf98-dc6503edc87f \
  --inputs '{"name":"ApproveGate","reference":"4500000021","itemData":{"decision":"Approve","note":"Accept the over-delivery and supplier price; update the PO item accordingly."}}'
```

---

# 3. LIVE: the agents on real SAP

Three coded LangGraph agents (`matching`, `variance`, `posting-prep`) on `uipath-langchain`,
gpt-4o through the UiPath LLM Gateway so **no raw model key exists in the project**. They read
live S/4 over an OData to MCP server on SAP BTP, XSUAA client credentials, config from
Orchestrator assets.

**The tell, and it is the most valuable 25 seconds of the demo.** The agent is handed only the
supplier's numbers, yet it returns the **PO side**. For PO `4500000021`: PO unit price **25.00**
on item 10, PO order quantity **5** on item 20. There is no path to those values except reading
S/4 at runtime. No synthetic ground truth existed to lean on.

**Verdict timing:** 64 s standalone (job `dbedd8aa`), **57 s inside the composed instance**
(job `ebee41c4`). Prefer 57 s now; it was measured inside the orchestration you are demoing.

## The reconciliation as returned
`finale/receipts/variance-agent-PO4500000021.json`. Document INV-88231, GBP, confidence **0.95**.

| Item | Material | PO | Supplier | Classified | Prepared correction |
|---|---|---|---|---|---|
| 10 | RM27 | 50 at 25.00 | 50 at 27.50 | price-variance, plus 2.50 per unit, 10 pct, outside 2 pct tolerance | `A_PurchaseOrderItem.NetPriceAmount` 25.00 to 27.50 |
| 20 | RM16 | 5 at 2.00 | 6 at 2.00 | quantity-variance, plus 1 PC | `A_PurchaseOrderItem.OrderQuantity` 5 to 6 |

Both carry `ready_to_post: true`. Neither was posted.

## Governance in code, structural not asserted
- Every agent system prompt is read-only, explicit that it never writes and never posts.
- Structured Pydantic output. Bounded 6 turn tool loop. Cannot read the PO means empty match,
  not invention.
- **No agent binds a write tool.** The only write path is a separate deterministic CLI the
  agents cannot invoke (`post_correction.py`).
- The tolerance decision is plain JavaScript inside the BPMN, not a model call:
  `priceTolerancePct = 2.0`, `qtyTolerance = 1.0`, in `Task_Tolerance`.
- Secrets in Orchestrator assets, not the repo.

## Platform surface, deliberate
Maestro BPMN spine: three `Orchestrator.StartAgentJob` service tasks, one deterministic script
task, an exclusive gateway, an event-based gateway, two message catch events, three boundary
error events routing to one escalation path. Plus coded LangGraph agents, LLM Gateway,
Orchestrator, Action Center, TypeScript SDK cockpit, MCP to S/4 over XSUAA, and Claude Code
through UiPath for Coding Agents.

---

# 4. HELD

- **SAP write-back.** `post_correction.py` returns 404. The external MCP server returns empty
  `keyProperties`, a JSDOM bug upstream, so no keyed PATCH can be built. Inside the BPMN,
  `Task_UpdatePO` is deliberately a script task returning a prepared-and-held message.
  **Framing: armed, not fired.** Never attempt on camera. Present it as the correct default
  for a governance demo, not as a blocker.
- **Approver identity.** See section 2.

---

# 5. ASPIRATIONAL. Roadmap only, never demo.

- **Four of six invoice scenarios have no code.** Built and demoable: price-variance (item 10)
  and over-delivery (item 20). Clean-match and in-tolerance exist in code but are unseeded.
  **Invoice-before-goods-receipt, duplicate-block and vendor-bank-change fraud have no
  implementation.** No goods-receipt entity, no dedup logic, no vendor master read.
  `duplicate-line` is a classifier label only.
- **This is invoice to PO, two way. It is NOT a three way match.** No goods receipt read.
- Drift detection, tool-trajectory scoring, CI-gated regression, Test Cloud: all roadmap.
- The cockpit's default demo tab renders captured output behind a static "live S/4 via MCP"
  badge. Relabel it captured or say so out loud. Do not let a judge discover it.

---

# 6. PRE-FLIGHT RISK

1. **The SAP XSUAA secret was shared in chat and needs rotation.** Rotated but un-updated
   equals dead demo.
2. **The UiPath token is per folder.** Authenticating in one agent folder does not refresh the
   others. This broke matching and posting-prep on 2026-07-20 while variance worked. Copy the
   fresh `.env` to all three. Token lives about an hour.
3. Run the full instance at **T minus 10 minutes**, not T minus 60.

---

# 7. THE ARGUMENT

**Thesis.** Enterprises are not refusing agents because agents cannot reason. They are
refusing them because nobody will give a probabilistic system write access to the ledger. So
build reasoning with no authority attached: **determinism decides, agents advise, humans sign.**

**Frame.** Around 2005 RPA took the deterministic bulk of the back office. It won not because
robots were clever but because the industry wrapped it in orchestration, audit and human
checkpoints. In 2026 agents are taking the judgment layer and the same discipline has not been
applied. **AI is the new RPA, and it needs the same discipline RPA got.**

**Critical framing note.** Do NOT argue that AI cannot reason to two people who ship agent
products. Argue that reasoning is real and **authority** is the problem. That is also the
published position of the governance judge, so you are handing him his own thesis with a
completed instance behind it.

**The iceberg, the one architecture visual.**
- Below the waterline: the deterministic mass. Rules, tolerance gates, RPA. Cleared silently,
  zero LLM calls. Here that is `Task_Tolerance`, 1.1 s on run 3.
- At the waterline: the **exception-handling agents**. Rename them this way everywhere. They
  reason only where determinism runs out.
- At the peak: the human. Sole write authority.
- Label the three layers with the Three Laws.

**The provocation: second-class agents by design.** No write tools, no authority, no autonomy
over money. Deterministic gate above, quarantined executor below, human at the peak. The judge's
own line supports it: we already constrain human workforces inside workflows. Low handling
autonomy is the feature.

**The precision that protects you: stateless reasoning, stateful process.** Right and worth
saying: each invoice is an independent unit of judgment, no memory, no RAG, no vector store, no
knowledge graph, because **the system of record is the context**. SAP holds the ground truth so
the agent reads it live rather than building retrieval to approximate it. Much of the field built
context infrastructure to simulate what this reads from source. Wrong and dangerous: claiming the
**process** is stateless. Maestro holds durable state; that is how the gate suspended 20 s on run
3 and about 6 minutes on run 1. Never say "stateless" without "reasoning" attached.

**The Three Laws.** 1. Every agent action is authorised before it happens. 2. Every exception
reaches a human, with evidence. 3. Every decision is reconstructable afterwards. Lifted from a
real finance control. What is new is an agent that obeys them and a completed instance proving it.

**Where the human gate belongs.** Back-office agentic work is multi-system by nature, which means
every governed flow ends up asking a business user to open one more screen. Approval queues living
in a tool nobody has open are queues that age. The process should not ask the human to come to it.
It should go where the human already works and still refuse to move without them.

## Lines to use
- "Reasoning is real. Authority is the problem."
- "Determinism decides, agents advise, humans sign."
- "Deterministic where it counts, agentic where it helps."
- "Stateless reasoning, stateful process."
- "The system of record is the context."
- "An agent can be perfectly valid in the ERP and still be unauthorised in the business."
- "Second-class agents, by design."
- "Most agentic demos agree two numbers they made up. This one reads a purchase order it has
  never seen, at runtime, and is structurally incapable of writing back."
- "AI is the new RPA, and it needs the same discipline RPA got."

## Lines never to say
"AI cannot reason." "Agents are not ready." "Fully autonomous." "The agent decides." "The agent
posts to SAP." "Three way match." "Stateless" bare. "Deployed at" any customer. Any customer name.

---

# 8. THE NUMBERS

Anonymisation is absolute. Card A is "a Gulf Coast refiner". Card B is "a UK adventure travel
group". Fictional demo tenant is Calder Refining. Mariner is KaarTech's own product name and is
allowed. No logos, no brands, no document excerpts, anywhere.

## Card A: a Gulf Coast refiner
De-identified P2P discovery, US refiner, outsourced finance back office, post S/4 migration.
Activity counts observed; cost and cycle time are benchmark-range models presented as illustrative.

- **108 recurring manual activities** across **11 process groups** in procure to pay
- About **$5.7M a year**, roughly **83 percent provider run**
- One exception today: **5 desks, 4 days, about $40 a case**
- Modelled with the pattern: **1 gate, about 12 minutes, about $6 a case**
- To deploy: point the agents at their S/4 tenant and their control matrix

**The insight that sells it: the migration automated the transaction. It did not automate the
exception.** Clean transactions clear on their own; every break, dispute and reconciliation still
routes to a person, and that manual scope never left the invoice.

Distribution: invoice processing and disputes **32**; payment processing 19; audit, recon and
close 15; vendor master and MRD 10; supplier helpdesk 6; legal and fiscal 6; invoice receipt by
email 5; supplier enablement 5; invoice download 4; mail and scanning 3; debt collections 3.
Invoice processing is the largest single concentration, which is why it is agent number one and
not an arbitrary pick.

**The sequencing formula, which doubles as the scalability answer: exception density, times
provider ownership, times portfolio concentration, equals agentic heat.** Is it genuinely agentic,
is it cashable, does enough of it sit in one place. About **90 days to the first group live**, each
group self-funding the next, one gate and one audit trail across all of them. It scales by process
group, not by invoice.

## Card B: a UK adventure travel group
The Mariner pilot. Pilot-track engagement with a watch-only ramp. **Permitted phrasing:
capabilities proven live on a real S/4HANA Cloud tenant, customer tenant onboarding. Never say
deployed at.**

- Booking system already posts supplier invoice data into S/4 automatically
- About **200 supplier invoices a week**
- Today: every PDF attached to its S/4 entry by hand, weekly, from a shared folder
- With the pattern: match by reference and company code, propose, never write. **Four eyes above
  £25,000.** Append-only hash-chained ledger
- To deploy: swap the document source to SharePoint, point at their S/4 tenant

Worth borrowing: **zero documents read, the filename is the key**, which removes an entire class
of extraction risk. And **the trust ramp is the adoption mechanism**: watch-only, then
ask-me-first, then trusted, every promotion recorded on the audit chain. Autonomy is earned in
stages on the customer's clock, not granted at go-live.

**The spoken line for both:** "Same pattern, two real enterprises, two different workloads.
Deploying it is swapping the document source and the S/4 tenant."

## ROI for the build itself
Method, then number, then caveat. Never lead with a currency figure you cannot derive live.
Measured: 57 s verdict inside the instance, 2 min 56 s for the whole governed run. Compared to 5
desks over 4 days in the discovery. Honest claim: this compresses the **judgment step**, not the
whole process; the human still signs; the value is analyst hours reclaimed, not headcount removed.
Modelled and labelled: about $40 a case to about $6, four days to minutes.

---

# 9. THE COMPETITION

## Format
July 23, 2026. **5 minutes presentation including demo, then 3 minutes jury Q&A**, on UiPath's
template. Live demo required, backup video mandatory in practice. Winners announced around
August 4. (Ebru's community deck says 7 plus 3; the official brief says 5 plus 3. Use 5 plus 3,
take her intent that the demo gets the majority of the time.)

## The five criteria, equal weight, judged on the LIVE presentation and Q&A
1. **Business Impact and Adoption Potential.** Real-world relevance, production viability,
   clarity of the business case, scalability.
2. **Platform Usage.** Depth and deliberateness. Explicitly "rewards deliberate, deep usage over
   superficial breadth." Coding agents through UiPath for Coding Agents earn **up to 2 bonus
   points inside this criterion**.
3. **Technical Execution, Feasibility and Versatility.** Architectural soundness, code quality,
   production readiness, handling of exceptions, failures and edge cases.
4. **Creativity and Innovation.** Novel design decisions, unexpected orchestration patterns,
   creative problem framing.
5. **Presentation.** Logical flow problem to solution to impact, confidence and coherence of the
   demo, accessibility of technical communication, quality of Q&A responses.

**Coding-agent bonus mechanics.** Full 2 points need the tool named, evidence of how it
contributed, and proof of substantive integration. Evidence must include at least one of: prompt
log or session export, screenshots, **a dedicated README section**, or equivalent. The README
section is the cheapest path to the full 2.

## The track, and UiPath's own example
"Track 2: UiPath Maestro BPMN. Build a solution that models and runs an end-to-end business
process using BPMN 2.0 in UiPath Maestro. Your process should orchestrate humans, robots, agents,
and APIs through a defined flow with clear tasks, decisions, and handoffs."

UiPath's own worked example for this track is procure to pay, with "an invoice agent reconciles
discrepancies between PO, receipt, and invoice, escalating exceptions to humans." **You are
building the example they wrote. Say that once.**

Four actors, honest self-assessment: agents proven, humans proven, APIs proven, **robots thin**.
There is no robot because ingestion is already system to system. Say that is by design and that
RPA ingestion is the obvious extension. Three of four honestly beats four of four and being caught.

BPMN versus Case, in case asked: BPMN is for flow complexity, Case is for context complexity.
Invoice-to-PO reconciliation has a predictable path, so BPMN is right. A supplier dispute would
open as a Case.

## The judges
**Taqi Jaffri, VP Product Management.** Agent Builder, context grounding, AI Trust Layer, agent
evaluations, Maestro spokesperson. Ex Docugami co-founder, ex Microsoft principal PM. His
published lines: agents are non-deterministic by nature and that creativity "becomes a liability
when business processes have compliance requirements, financial consequences, or safety
implications"; "even with human workforces, we constrain them inside these workflows"; "sometimes
determinism is good, meaning it works the same way every time." UiPath's copy for his sessions:
"Enterprise AI agents aren't defined by demos; they're defined by evaluations."
Probes: evaluation and repeatability, why inside a workflow, drift, blast radius, generalisation.
Red flags: demo-only reliability, full autonomy in finance, hand-waving.

**Ingo Philipp, VP Product Management.** Testing, quality, Test Cloud. Ex theoretical
astrophysicist, long Tricentis career, exploratory-testing voice. "Certainty is the closing of the
testing mind." Agentic testing must "strengthen the quality signal, not simply increase the volume
of testing activity"; the danger is "confidence without evidence."
Probes: how you tested, named edge cases, where it breaks, blast radius. Red flag: overconfidence.

**Both reward the same behaviour: precision about what is proven versus what is not.** The honesty
tiering is not defensive with these two. It is the winning move.

## Ebru Sarikaya Yildirim's method
Winner or placed 2020, 2021, 2023, 2025; 1st in Enterprise Agents 2025 with AIdMe. Her checklist:
Devpost page; demo video **subtitled or voice-over, short and clean**; public GitHub repo with
**clear workflow diagrams** and a **Process, Problem and Solution** narrative; solution on
Automation Cloud; completed deck; feedback form. Her criteria slide appears twice, the second time
titled "My focus" with an identical layout, which means she covers the whole rubric deliberately
rather than optimising one axis. Her pattern: vivid high-stakes human problems, multiple UiPath
products every time, an AS-IS and TO-BE diagram as a standing artifact, and a fixed one-pager shape
of Challenge, Solution, How It Works in three numbered steps, Impact, architecture strip.

## The field
Track 2 threats ranked: **Aegis CaseOps** (blind-grader CLI that recomputes the verdict and exits
non-zero on tampering, corroboration cap, 38 pytest invariants; beats you on provable governance),
**FDE Agent** (per-node AI-delegation risk scored against AIID, OWASP LLM Top 10, MITRE ATLAS,
NIST AI RMF, EU AI Act), **FinClose AI** (closest domain twin, loses on exactly one axis, its own
page lists SAP and Oracle integration as future work). Then SpectreAI, Municipality AI, LegalMitra,
Agent Factory, MotoMind, ADRO ACORD.

Cross-track: **Nexus Maestro** (5 agents, real SIP calls, polished War Room, strongest presentation
rival), **SONIC** (claims a live Cisco Meraki client, strong MTTR numbers, highest community
traction), **CascadeCare** (nested Maestro Case, 12 agents, 13 surfaces, most aggressive
coding-agent evidence, but explicitly fictional data and no ROI).

**PostAuto with BE-terna is NOT a real deployment.** Its own page states the business data was
customer provided and "integration with live systems remains the key next milestone to turn the
prototype into an operational solution." That lowers the Business Impact bar across the field and
raises the value of a genuine live-system read.

## What is actually rare here
Against the whole retrieved field, this project uniquely holds all three of: a **live external
enterprise system-of-record read at runtime** (every rival uses synthetic or mocked data or reads
UiPath's own tenant surfaces); an **uncommon hydrocarbon procure-to-pay domain** no other finalist
occupies; and a **three-way deterministic, agent, human separation with the write path physically
quarantined**, where rivals mostly assert prompt-level restraint.

## Prizes
Grand Prize $8,000. **Best of Maestro BPMN $5,000**, the realistic primary. Runner-up $3,000.
Honorable Mention $2,000. **Best Demo and Presentation $3,000.** **Most Creative $3,000.** Max two
prizes per project. Also cheap and worth it: **Best Product Feedback**, and the binding-resolution
failure in section 2 is genuinely useful, specific feedback. People's Choice conflicts across
sources on whether votes count for 10 percent; post the forum write-up once and spend no more time.

## Honest scorecard
| Criterion | Jul 20 | Today | Ceiling by Jul 23 |
|---|---|---|---|
| Platform Usage | 4.5 | **5** | 5 |
| Technical Execution | 4 | **4.5** | 4.5 |
| Creativity and Innovation | 4 | 4 | 4.5 |
| Business Impact and Adoption | 2.5 | 3 | **4.5** |
| Presentation | 3 | 3 | **4.5** |
| Coding-agent bonus | +1 | +1 | **+2** |

---

# 10. THE 5 MINUTE RUN

**The scheduling insight.** The instance takes 2:56, which sounds fatal. It is not, because **the
human gate waits for you.** The process suspends at `Event_Approve` indefinitely. So start it
early, deliver the entire argument over the top of it, and the process arrives at the gate exactly
when you want to talk about the gate.

Segment timings from instance start: matching done 0:47; tolerance gate done 0:49; variance done
1:47; **suspends at the gate 1:48**; on approval plus 46 s posting-prep; plus 2 s to End_Corrected.

| Clock | Screen | Say |
|---|---|---|
| 0:00 to 0:20 | Slide 1, then invoice next to the SAP PO line | "A supplier invoiced us. Price and quantity do not match the purchase order in SAP. Somebody has to work out why, against the live system of record, before finance pays. Most agentic demos would now agree two numbers they made up. This one is about to read a purchase order it has never seen." |
| **0:20** | **Start the instance. Say you are doing it.** | "I am starting the process now. It takes about three minutes, so let me tell you why it is built this way while it runs." |
| 0:20 to 1:05 | Slide 3 | The 108 activities, the $5.7M, 5 desks and 4 days. Land: "the migration automated the transaction, not the exception." Then: "an agent can be perfectly valid in the ERP and still be unauthorised in the business." |
| 1:05 to 1:40 | Slide 5 iceberg, glance at the run | Three layers. "Notice what just happened: the tolerance gate took one second and made no model call at all. Agents only reason where determinism runs out." |
| 1:40 to 2:10 | Slide 6 | Three Laws. Second-class agents by design. "Stateless reasoning, stateful process." |
| 2:10 to 2:35 | **Switch to the instance, suspended at the gate** | "And there it is. The process has stopped. Three agents ran as real Orchestrator jobs inside this one instance, and now it is suspended, waiting for a person. It will wait as long as it takes." |
| **2:35 to 3:00** | **The variance output. Point at the PO side.** | **The moment the room decides. Slow down.** "This is why live matters. The agent was handed only the supplier's numbers. It is reporting the PO side: net price twenty-five pounds, order quantity five. There is exactly one way it knows that, which is by reading S/4 at runtime." |
| 3:00 to 3:15 | Approve | "A person decides. I approve, and the process resumes." See branch note below. |
| 3:15 to 4:05 | Posting-prep, held correction, End_Corrected | "It builds the exact S/4 update, item ten, twenty-five to twenty-seven fifty. And then it stops. Prepared and held. The agents have no write tool at all. The only write path is a separate deterministic step a human authorises. Deterministic check, agent judgment, human authority, kept apart on purpose." |
| 4:05 to 4:15 | Claude Code and `uip` | "The agents, the BPMN and the cockpit were all built with Claude Code through UiPath for Coding Agents." |
| 4:15 to 4:50 | Slide 7, two value cards | Two enterprises, one pattern, deployment is a config delta. "Three minutes end to end with a person still holding the pen." Close: "AI is the new RPA, and it needs the same discipline RPA got. Thank you." |
| 4:50 to 5:00 | Hold | Buffer. Do not fill it. |

**Branch note at 3:00.** If the Teams gate ships, approve from the card and say: "the process does
not ask the approver to come to it. It goes to where they already work, and it still refuses to
move without them." If it does not ship, send the CLI message and say: "in production this is an
Action Center task or a Teams approval so the approver's identity is attached. Today it correlates
on the purchase order and does not check my role, and I will not pretend otherwise." **The second
version is not weak. Volunteering the exact boundary of your own governance to these two judges is
worth more than the feature.**

**Failure protocol.** Stall over about 15 s: "the tenant is slow right now, let me show you this
exact run", cut to the recorded run 3, narrate as if live, do not apologise twice. Auth fails at
the start: do not debug on camera, go to the recording, say "the token is per folder and mine has
expired, so here is the run from this morning." Never attempt the write-back, never demo the
fraud, duplicate or goods-receipt cases, never say three way match.

**Rehearsal.** Memorise the first 35 s and last 35 s word for word. Land at 4:50.

---

# 11. BUILD QUEUE

## P0, today, before anything else
1. **Record the backup video off the green run.** Nothing else happens until this exists. Three
   agent jobs, deterministic gate, suspend, approve, held correction, End_Corrected. Subtitled,
   under 90 s. It is the finale fallback and the Devpost asset and insurance against every other
   item failing.
2. **Freeze and tag 1.0.5.** Never deploy over it. Further BPMN work happens as a new version in a
   copied solution folder.
3. **Correct the stale docs.** These contradict reality and a judge reading the repo will find them.

| File | Fix |
|---|---|
| `finale/VERIFIED-STATE.md` | Banner to `2026-07-21-grounded/TRUTH.md`. Its condition "only claim three-agents-in-one-instance if a completed run shows `Task_PostingPrepAgent` with a job key" is now satisfied: `c1ee53ae`. |
| `finale/DEMO-RUNBOOK.md:39` | "Never: try the 3-agent Maestro run live (it can't complete)" is false. |
| `finale/QA-BANK.md:64,76` | Both assert the composed instance never ran. |
| `finale/QA-BANK.md:54` | Says 200 invoices a month. It is a week. |
| `finale/DECK-CONTENT.md` slide 5 | Labels the Maestro spine BUILT. It is LIVE. |
| `finale/RUBRIC-MATCH.md` | Re-score Platform Usage to 5, Technical Execution to 4.5. |

4. **README coding-agent section**, to lock the full +2. Name Claude Code through UiPath for Coding
   Agents, describe what it authored, link commit history. **First fix `CODING-AGENTS.md`, which
   cites `src/lib/demoData.ts` and a `VITE_DEMO_FALLBACK` flag that do not exist in the code.**
   Best single line for that section: the coding agent's most valuable work was not writing code,
   it was diagnosing the unresolved `releaseKey` and `folderId` binding failure across five CLI
   variants.

## P1: the governance evidence sheet
One page converting asserted governance into inspectable governance. This is the direct answer to
Aegis and FDE, and the artifact Taqi Jaffri is most likely to want. Contents: the exact read-only
prompt line quoted; the code path proving the only write is the quarantined non-agent executor and
that no agent binds a write tool; the gate constants; the three job keys and two instance IDs; and
**one documented negative test** where an agent is prompted to write and demonstrably has no write
tool bound. One reproducible negative test moves you from asserted safety to tested safety, which
is the emerging bar. Cost: an hour.

## P2: the Teams-native human gate. DESIGNED, DECISION HELD BY VB.

**Why worth it.** Closes the one honest governance weakness (the gate does not know who approved),
answers Adoption Potential directly (approval queues in a tool nobody has open are queues that
age), and adds Integration Service or API Workflows to the platform surface, which the criterion
names explicitly.

**Why dangerous.** It touches the only thing that just started working, 48 hours out, and depends
on two systems outside this repo.

**The design. The gate itself does not change.** `ExchangeReconBpmn.bpmn:192-226` already races
`ApproveGate` against `EscalateGate` off an `EventBasedGateway`, both correlated on
`Reference = purchaseOrder`. That is already a two-button card, and run 3 proved the race works:
`Event_Approve` completed while `Event_EscalateMsg` was Terminated by the gateway.

```
Task_VarianceAgent
   +--> Task_NotifyTeams          [NEW, the only BPMN addition]
   |      Adaptive Card: PO, supplier vs PO values read live from S/4,
   |      variance category, confidence, proposed correction, note input, two buttons
   +--> GW_HumanWait               [UNCHANGED]
          |-- Event_Approve     (ApproveGate)   <-- "Approve"
          '-- Event_EscalateMsg (EscalateGate)  <-- "Escalate"

Return: card submit -> Power Automate -> Maestro instance message API -> instance resumes
```

Return payload, matching what run 3 already accepted:
`{"name":"ApproveGate","reference":"<PO>","itemData":{"decision":"Approve","note":"<text>","approver":"<UPN from Teams>"}}`
**The `approver` field is the entire governance upgrade.**

**Verify before writing code, do not guess.** (1) Which outbound activity type Maestro actually
permits. Script tasks are sandboxed JavaScript and almost certainly cannot make outbound HTTP
calls, so `Task_NotifyTeams` needs a real activity: Integration Service Teams connector, an API
Workflow as a service task, or a registered HTTP activity. **Consult the
`uipath:uipath-maestro-bpmn` skill registry.** Inventing an activity type is how two days were
lost. (2) The exact Maestro instance-message REST route and external-app scope; the CLI does it, so
it exists. (3) Whether the Power Automate HTTP action needs premium in this tenant.

Already built: `scripts/notify_teams.py` posts Adaptive Cards through a Power Automate incoming
webhook, with the URL in the gitignored `scripts/.teams-webhook`. So outbound is proven
mechanically. New work is the card body and the return leg.

**Rules if it goes ahead.** Build as `1.0.6` in a **copy** of `ExchangeReconSolutionCanvas`, never
in place. Feature-flag the notify task and wrap it so a Teams failure cannot block the flow. **Hard
cutoff end of July 22**; if 1.0.6 is not green by then, ship 1.0.5 and the Teams gate becomes a
roadmap slide with working code behind it, which is a fine outcome. The live demo stays on whichever
version is green.

## P3, if time exists
Open-source two or three UiPath skills for Claude Code in a **separate** public repo
(`uipath-maestro-bpmn`, `uipath-langgraph-agent`, `sap-odata-mcp`), each with a SKILL.md and a
README crediting UiPath for Coding Agents. Coding-agent evidence, community-vote material and
feedback-prize substance in one artifact. Must not touch this repo's demo path.
Submit the product feedback form with the binding-resolution finding.

## DO NOT. Push back if asked again.
1. Do not attempt the SAP write-back. Upstream MCP JSDOM fix, outside your control. Armed and not
   fired is the better story anyway.
2. Do not build supplier-invoice attachment. The connector exposes no supplier invoice service. It
   would be a mock wearing a live badge, and the honesty tiering is the actual moat.
3. Do not add mail notification. Second external surface in 48 hours for marginal points.
4. Do not build the four uncoded scenarios.
5. Do not refactor anything.
6. Do not deploy over 1.0.5.

---

# 12. Q&A, THE ONES THAT MATTER

Answer in the first sentence, one supporting detail, stop. About 20 to 30 seconds. Never bluff.
If a question carries a false premise, correct it before answering.

**"Did the three agents actually run end to end inside one Maestro instance?"**
Yes, this morning. Instance `2db6d4d8`, package 1.0.5, completed in two minutes fifty-six. Matching
agent, deterministic tolerance gate, variance agent, then the process suspended at the human gate,
and on approval the posting-prep agent ran and the correction was prepared and held. Three real
Orchestrator agent jobs inside one BPMN instance against live SAP. Job keys committed in the repo.
A second instance completed down the escalate branch, so both sides of the gate are proven.

**"So the human gate is a real approval? Who approved it?"**
The gate is real and the suspension is real; on one run it waited about six minutes. What it does
not do yet is verify the approver's role. Today I send that message authenticated as myself from
the CLI. The production step is an Action Center task or a Teams approval card so identity attaches
to the decision, and I will not describe what I have as role-based approval.

**"How is read-only enforced beyond a prompt?"** (the question that separates you from rivals)
Structurally, in three independent layers. The agents have no write tool bound, so there is nothing
to call. The only write path in the codebase is a separate deterministic CLI the agents cannot
invoke. And the tolerance decision that gates everything is plain JavaScript in the BPMN, two
percent and one unit, not a model call. The prompt says read-only too, but that is the weakest layer
and it is not what I rely on.

**"How do you know it is reliable, not impressive once?"**
All three agents have LLM-judge eval suites, twelve scenarios against the real PO scored for
semantic similarity to expected outcome. Variance covers clean match, price variance, over and under
delivery, both together, and the tolerance boundary. Posting-prep includes an ambiguous-action
guardrail that must return not-ready. Still roadmap, and I will say it plainly: tool-trajectory
scoring and CI-gated regression, which is where UiPath evals and Test Cloud come in.

**"Why inside a Maestro workflow rather than orchestrating itself?"**
Because non-determinism is a liability in a financial control. The workflow is the governance layer;
authority lives there, not in the prompt. Maestro gives me the deterministic gate, a human gate that
genuinely suspends the process, boundary error escalation and the audit trail. Same reason you do
not let a clerk approve their own high-value exceptions.

**"Where does it break, and what is the blast radius?"**
It breaks first at the single MCP dependency to SAP, second at supplier document parsing. The blast
radius is deliberately tiny: the agent reads and proposes, never writes. Worst case a human sees a
wrong proposal and rejects it. Nothing reaches SAP without a person approving, and even then a
separate deterministic step does the write.

**"A green demo is not release readiness."**
Completely agree. My honest signal is narrow: a golden path proven live, eval suites per agent, and
one structural guarantee worth more than the tests, which is that the failure mode is a rejected
proposal and never a bad posting. Release readiness needs tool-trajectory assertions and a
regression suite turning every incident into a permanent test. That is Test Cloud and it is roadmap.

**"Where are the robots?"**
Three of the four are in the flow and proven. There is no robot, deliberately, because in both real
workloads the ingestion is already system to system, so an RPA leg would be theatre. The extension
is RPA ingestion for suppliers who send PDFs by email, which is where IXP and an unattended robot
come in.

**"Is anyone actually going to use this?"**
Two real workloads shaped it. A US refiner where a de-identified discovery counted a hundred and
eight recurring manual activities in procure to pay, about five point seven million dollars a year.
And a UK travel group taking about two hundred supplier invoices a week where the data already flows
into S/4 and only the judgment step is left. Deploying it is swapping the document source and the
S/4 tenant.

**"Isn't this just RPA with an LLM bolted on?"**
That is close to the thesis and I would put it the other way round. AI is the new RPA. RPA won
because the industry wrapped it in orchestration, audit and human checkpoints. Agents are taking the
judgment layer now and need the same discipline. What is new is not the reasoning, it is that the
reasoning has no authority attached.

**"Aren't you under-using the agents?"**
That is the design. Second-class agents by design: no write tool, no authority, no autonomy over
money. We already constrain human employees inside workflows above a spend threshold. Low handling
autonomy is the feature, because it is the only version an enterprise will deploy.

**"Why not write back to SAP?"**
Three reasons and only one is a limitation. Principled: a governed agent should not post to the
system of record. Deliberate: I would not stake a governance demo on a live mutation of a shared
object that could fail on camera. Practical: the write path is coded but returns 404 on an upstream
MCP bug returning empty key properties, so it is one server-side fix from landing.

**"What is the ROI?"**
Time to decision on the judgment step, with the method stated. Fifty-seven seconds for the verdict,
under three minutes for the whole governed run. In the discovery that shaped this, the same
exception touched five desks over four days at about forty dollars a case, modelled down to about
six. The human still signs, so the value is analyst hours reclaimed, not headcount removed.

---

# 13. OPEN DECISIONS

1. **Teams gate: yes or no.** Held by VB as of 2026-07-21. Hard cutoff end of July 22 if yes.
2. **Banner the six stale docs and fix `CODING-AGENTS.md`.** Not yet done, awaiting go.
3. Deck rebuild from section 10 and the DECK.md expansion, fixing slide 5 from BUILT to LIVE.
