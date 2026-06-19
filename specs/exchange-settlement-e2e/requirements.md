# Requirements — Exchange Settlement lifecycle (end-to-end, multi-agent, MCP→S/4)

EARS notation. The system is a UiPath Maestro BPMN process orchestrating multiple coded
agents over live SAP S/4HANA data reached through the SAP Cloud VB MCP server.

## Functional

- **R1** WHEN a counterparty settlement statement is received for an exchange contract
  THE SYSTEM SHALL retrieve our own G/L position (journal-entry line items) for that
  contract from S/4HANA via the MCP server.
- **R2** WHEN our position and the counterparty statement are both available THE SYSTEM
  SHALL align their line items (matching agent) and compute the net variance with units
  and currency.
- **R3** WHEN the net variance is within tolerance THE SYSTEM SHALL auto-clear, post the
  settlement, record the outcome, and close — no human needed.
- **R4** WHEN the net variance exceeds tolerance THE SYSTEM SHALL invoke the variance
  agent to explain the cause, classify it, score confidence, and propose a correction.
- **R5** WHEN a correction is proposed THE SYSTEM SHALL route it to a human reviewer for
  approval before any posting.
- **R6** WHEN a human approves a correction THE SYSTEM SHALL prepare the S/4 journal-entry
  payload (posting-prep agent) and post it to S/4HANA via a **deterministic** step.
- **R7** WHEN a human escalates THE SYSTEM SHALL route to the trading desk and SHALL NOT
  post anything.
- **R8** WHEN the case is posted or escalated THE SYSTEM SHALL close the case and notify.

## Governing constraints (non-negotiable)

- **R9** THE SYSTEM SHALL ensure no agent ever posts to S/4 or moves money. Agents only
  read, match, explain, and recommend; the only write is the deterministic post step,
  and only after human approval.
- **R10** THE SYSTEM SHALL keep MCP/S4 credentials out of source control (env / UiPath
  assets / BTP service key).
- **R11** WHEN an S/4 read or write fails THE SYSTEM SHALL surface the error and route to
  a human rather than guessing or posting on partial data.

## Success criteria (for the submission)

- A full Maestro instance runs on the tenant: intake → S/4 read (MCP) → match →
  reconcile → human approve → deterministic post back to S/4 → close.
- The variance is computed from **real S/4 G/L lines** pulled at runtime, not from a
  synthetic input string.
- The posted journal entry is verifiable by reading it back from S/4 via MCP.
- Demo optimized for a live run against real S/4 (judge-reproducibility not required).
