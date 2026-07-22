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

> # Exchange Recon: the governed back office.
> ### Exception work, handed to agents you can audit.
>
> `Maestro BPMN · 3 coded agents · live SAP S/4HANA over MCP · human gate · evidence bucket`

Visual: near-black slide, one line of stack chips along the base. Behind the title, a faint
still of the supplier invoice sitting next to the SAP purchase order line, the two numbers
that do not agree already visible. Nothing animates.

**SAY**

> A supplier invoiced us, and the price and quantity do not match the purchase order in SAP.
> Someone has to work out why, against the live system of record, before money moves. Most
> agentic demos would now agree two numbers they invented. This one is about to read a
> purchase order it has never seen.

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

> This is a real back-office contract, taken apart task by task. The migration automated the
> transaction and left the exception human: five desks, four days, real money. Our build is
> one card on that map, and an agent can be perfectly valid in the ERP and still be
> unauthorized in the business.

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

> The whole build is three verbs. Read means the agent reaches into the live cloud tenant at
> runtime: it is handed only the supplier's numbers and comes back with the PO side, which it
> could only know by reading SAP. Reconcile keeps determinism, agent judgment, and human
> authority in separate hands, and Prove is why you do not have to take the demo's word for it.

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

> So the architecture is a hierarchy of authority. Below the waterline, determinism: a
> tolerance rule, two percent on price, one unit on quantity, one second, no model call at
> all. At the waterline the agents reason only where determinism runs out, and at the peak a
> person is the only actor who can commit anything. Reasoning is real. Authority is the problem.

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

> Here is the shape of the next couple of minutes before I switch to the live screen. Three
> agents run as real Orchestrator jobs inside one instance, the process suspends at the human
> gate, and then comes the moment that decides whether you believe me: the PO-side reveal.
> After a person approves, it prepares the correction and holds it. It will wait as long as it takes.

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

> I will not dress up the state. Ten composed runs across six live purchase orders on both
> gate branches, evals twelve of twelve with model-validated ground truth, and on the eve of
> this presentation the enriched twin began sending its own notifications: a Teams card and
> Slack message on approve, a full Teams, Gmail, and Slack sweep on escalate, and a ten-minute
> SLA timer that fired unattended, twice. Write-back is held by design, and the auto-clear
> branch is parked behind a filed platform defect with the conservative path as the default.
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
> **AI is the new RPA, and it needs the same discipline RPA got.**

Visual: outcome triptych across the top, three numbers on equal footing. The adoption line and
the single labeled ROI line sit mid-slide. The closing sentence anchors the base in the largest
type on the slide.

**SAY**

> Two enterprises, one pattern: a refiner whose manual back office, the one this exception
> lives in, runs to millions a year, and a UK adventure travel group whose two hundred supplier
> invoices a week would flow through exactly this gate; the pilot is funded and proven live on
> a real S/4HANA cloud tenant. On those volumes the model, with its assumptions stated,
> reclaims roughly five and a half analyst-hours a week, with a person still holding the pen. The industry spent this month arguing who owns the
> model. The back-office question is who owns the decision, and here the answer is always a
> person. AI is the new RPA, and it needs the same discipline RPA got. Thank you.

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
