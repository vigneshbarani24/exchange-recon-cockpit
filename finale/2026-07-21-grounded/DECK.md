# DECK.md

Slide content for the official template, paste ready. Seven slides plus an optional eighth.
Bullets are short because the bullet is not the message; you are. Everything obeys
`TRUTH.md` and argues `NARRATIVE.md`.

**Design rule:** the deck is a backdrop, not the presentation. The demo runs live from 0:20
and most of your five minutes is spent talking over a real Maestro instance. Slides 3, 5 and
6 are what is on screen while the agents run.

---

## Slide 1: Title

**Workforce to Workflow**
*A governed agent for the SAP back office.*
VB, KaarTech UK&I. UiPath AgentHack 2026, Track 2, Maestro BPMN.

> **Say, 15 s:** "Every enterprise is about to hire agents into the back office. The winners
> will not be the ones with the smartest agents. They will be the ones whose agents obey the
> rules. Here is one that does, orchestrated by Maestro, reading a live SAP system it has
> never seen."

## Slide 2: Team

**VB, FDE and Enterprise AI Lead, KaarTech UK&I**
Solo build. Coded agents, Maestro BPMN and cockpit, all built with **Claude Code through
UiPath for Coding Agents**.
**Exchange Recon Cockpit:** governed procure-to-pay reconciliation on live SAP S/4HANA.

> **Say, 10 s:** Keep it to one breath. Solo, built with Claude Code, and move on. The
> coding-agent point gets its evidence on slide 4, not here.

---

## Slide 3: Problem and Solution
*The highest-leverage slide. This is the thesis.*

**Problem**
- Post migration, the transaction is automated. **The exception is not.**
- In one de-identified refiner discovery: **108 recurring manual activities**, 11 groups,
  about **$5.7M a year**, roughly 83 percent outsourced.
- One exception today: **5 desks, 4 days, about $40 a case.**
- And the hard part is not reading SAP. **An agent can be perfectly valid in the ERP and
  still be unauthorised in the business.**

**Solution**
- **Determinism decides. Agents advise. Humans sign.**
- A deterministic gate clears the bulk with no model call. Exception-handling agents reason
  only where determinism runs out. A human holds every write.
- It reasons over the **real system of record**, not synthetic data, and it is **structurally
  forbidden to write**.

> **Say, 45 s:** "The strongest case for enterprise AI is not a clever demo, it is where
> labour concentrates. In a refiner discovery we counted a hundred and eight recurring manual
> activities in procure to pay, about five point seven million dollars a year, and the largest
> single concentration was invoice processing and disputes. The S/4 migration had automated
> the transaction. It had not touched the exception. And the reason nobody points an agent at
> it is not capability. It is authority. An agent can be perfectly valid in the ERP and still
> do something the business never authorised. So I did not build a smarter agent. I built a
> governed one."

---

## Slide 4: Benefits and Technologies
*Where the template wants the table. Fill every row.*

| | |
|---|---|
| **End user** | Accounts Payable and finance operations analyst |
| **User department** | Accounts Payable and Procurement |
| **Industries** | Any SAP-run enterprise. Demoed in a hydrocarbon procure-to-pay context |
| **UiPath products** | **Maestro BPMN**, Coded Agents (LangGraph), Orchestrator, LLM Gateway, Action Center, TypeScript SDK, **UiPath for Coding Agents (Claude Code)** |
| **Other technologies** | SAP S/4HANA over MCP with XSUAA. SAP BTP OData to MCP server |

**Benefits, impact and outcomes**
- **2 min 56 s** for the whole governed instance. **57 s** of that is the agent's verdict.
- Modelled against the discovery: **about $40 a case to about $6, 4 days to minutes.**
- **Read-only by design.** The agent proposes, a human authorises, a deterministic step writes.
- **Two enterprises, one pattern.** Deployment is a config delta, not a rebuild.

> **Say, 20 s:** "The measured numbers, not modelled: the full governed instance completes in
> two minutes fifty-six, and the agent's reconciliation verdict inside it takes fifty-seven
> seconds. Modelled against that discovery, forty dollars a case becomes about six, and four
> days becomes minutes. And critically, the agent never writes."

---

## Slide 5: Architecture, the iceberg
*Show this before the demo. One diagram, three layers, the Three Laws as the labels.*

