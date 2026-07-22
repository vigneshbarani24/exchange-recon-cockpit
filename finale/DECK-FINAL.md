# DECK-FINAL.md

Finale deck, 7 slides, Mariner grammar. UiPath AgentHack 2026 finale: 5 minute
presentation plus 3 minute Q&A, two UiPath product VPs judging.

House rules honored in this file: no em dashes anywhere, never the phrase for the
supplier-invoice-PO-receipt check, no customer names (only "a UK adventure travel group"),
write-back is always HELD, auto-clear is designed, parked behind a filed platform defect,
and conservative by default. Reads are always against a live S/4HANA cloud tenant.

Each slide carries a SAY block (spoken while the slide is up, drawn from the STORYCRAFT
beats, not read off the slide) and a SHOW block (what is literally on the slide, plus the
visual). Slide text stays short. The room reads the slide once; you carry the rest.

One deviation from the brief, flagged deliberately: the title was handed to me with an em
dash. The no-em-dash rule wins, so the title uses a colon instead.

---

## Slide 1: TITLE

**SHOW**

> # Exchange Recon: we build the boring agents.
> ### The back-office work people hated, done by agents you can audit.
>
> `Maestro BPMN · 3 coded agents · live SAP S/4HANA over MCP · human gate · evidence bucket`

Visual: near-black slide, one line of stack chips along the base. Behind the title, a faint
still of the supplier invoice sitting next to the SAP purchase order line, the two numbers
that do not agree already visible. Nothing animates.

**SAY**

> A supplier invoiced us, and the numbers do not match the purchase order. Someone has to
> work out why, against the real ledger, before money moves. Most demos would now agree two
> numbers they invented. This one is about to read a purchase order it has never seen.

---

## Slide 2: THE MAP

**SHOW**

> ## One BPO contract, re-architected.
> A de-identified downstream refiner, finance and accounting.
>
> **234 tasks mapped · 187 agent-automatable · 9 human gates · 38 client-retained · 75→37 FTEs**
>
> Callout: This build is one card on that map: **Invoice reconciliation · Reconcile · Gate.**
>
> Pain anchor: **$5.7M/yr manual back-office scope · one exception: 5 desks · 4 days.**

Visual: screenshot placeholder of the public contract-map artifact, the full swim-lane
teardown. One card on it is ringed. An inset zooms that card to the Reconcile and Gate steps.
The five headline numbers sit as a single strip beneath the map.

**SAY**

> This is a real back-office contract: paying suppliers, collecting from customers, keeping
> the records clean, closing the books. Two hundred and thirty-four tasks. One hundred and
> eighty-seven are the same shape: checking, matching, chasing, reconciling. The work people
> were hired to do and hated every minute of. And exactly nine are moments where only a
> person signs. Card number one is running behind me right now, and in about a minute it
> will do the one thing demos never do. It will stop.

---

## Slide 3: THREE VERBS

**SHOW**

> ## Read. Reconcile. Prove.
>
> **Read** live S/4HANA at runtime over MCP. Handed only supplier numbers, returns the PO side.
>
> **Reconcile** deterministic tolerance rule, exception-handling agents, human authority. Kept apart.
>
> **Prove** 12/12 evals, model-validated ground truth · 21-artifact evidence bucket · every decision reconstructable.

Visual: three columns, one verb each, set in the same weight. No icons competing with the
words. The verbs are the design.

**SAY**

> We build the boring agents, and every one of them does three things. It reads the real
> ledger, live, not a copy. It reconciles: rules decide most cases in a second, the agent
> reasons only where rules run out, and a person keeps the only pen. And it proves itself:
> graded tests, evidence for every decision, so you never have to take the demo's word for it.

---

## Slide 4: THE ICEBERG AND THREE LAWS

**SHOW**

> ## Authority is a hierarchy, not a pipeline.
>
> **Peak:** the human. Sole write authority.
> **Waterline:** exception-handling agents. Reason only where determinism runs out.
> **Below the line:** determinism. 2% price, 1 unit, 1.1s, no model call.
>
> Three Laws: **authorised before acting · exceptions reach humans with evidence · every decision reconstructable.**

Visual: a single iceberg. Determinism is the large submerged mass, tagged with the tolerance
rule and 1.1s. The agents sit at the waterline. One human figure at the peak. The three Laws
run as a caption band under the image.

