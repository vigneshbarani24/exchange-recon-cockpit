# Business Case — Invoice-to-PO Reconciliation

The problem is real money paid against a supplier invoice that doesn't match the
purchase order. This is the quantified case for the agentic flow, as a **model you
can defend** — every input is labeled, so a judge (or a CFO) can re-run it with
their own numbers.

> **Inputs below are ILLUSTRATIVE** for a representative mid-market AP / procurement
> operation. Replace with validated baselines before publishing. The *structure*
> is the point; the figures are placeholders.

## The cost of the manual status quo

A supplier invoice arrives and has to be matched against the purchase order in
SAP before AP pays. When the price, quantity, or material doesn't line up beyond
tolerance, an analyst reconciles by hand — pulling the PO, comparing it line by
line to the invoice, working out *which* discrepancy it is (price variance,
over-delivery, short-ship, wrong material), chasing the buyer or supplier, then
documenting the correction. It's slow, inconsistent analyst-to-analyst, and every
invoice that sits on the exception queue is either a late-payment risk or an
overpayment waiting to happen.

## Model

| Input | Illustrative value | Where it comes from |
| --- | --- | --- |
| Supplier invoices / month | 4,000 | AP intake volume |
| Exception rate (mismatch beyond tolerance) | 12% → **480 / month** | 3-way-match fail rate |
| Manual minutes / exception | 35 | analyst pulls PO, compares lines, classifies, documents |
| Agent-assisted minutes / exception | 5 | review the agent's explanation, approve or escalate |
| Analyst loaded rate | $65 / hr | fully-loaded cost |
| Avg $ at risk / exception | $9,000 | invoice line value exposed to over/underpayment |
| Current leakage rate (overpay / duplicate / penalty) | 1.5% | slow/inconsistent resolution |

## Outputs (from the illustrative inputs)

- **Time per exception:** 35 → 5 min — **~86% faster**, and *consistent* (every
  exception gets the same rigor and an audit trail).
- **Analyst time recovered:** 30 min × 480 / month ≈ **240 hrs / month ≈ 2,880 hrs
  / year** — roughly **1.5 FTE** freed for higher-value work.
- **Labor saved:** 2,880 hrs × $65 ≈ **$187,000 / year**.
- **Exposure handled faster:** 480 × 12 × $9k ≈ **$52M / year** of invoice value
  now reconciled in minutes, not hours — paid right or held, not paid blind.
- **Leakage avoided (upside):** halving a 1.5% leakage rate on that exposure ≈
  **$389k / year** — softer, but the real prize. *(Label clearly; this is the
  sensitivity case, not a guarantee.)*

## Grounded in published benchmarks

The illustrative numbers sit inside published industry ranges, so the model holds
even before AP actuals go in:

- **~30% of finance teams' time goes to manual reconciliation** (PwC) — the labor
  pool this attacks is large and well-documented.
- **AI-assisted reconciliation runs ~85% faster** than manual, with **~90% of the
  process automatable** — our ~86% per-exception reduction is *consistent with*
  this, not optimistic.
- Manual reconciliation's hidden costs — overpayments, duplicate payments,
  late-payment penalties, analyst burnout — are widely reported; the governance
  here (audit trail, named human approver) attacks those directly.

Sources: PwC via [Simplus](https://www.simplus.com/costs-manual-reconciliation/) ·
[reconciliation automation statistics](https://resolvepay.com/blog/17-statistics-that-prove-automated-reconciliation-slashes-month-end-close) ·
[BlackLine finance KPIs](https://www.blackline.com/blog/22-financial-kpi-metrics-for-future-ready-financial-operations/)

## Why agentic, not just RPA

RPA can move data; it can't *read a supplier invoice against a live PO and explain
why they disagree* — is this a price variance, an over-delivery, the wrong
material? That classification is the agent's job. But the agent **only reads SAP
and never posts** — deterministic rules do the tolerance check and the PO-item
write-back, the human authorizes. That governance is what makes it adoptable in a
finance function: speed *with* control, not speed *instead of* control.

## This mirrors a real enterprise control

Invoice-to-PO reconciliation (3-way match) is a documented, mandatory AP control.
The sequence is well established:

1. Receive the supplier invoice.
2. Pull the matching purchase order from the system of record (S/4HANA).
3. **Reconcile the two and identify discrepancies / variances.** ← the agent's judgment
4. **Classify the discrepancy and identify the correction.** ← the agent's proposal
5. **A human approves the correction before anything is changed or paid.** ← the human gate
6. Post the approved PO-item update. ← deterministic, only after approval

Steps 3–4 are exactly what the matching and variance agents do; step 5 — *approval
before posting* — is a real, mandatory control, not a design nicety. Our
governed-agency split isn't invented to look responsible; it reproduces how this
work is actually governed today, which is precisely why it's adoptable: it
automates the judgment without removing the control. And because the agents reach
SAP read-only over MCP, the system of record stays sacred — they propose, they
never write.

## Adoption & scale

- **Scales by adding suppliers / spend categories**, not by adding headcount — the
  same flow, same governance.
- **Drop-in to existing AP cycles**: it sits on the exception queue, not the happy
  path, so it earns trust on the hard cases first.
- **Auditable by construction**: every decision is a Maestro instance + an Action
  Center task with a named human approver, against the real PO in S/4.

---

*Replace the illustrative inputs with AP baselines: invoices/month, exception
rate, manual vs assisted minutes, loaded rate, avg exposure, leakage rate.*
