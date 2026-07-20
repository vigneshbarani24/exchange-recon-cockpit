# ROADMAP.md — where this goes (adoption + extension)

The finale demo is **agent #1** of a governed back office. This is the adoption and extension story — the "what's next" that makes the business case real, not hypothetical.

## The thesis (Workforce → Workflow)
Enterprise AI pays off where labour concentrates on repeatable work. This governed reconciliation agent takes one slice of the repeatable 75% of the AP back office. The **same governed pattern** — Maestro holds the authority, a human gate for exceptions, everything audited — extends to the rest: PO creation, goods-receipt matching, dispute triage, statement reconciliation, dunning. One control model, many agents.

## The adoption anchor (real, not illustrative)
This isn't hypothetical. A **live UK travel-sector customer** has exactly this pain: **~200 supplier invoices a month land in SAP automatically, but attaching each invoice to its matching purchase order is fully manual.** That is precisely the workflow this agent governs — a real, funded POC, which is the strongest "adoption likelihood" signal there is. *(Customer anonymized for the public submission.)*

## The next extension: real invoice ingestion (UiPath IXP)
Today the agent reconciles a supplier *document* passed as structured text. The natural next step — and exactly what the customer needs — is to **ingest the real supplier invoice PDF and extract it with UiPath IXP / Document Understanding**, then feed the extracted lines into the same governed reconciliation. That adds one more UiPath product to the stack and closes the loop from "invoice arrives" to "matched, reconciled, human-approved."

## Two-layer governed agency (Warden + UiPath)
Governance here is deliberately two layers:
- **Policy — Warden (cross-platform decide-gate):** every agent action is checked against policy *before* it runs — the same agents, any platform, one governance contract. Warden answers **"may it act?"**
- **Execution — UiPath (Maestro + Action Center + audit):** the workflow holds the authority, a human approves exceptions, every action is audited. UiPath answers **"how does it execute, who approves, and can we reconstruct it?"**

This composition is what makes governed agency portable: the policy decision is platform-agnostic (Warden); the execution governance is where the work runs (UiPath). **Honest scope for the finale:** the live, proven governance in the demo is **UiPath-native**; Warden is the policy layer that generalizes it across the estate — shown as architecture, not claimed as wired into this demo.

## The arc in one line
One governed reconciliation agent, proven live on real SAP → real invoice ingestion via IXP → the rest of the repeatable back office → all under a two-layer governance contract (policy + execution). That's the Workforce-to-Workflow shift, made safe.