**SAY**

> Authority here is a hierarchy, not a pipeline. Most of the work is decided by rules finance
> already owns: two percent on price, one unit on quantity, settled in a second. The agents
> only reason about what the rules cannot settle. And at the top a person is the only actor
> who can commit anything. Reasoning is real. Authority is the problem.

---

## Slide 5: DEMO BEAT MAP

Interstitial. This slide is up for a breath, then you switch to the live screen.

**SHOW**

> ## What you are about to watch.
>
> Start instance → agents run as real jobs → suspends at the human gate → the PO-side reveal → approve → held correction → corrected and closed.
>
> **It will wait as long as it takes.**

Visual: a seven-stop horizontal beat rail, left to right, the gate stop marked as the pause
point and drawn larger than the rest. Everything downstream of the gate is dimmed until the
approval beat, so the eye lands on the wait.

**SAY**

> Here is the shape of the next couple of minutes before I switch to the live screen. It
> does four days of work in under three minutes, and then it stops, on purpose, and waits
> forever for one person. Both are the point. Then comes the moment that decides whether
> you believe me: the numbers it could only know by reading the real ledger.

---

## Slide 6: STATUS, HONESTLY

**SHOW**

> ## What is live, what is held, and where.
>
> | Capability | Status | Proven on |
> |---|---|---|
> | Composed governed runs | **LIVE** | 10 instances, 6 live POs, both gate branches |
> | Live SAP reads | **LIVE** | real tenant, runtime |
> | Evals 12/12 | **LIVE** | ground truth model-validated |
> | Human gate | **LIVE** | suspended and resumed on demand; 20s to 6min pauses observed, durable by design |
> | Flow-sent notifications | **LIVE** | Teams card + Slack on approve; Teams + Gmail + Slack on escalate (twin 1.0.16, traces committed) |
> | SLA timer on the human gate | **LIVE** | fired unattended twice; escalated on its own, then notified |
> | Auto-clear branch | **PARKED** | platform defect filed, conservative-by-default routing |
> | SAP write-back | **HELD** | by design, armed not fired |
> | Action Center | **ENABLED** | service turned on at Admin level on finale eve; task creation via an Action App is the next artifact |
> | NEXT elements | **ROADMAP** | Action App review task · Slack button approvals · Test Cloud regression · dunning + cash application on the same spine |
>
> Footer: Agents, BPMN, and cockpit built with Claude Code through UiPath for Coding Agents. When composition failed for two days, the coding agent diagnosed the platform defect. Commit trail ships with the submission (say "public" only once the repo flip is confirmed).

Visual: a plain status table, LIVE in green, PARKED in amber, HELD in a held-not-broken grey.
The footer line runs full width beneath the table in a smaller weight.

**SAY**

> I will not dress up the state. Ten completed runs across six live purchase orders, both
> endings. Twelve graded tests, all passing, checked by an independent second model. And as
> of last night the process reports its own outcomes: it tells the team in Teams and Slack
> when it finishes, adds email when it escalates, and if nobody answers within ten minutes it
> escalates itself. It cannot spend money alone. Not a policy it follows, not a promise we
> typed: the ability does not exist. When anything is uncertain it goes to a person by
> default, and every claim on this table has a record behind it.
> And the agents, the BPMN, and the cockpit were built with Claude Code: when composition failed
> for two days, the coding agent diagnosed the platform defect, and the commit trail ships
> with the submission.

---

## Slide 7: THE TAKE

**SHOW**

> ## The pilot pays for the platform.
>
> **2:56 end to end · 0 write tools bound · 100% of decisions reconstructable**
>
> Adoption: a UK adventure travel group, ~200 supplier invoices a week; funded pilot, proven live on a real S/4HANA cloud tenant.
>
> ROI, modeled on pilot volumes with stated assumptions: 200 invoices/week, assuming ~15% exceptions and ~12 min of manual PO lookup per exception = ~6 analyst-hours/week on the judgment step; the agent's measured verdict is 57 seconds, human approval retained ≈ **~5.5 analyst-hours/week reclaimed (modeled)**.
>
> **Deterministic AI is the new RPA.**

Visual: outcome triptych across the top, three numbers on equal footing. The adoption line and
the single labeled ROI line sit mid-slide. The closing sentence anchors the base in the largest
type on the slide.

