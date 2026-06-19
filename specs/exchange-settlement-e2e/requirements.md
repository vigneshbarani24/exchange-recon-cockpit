# Requirements — Procure-to-Pay PO Reconciliation (end-to-end, multi-agent, MCP→S/4)

EARS notation. A UiPath Maestro BPMN process orchestrating multiple coded agents over
**live SAP S/4HANA Cloud** purchase-order data, reached through the **SAP Cloud VB MCP**
(`API_PURCHASEORDER_PROCESS_SRV` on the connected S/4HANA Cloud system).

> Domain note: the connected S/4 exposes Business Partner, Purchase Order (rich, writable),
> and Product — **no Finance/G/L**. So the process is grounded in **procurement**: reconcile
> an inbound supplier document against the live PO and post the approved correction back.

## Functional

- **R1** WHEN a supplier document (order confirmation / invoice) referencing a PO is
  received THE SYSTEM SHALL retrieve the live PO header, items, and pricing from S/4 via MCP.
- **R2** WHEN the PO and the supplier document are available THE SYSTEM SHALL align supplier
  lines to PO items (matching agent) and compute per-line variances (price, quantity,
  material, unit, currency, tax).
- **R3** WHEN every line variance is within tolerance THE SYSTEM SHALL auto-approve, record
  the outcome, and close — no human needed.
- **R4** WHEN any line variance exceeds tolerance THE SYSTEM SHALL invoke the variance agent
  to explain the cause, classify it, score confidence, and propose a PO correction.
- **R5** WHEN a correction is proposed THE SYSTEM SHALL route it to a human (buyer) for
  approval before any write to S/4.
- **R6** WHEN a human approves THE SYSTEM SHALL prepare the PO-item update payload
  (posting-prep agent) and update the PO item in S/4 via a **deterministic** step.
- **R7** WHEN a human escalates THE SYSTEM SHALL route to the buyer/desk and SHALL NOT write.
- **R8** WHEN the case is updated or escalated THE SYSTEM SHALL close the case and notify.

## Variance categories (procurement)
price-variance · quantity-variance · uom-mismatch · material-mismatch · currency-mismatch ·
tax-variance · missing-line · duplicate-line · over-delivery · under-delivery

## Governing constraints (non-negotiable)

- **R9** THE SYSTEM SHALL ensure no agent ever writes to S/4. Agents read, match, explain,
  and recommend; the only write is the deterministic update step, only after human approval.
- **R10** THE SYSTEM SHALL keep MCP/S4 credentials out of source control (env / UiPath
  assets / BTP service key).
- **R11** WHEN an S/4 read or write fails THE SYSTEM SHALL surface the error and route to a
  human rather than guessing or writing on partial data.

## Success criteria

- A full Maestro instance runs on the tenant: intake → PO read (MCP) → match → reconcile →
  human approve → deterministic PO-item update in S/4 → close.
- Variances are computed from a **real S/4 PO** pulled at runtime (e.g. PO `4500000000`,
  company code 1110, supplier 11300001), not synthetic data.
- The PO update is verifiable by reading the PO item back from S/4 via MCP.
- The inbound supplier document may be synthetic (crafted with deliberate variances); the
  PO it reconciles against is real. Demo optimized for a live run.
