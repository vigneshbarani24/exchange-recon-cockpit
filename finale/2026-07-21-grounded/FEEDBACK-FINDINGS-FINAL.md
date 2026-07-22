# Product findings, consolidated and trace-backed (final, 2026-07-22 night)

The definitive list for the UiPath feedback form and the Best Product Feedback story.
Every finding carries its evidence: instance IDs live on tenant hackathon26_751
(Shared/ExchangeReconCanvas and Shared/ExchangeReconTeams), traces committed under
finale/maestro/. The Q10/Q11 survey text in PRODUCT-FEEDBACK.md is frozen as submitted;
this file supersedes its addendums for numbering and adds the finale-eve results.

## The one-line thesis

Validation and runtime disagree, and the executable truth for agent, connector, HTTP,
and rule tasks lives in canvas-generated configuration that no hand-authored BPMN,
documented or reverse-engineered, can supply. Everything below is a facet of that.

---

## A. The expensive one

**F1. StartAgentJob bindings validate, deploy, and then fault at runtime (170005).**
Packer demands binding-backed name/folderPath and rejects literal releaseKey/folderId,
yet nothing in pack or deploy resolves the bindings. pack --dry-run says Valid, publish
and deploy succeed, first agent task faults with "Required field 'releaseKey' missing".
Proven across five authoring variants over two days. Cure: Studio Web canvas round-trip
(emits releaseKey bindings with propertyAttribute Key, StartAgentJob v2 payloads, agents
as in-solution resources). Ask: resolve at pack/deploy or fail loudly at pack naming the
element; 170005 should name the unresolved binding.
Evidence: June fault traces; working proof instance 2db6d4d8 (2:56, package 1.0.5).

**F2. The same law, proven again on finale eve: connector, HTTP, and rule task
executable config is canvas-generated and cannot be hand-authored (positive: the canvas
round-trip cures all of them).**
Versions 1.0.7 through 1.0.13 tried every documented and reverse-engineered shape:
context fields, hand-authored connection bindings, literal connection ids, merged JSON
body inputs, split value-attribute inputs. Results: connection always null, method
always empty, inputs eventually arriving EMPTY. After a Studio Web round-trip and
designer re-pick (1.0.16), the same flow sends live: Teams card and Slack message on the
approve ending (instance 6b2ecc38), full Teams, Gmail, Slack sweep on escalate (instance
1021b02a). Ask: document that runtime config for Intsvc and rule tasks is
designer-generated, or make the serialized carrier authorable and documented.
Traces: twin-1016-notifications-approve / -escalate-element-executions.json.

## B. Script-task engine findings

**F3. Script output mappings never populate; the engine double-wraps and re-cases I/O.**
Instance bc46e3eb captures it in one frame: the script's computed result exists in the
execution record as Response.Response.PricePct 10 / QtyUnits 1 / LineValue 1375
(PascalCased, double-wrapped), while every declared output mapping (written against the
documented single-wrap response.pricePct shape) leaves its variable null. Inputs show the
mirror image: Args.Args.MatchedLines. Consequence: no downstream consumer (gateway
condition, rule input, notification body) can ever read a script result via mappings.
This widens the submitted finding "auto-approve gateway condition unreachable" to its
true scope. Traces: twin-108-green (870263b2, all outputs null) and the bc46e3eb capture.

**F4. Script tasks fault on bare variable references after a canvas republish; the
failure is a hard instance fault, not a caught error.**
Post-round-trip, `var lines = matchedLines;` faults with 400300 (input evaluation) and
`reviewerNote` with 300501 "reviewerNote is not defined" (instances f1a276d9, bc46e3eb).
The same scripts ran for six CLI-published versions. Workaround now in both scripts:
typeof-guarded input discovery plus key normalization ("throw-proof pattern"). Ask:
stable, documented variable injection for script tasks across authoring paths.

**F5. Input-expression evaluation failures bypass boundary error events.**
Error 400300 on an input expression (indexing an empty list) marks the element Failed
and faults the instance, but the attached boundary error event never fires: the failure
precedes task execution. A fully boundary-shielded flow can still die unhandled on a
data-shape surprise. Instance e387d1ec. Ask: route pre-execution failures through the
boundary path or provide a flow-level error handler.

**F6. Positive: =js: expressions inside JSON body inputs evaluate correctly,** including
multi-statement function bodies computing over an agent's structured output. This was
the working lane around F3 (instance 21230b01 shows inline-computed 10/1/1375 arriving).

## C. Business rules