**SAY**

> Two businesses, one pattern. A refiner whose manual back office runs to millions a year,
> where one exception costs five desks and four days. And a UK adventure travel group with
> two hundred supplier invoices a week that would flow through exactly this gate; that pilot
> is funded and proven live. On those volumes this returns roughly five and a half analyst
> hours a week. That number is a model, and the slide says so. Call it most of somebody's
> Friday, handed back every week, with a person still holding the pen. Reconciliation is
> card number one; there are one hundred and eighty-six more on the map, and not one needs
> a second project: the gate stays, the rulebook stays, only the checking changes. Every
> one of them is boring. And boring is a feature. Boring is what auditors sign.
> Deterministic AI is the new RPA, and this platform is giving it the same discipline it
> gave RPA the first time. Thank you.

---

## Slide 8: THE ROADMAP IS A MAP (optional 8th slide, or the backing slide for Q&A)

**SHOW**

> ## One card is live. The map is the roadmap.
>
> Left: screenshot of the public contract-map artifact ("The contract, re-architected"):
> **234 tasks mapped · 187 agent-automatable · 9 human gates · 38 client-retained · 75→37 FTEs**,
> with the live card ringed: Invoice reconciliation · Reconcile · Gate.
>
> Right, the KPI wiring, labeled honestly:
> **Measured today:** 2:56 governed end to end · 57s agent verdict · ~2s flow-sent notification ·
> 10-minute gate SLA · both endings notified in Teams, Slack, Gmail.
> **Next sprint:** these per-run metrics feed Insights (enabled on this tenant on finale eve)
> as straight-through rate, hours reclaimed, and exception mix per supplier.
> **Then:** the next cards on the same spine: dunning, cash application, goods-receipt matching.

Visual: the artifact screenshot carries the left half; the right half is three short stacked
bands (Measured today / Next sprint / Then). One ring, one arrow from the ringed card to the
Measured band.

**SAY**

> Every number on the left is a real contract, taken apart task by task, and the ringed card is
> the one running live behind me. The right side is deliberately honest: today we measure the
> run itself, the next sprint feeds those measurements into Insights as business KPIs, and the
> cards after this one reuse the same three pieces: exception agents, a human gate, a governed
> policy. The pilot pays for the platform.

---

## Paste-up notes

- **Font sizes.** Slide titles 40pt and up. Body and table text 24pt and up. The one number
  you want the room to keep from each slide goes larger than everything around it: the tolerance
  gate on slide 4, the wait line on slide 5, the outcome triptych and the closing sentence on
  slide 7.
- **One idea per slide.** Title states the thesis. Map proves the pain is a real contract, not a
  hypothetical. Three Verbs is the whole architecture in three words. Iceberg is the hierarchy of
  authority. Beat Map preloads the demo so the live screen needs no narration to be legible.
  Status is the honesty beat. Take is the stance, not a summary. If a slide argues two things,
  cut one.
- **Slide text never duplicates the spoken beat.** The SHOW blocks are anchors the eye catches
  once; the STORYCRAFT beats are what you say over them. Do not put the spoken sentences on the
  slides.
- **The coding-agent evidence beat lives on slide 6.** It is the status-table footer plus the
  spoken line in the slide 6 SAY block. This is the beat that re-earns the +2: the coding-agent
  bonus is not banked from submission, it is applied again inside Platform Usage in Phase 2
  judging, on the same scale. Land the binding-resolution diagnosis and the public commit trail
  out loud, not just on the slide.
- **Demo timing.** Start the instance at 0:20, immediately after the slide-1 cold open, and say
  you are doing it ("I am starting the process now; it takes about three minutes, so let me tell
  you why it is built this way while it runs"). Talk over slides 2 through 5, and switch to the
  live screen at about 2:10 as the instance arrives at the gate. The gate wait is the dramatic
  beat, not dead air. The PO-side reveal at about 2:35 is the peak; slow down there. Hold the
  last ten seconds after the close and do not fill them.
- **Vocabulary lock.** Live S/4HANA cloud tenant, never production ERP. HELD, never broken.
  Auto-clear is designed, parked, conservative by default. No customer name ever leaves your
  mouth. Never name the supplier-invoice-PO-receipt check by its industry phrase.
