# Business Case — Exchange Settlement Reconciliation

The problem is real money moving on two statements that disagree. This is the
quantified case for the agentic flow, as a **model you can defend** — every input
is labeled, so a judge (or a CFO) can re-run it with their own numbers.

> **Inputs below are ILLUSTRATIVE** for a representative refinery exchange desk.
> Replace with validated baselines before publishing. The *structure* is the
> point; the figures are placeholders.

## The cost of the manual status quo

A crude-exchange settlement between a refiner and a counterparty produces two
statements. When they disagree beyond tolerance, an analyst reconciles by hand —
reading both documents, chasing the difference across the ledger and the
counterparty's basis, then documenting the correction. It's slow, inconsistent
analyst-to-analyst, and every hour a variance sits unresolved is $ exposure.

## Model

| Input | Illustrative value | Where it comes from |
| --- | --- | --- |
| Exchange settlements / month | 400 | exchange desk volume |
| Variance rate (beyond tolerance) | 18% → **72 / month** | tolerance-check fail rate |
| Manual minutes / variance | 45 | analyst reads 2 statements, reconciles, documents |
| Agent-assisted minutes / variance | 6 | review the agent's explanation, approve or escalate |
| Analyst loaded rate | $75 / hr | fully-loaded cost |
| Avg $ exposure / variance | $40,000 | settlement value at risk |
| Current leakage rate (write-off / dispute) | 2% | slow/inconsistent resolution |

## Outputs (from the illustrative inputs)

- **Time per variance:** 45 → 6 min — **~87% faster**, and *consistent* (every
  variance gets the same rigor and an audit trail).
- **Analyst time recovered:** 39 min × 72 / month ≈ **47 hrs / month ≈ 560 hrs /
  year** — roughly a **third of an FTE** freed for higher-value work.
- **Labor saved:** 560 hrs × $75 ≈ **$42,000 / year**.
- **Exposure handled faster:** 72 × 12 × $40k ≈ **$35M / year** of settlement
  variance now cleared in minutes, not hours.
- **Leakage avoided (upside):** halving a 2% leakage rate on that exposure ≈
  **$345k / year** — softer, but the real prize. *(Label clearly; this is the
  sensitivity case, not a guarantee.)*

## Grounded in published benchmarks

The illustrative numbers sit inside published industry ranges, so the model holds
even before desk actuals go in:

- **~30% of finance teams' time goes to manual reconciliation** (PwC) — the labor
  pool this attacks is large and well-documented.
- **AI-assisted reconciliation runs ~85% faster** than manual, with **~90% of the
  process automatable** — our ~87% per-variance reduction is *consistent with*
  this, not optimistic.
- Manual reconciliation's hidden costs — errors, reporting delays, analyst
  burnout — are widely reported; the governance here (audit trail, named human
  approver) attacks those directly.

Sources: PwC via [Simplus](https://www.simplus.com/costs-manual-reconciliation/) ·
[reconciliation automation statistics](https://resolvepay.com/blog/17-statistics-that-prove-automated-reconciliation-slashes-month-end-close) ·
[BlackLine finance KPIs](https://www.blackline.com/blog/22-financial-kpi-metrics-for-future-ready-financial-operations/)

## Why agentic, not just RPA

RPA can move data; it can't *read two mismatched statements and explain why they
disagree*. That judgment is the agent's job. But the agent **never posts and
never moves money** — deterministic rules do the math and the ledger write, the
human authorizes. That governance is what makes it adoptable in a finance
function: speed *with* control, not speed *instead of* control.

## Adoption & scale

- **Scales by adding counterparties / products**, not by adding headcount — the
  same flow, same governance.
- **Drop-in to existing close cycles**: it sits on the exception queue, not the
  happy path, so it earns trust on the hard cases first.
- **Auditable by construction**: every decision is a Maestro instance + an Action
  Center task with a named human approver.

---

*Replace the illustrative inputs with desk baselines: settlements/month, variance
rate, manual vs assisted minutes, loaded rate, avg exposure, leakage rate.*