**F7. Orchestrator.BusinessRules task [Preview] rejects correct arguments under every
authoring path.**
With correct snake_case names and real numeric values delivered (portal argument view,
instance 21230b01: price_variance_pct 10, qty_variance_units 1, line_value_gbp 1375),
the task returns 400 "Invalid business rule task arguments / Invalid activity input".
Same result canvas-wired (1.0.15/1.0.16, instance bc46e3eb onward) with picker-bound
inputs (null due to F3) and with the twin folder's own linked rule id. The DMN artifact
itself validates, renders, and versions in the portal. No public execution endpoint
exists to cross-check the engine (OData GET on the linked folder returns "BusinessRule
does not exist"; every execute-shaped POST returns 405). In earlier canvas-folder tests
the task terminated sub-second with no incident. Boundary catch proven as mitigation on
every run. Ask: make the Preview task's argument contract observable, and expose a rule
execution endpoint for testing.

## D. Action Center

**F8. Actions is unprovisioned by default on hackathon tenants, and after self-enabling,
no API-creatable task type is usable without an Action App.**
Corrected from the earlier "entitlement-blocked" reading: the service CAN be enabled by
the org admin (Admin > Tenant > services), which we did on finale eve; the inbox and
odata/Tasks (served by actions_) came alive. But GenericTasks/CreateTask returns 400
"This operation is allowed only for the action types: {0}" (note the unformatted {0}
placeholder shipping in a production error string), and FormTasks/ExternalTasks creation
routes return 405. Only AppTasks remain, requiring a built Action App. Consequence for
the hackathon: HITL surfaces defaulted to unavailable for any team that did not find the
Admin switch. Ask: provision Actions by default alongside ProcessOrchestration, fill the
{0} placeholder, and document which task types each build exposes.

## E. Toolchain and platform edges (from the submitted survey, still standing)

**F9.** Skill/validator fixtures produce BPMN that validates but cannot run (the F1
class); coding agents calibrate on tool output, so a lying validator teaches the AI
developer the wrong thing. Runtime-verify the fixtures.
**F10.** Maestro.ReceiveMessageEvent contract is undiscoverable (name vs messageName,
Reference as direct input, empty messageEventDefinition); document or generate it.
**F11.** Message-payload condition expressions are shape-fragile with no designer-side
envelope preview; first composed run misrouted to escalate because of it.
**F12.** License matrix reads "all zero Allowed" on ENTERPRISE while serverless agent
jobs run fine; two days lost to a phantom capacity wall. Surface serverless/pooled
availability distinctly.
**F13.** Auth tokens are per project folder (three agents = three auths, ~1h life,
stale tokens fail at run time as fake agent bugs). Tenant-level token cache.
**F14.** PowerShell mangles --input-arguments JSON; document cmd /c or accept @file.
**F15.** Test Manager v2 API creates projects (field is projectPrefix) but every
test-case route 404s; eval publishing becomes a manual click task. Project
"Exchange Recon - Agent Evals" id 3dcc9b9e was created this way.
**F16. Positive:** hand-authored connection bindings resolve via
`uip solution deploy config link` (proven on 1.0.7 deploy) — the resolution mechanism
exists; extend it to agent releases and the F1 round-trip becomes optional.

---

## Trace index (all committed under finale/maestro/)

| Instance | What it proves | File |
|---|---|---|
| 2db6d4d8 | Composed 3-agent governed run, 2:56, gate suspend/resume | composed-run-3-corrected-element-executions.json |
| 3aed9118 | Three-branch gate (timer armed, losers terminated cleanly) | twin-107-smoke-approve-... |
| 4139bdeb | Boundary degradation on dead connector legs | twin-107-smoke-escalate-... |
| e2b9e3d8 | SLA timer fired unattended #1 | twin-107-smoke-timer-fired-... |
| 870263b2 | 1.0.8 green; all script output mappings null (F3) | twin-108-green-approve-... |
| e387d1ec | Input-eval failure bypasses boundary (F5) | twin-108-smoke-policy-boundary-... |
| 21230b01 | Rule rejecting real inline-computed values (F6/F7) | twin-1012-green-fanout-... |
| ccb30345 | SLA timer fired unattended #2, full fan-out degrading | twin-1012-timer-fired-second-proof-... |
| 6b2ecc38 | FLOW-SENT Teams + Slack, approve ending (F2 cure) | twin-1016-notifications-approve-... |
| 1021b02a | FLOW-SENT Teams + Gmail + Slack, escalate ending | twin-1016-notifications-escalate-... |