```
                    ▲  HUMAN            sole write authority
                   ╱ ╲                  Law 1: authorised before acting
    ~~~~~~~~~~~~~~╱~~~╲~~~~~~~~~~~~~~   waterline
                 ╱ EXCEPTION AGENTS ╲   matching · variance · posting-prep
                ╱  reason only where  ╲ read-only, no write tool bound
               ╱   determinism ends    ╲Law 2: exceptions reach a human, with evidence
              ╱─────────────────────────╲
             ╱   DETERMINISTIC MASS      ╲ tolerance gate 2% / 1 unit
            ╱    rules · gates · RPA      ╲ cleared silently, zero LLM calls
           ╱     the low-hanging fruit     ╲Law 3: every decision reconstructable
          ╱_________________________________╲
```

Under it, one line of flow with the tier labels:
`Supplier invoice → matching agent LIVE → deterministic gate LIVE → variance agent LIVE →
human gate LIVE (suspend and resume) → posting-prep agent LIVE → prepared correction HELD`

> **Say, 30 s:** "Here is the shape before I show it running. The mass below the waterline is
> deterministic: rules and tolerance gates, cleared silently, without a single model call. At
> the waterline sit exception-handling agents, and they only reason where determinism runs
> out. At the peak is the human, who is the only actor with write authority. Three kinds of
> authority, kept separate on purpose."

---

## Slide 6: The governance spine
*What is on screen while the agents are running.*

**Three Laws of the governed back office**
1. Every agent action is **authorised before it happens**.
2. Every exception reaches a **human, with evidence**.
3. Every decision is **reconstructable** afterwards.

**Second-class agents, by design.** No write tools. No authority. No autonomy over money.
Deterministic gate above them, quarantined executor below them, human at the peak.

**Stateless reasoning, stateful process.** The agents carry nothing between invoices. Maestro
carries everything between steps.

> **Say, 25 s:** "Three rules, lifted from a real finance control. What is new is not the
> rules, it is an agent that obeys them. These agents are deliberately second class. They hold
> no write tool at all. We already constrain human employees inside workflows above a spend
> threshold; these agents get exactly the same treatment. Low autonomy is the feature."

---

## Slide 7: Impact and close
*Return here after the demo. Peak and end.*

**Same pattern, two enterprises, two workloads.**

| A Gulf Coast refiner | A UK adventure travel group |
|---|---|
| 108 manual activities, 11 groups | About 200 supplier invoices a week |
| About $5.7M a year, 83 percent outsourced | Every PDF attached to S/4 by hand |
| Agents clear tolerance noise, escalate with evidence | Match by reference, propose, never write |
| **Deploy:** point at their S/4 and control matrix | **Deploy:** swap the document source |

**Three minutes, end to end, with a person still holding the pen.**
**AI is the new RPA, and it needs the same discipline RPA got.**

> **Say, 35 s:** "Same pattern, two real enterprises, two different workloads. In one it is
> exception-heavy procure to pay at a refiner. In the other it is two hundred supplier
> invoices a week at a travel group. Deploying it is swapping the document source and the S/4
> tenant. That is the adoption story. Three minutes end to end, with a person still holding
> the pen, against a real system of record. Every enterprise is about to put agents in the
> back office. AI is the new RPA, and it needs the same discipline RPA got. Thank you."

## Slide 8: Thank you, optional if the template wants it

Repo: github.com/vigneshbarani24/exchange-recon-cockpit
Devpost: (paste the URL)

---

## Criteria map, so nothing is left unearned

| Slide or beat | Criteria it scores |
|---|---|
| 1, cold open on authority | Creativity, Presentation hook |
| 3, problem with the 108 and $5.7M | **Business Impact** |
| 5 and 6, iceberg and Three Laws, shown before the demo | **Platform Usage, Creativity** |
| Live instance, three agent jobs, gate suspending and resuming | **Platform Usage, Technical Execution** |
| The PO-side tell, 25.00 and qty 5 | **Technical Execution, Creativity** |
| Claude Code on screen plus the README section | **Platform Usage bonus, up to +2** |
| 7, two value cards and the close | **Business Impact, Presentation, peak and end** |

## Build notes

1. Use the official template. Do not restyle it.
2. Slide 5's iceberg needs to be drawn properly, not left as ASCII. Reuse the palette from
   `finale/architecture/`.
3. Keep it to seven or eight. Under ten is the template rule.
4. The old `finale/AgentHack-2026-Workforce-to-Workflow.pptx` is the right shell. Its slide 5
   still says the Maestro spine is BUILT. Fix that first; it is now the strongest LIVE claim
   in the deck.
