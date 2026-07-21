# VALUE.md

The business case. Two anonymised proof cases, one pattern, and the modelled numbers that
close the weakest criterion in the submission.

**Anonymisation is absolute.** No customer name, no logo, no brand, no document excerpt, in
the repo, the deck, the script, the demo or Devpost. Card A is "a Gulf Coast refiner". Card
B is "a UK adventure travel group". The fictional demo tenant is Calder Refining. Mariner is
KaarTech's own product name and is allowed.

---

## Why two cards and not one customer story

A single named customer is a stronger Business Impact claim only if the deployment is real
and nameable. Neither of these is nameable. Two independent enterprises, two different
workloads, one governed pattern, and a deployment delta measured in configuration is a
better answer to Adoption Potential than one anecdote, and it is honest.

**The spoken line:** "Same pattern, two real enterprises, two different workloads. Deploying
it is swapping the document source and the S/4 tenant."

---

## Card A: a Gulf Coast refiner

Source: a real de-identified P2P discovery for a US refiner running an outsourced finance
back office. Activity counts are observed. Cost figures are benchmark-range models for an
operation at that scale and were presented to the client as illustrative. Say them that way.

| | |
|---|---|
| **WHO** | A US refiner running an outsourced finance back office, post S/4 migration |
| **VOLUME** | **108 recurring manual activities** across **11 process groups** in procure to pay |
| **TODAY** | About **$5.7M a year** for that manual scope, roughly **83 percent provider run**. One exception touches **5 desks over 4 days at about $40 a case** |
| **WITH THE PATTERN** | Exception-handling agents clear tolerance noise and escalate true exceptions with evidence. Modelled at **1 gate, about 12 minutes, about $6 a case** |
| **TO DEPLOY** | Point the agents at their S/4 tenant and their control matrix |

### The insight that sells it

**The migration automated the transaction. It did not automate the exception.** Clean
transactions now clear on their own. Every break, dispute and reconciliation still routes to
a person, and that manual scope never left the invoice. This is why post-ERP-migration
enterprises are exactly the buyers for governed exception agents, and it is a sharper
problem statement than "AP is slow".

### Where the 108 sit, and why this workload was picked

| Group | Activities |
|---|---|
| Invoice processing and disputes | 32 |
| Payment processing | 19 |
| Audit, reconciliation and close | 15 |
| Vendor master and MRD | 10 |
| Supplier helpdesk | 6 |
| Legal and fiscal | 6 |
| Invoice receipt by email | 5 |
| Supplier enablement | 5 |
| Invoice download from portals | 4 |
| Mail handling and scanning | 3 |
| Debt collections | 3 |

Invoice processing and disputes is the largest single concentration at 32 of 108, which is
why invoice-to-PO reconciliation is the first agent and not an arbitrary choice.

### The sequencing formula, and it doubles as the scalability answer

**Exception density, times provider ownership, times portfolio concentration, equals agentic
heat.** Is the work genuinely agentic, is it cashable, and does enough of it sit in one
place. That ordering is what turns one agent into a programme: about **90 days to the first
group live**, each group self-funding the next, one gate and one audit trail across all of
them. When a judge asks how this scales, this is the answer. It scales by process group, not
by invoice.

---

## Card B: a UK adventure travel group

Source: the Mariner pilot. This is a pilot-track engagement with a watch-only ramp.
**Permitted phrasing: capabilities proven live on a real S/4HANA Cloud tenant, customer
tenant onboarding. Never say deployed at.**

| | |
|---|---|
| **WHO** | A UK travel group whose booking system already posts supplier invoice data into S/4 automatically |
| **VOLUME** | About **200 supplier invoices a week** |
| **TODAY** | Every PDF attached to its S/4 entry by hand, one at a time, as a weekly exercise from a shared folder |
| **WITH THE PATTERN** | Mariner matches the file to the invoice by reference and company code, proposes, never writes. Four eyes above **£25,000**. Append-only hash-chained ledger |
| **TO DEPLOY** | Swap the document source to SharePoint and point at their S/4 tenant. That is the whole migration |

### The details worth borrowing

- **Zero documents read. The filename is the key.** The agent matches on reference and
  company code against released OData. It never opens the PDF. That is a governance choice
  that also removes an entire class of extraction risk, and judges notice it.
- **The trust ramp is the adoption mechanism.** Watch-only, then ask-me-first, then trusted,
  with every promotion recorded on the audit chain. Autonomy is earned in stages on the
  customer's clock, not granted at go-live. This is the single most credible answer to "how
  do enterprises actually adopt this".
- **Proven live** on a real S/4HANA Cloud tenant with a real archive receipt returned, human
  approval and four-eyes enforced against verified sign-in, and a per-document ledger.

---

## The modelled number for the demoed workload

Use this when asked for ROI on the AgentHack build itself. State the method, then the
number, then the caveat. Never lead with a currency figure you cannot derive on the spot.

- **Measured, not modelled:** the variance agent produced a full reconciliation verdict,
  both lines classified with prepared corrections and a 0.95 confidence, in **57 seconds
  inside the composed Maestro instance** (job `ebee41c4`). The whole instance, three agents
  plus both gates, completed in **2 minutes 56 seconds**.
- **The comparison:** in the refiner discovery, one exception of this shape touches 5 desks
  over 4 days.
- **The honest claim:** this compresses the judgment step, not the whole process. The human
  still signs. The value is analyst hours reclaimed on reconciliation, not headcount removed.
- **The modelled figure, labelled:** about **$40 a case to about $6 a case**, and 4 days to
  minutes, from the de-identified discovery model at that scale.

**The spoken close:** "Three minutes, end to end, with a person still holding the pen. In
the discovery that shaped this, the same exception took five desks and four days."

---

## Rules for using these numbers

1. Always attach the qualifier. Observed activity counts are observed. Cost and cycle time
   are modelled at benchmark ranges. Say which is which; the credibility is the point.
2. Never present Card A or Card B as a UiPath deployment. They are the workloads that prove
   the pattern is real. The UiPath build is the governed implementation of that pattern.
3. Card B's attachment capability stays narrative. Do not rebuild it in the demo tenant.
4. If asked "is this a hackathon toy", the answer is these two cards, in this order, in
   about twenty seconds.
