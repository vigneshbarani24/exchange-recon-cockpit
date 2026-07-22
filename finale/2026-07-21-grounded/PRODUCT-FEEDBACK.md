# PRODUCT-FEEDBACK.md

Answers for the UiPath AgentHack 2026 product feedback survey. Best Product Feedback award,
$1,500. Paste ready. Everything here is grounded in what actually happened in this repo, with
IDs, so it is verifiable rather than opinion.

**Check before submitting:** the first and last name split below is an assumption.

---

**Q1. First name:** Vignesh Barani
**Q2. Last (family) name:** Sivakumar
**Q3. Team name:** Exchange Recon Cockpit (solo, VB)
**Q4. Email:** vigneshbarani24@gmail.com
**Q5. Overall satisfaction with AgentHack:** highest option (Very satisfied / 5)
**Q6. Category:** UiPath Maestro BPMN
**Q8. Overall satisfaction with the UiPath Platform:** Somewhat satisfied
**Q9. How easy was it to build:** Somewhat difficult
**Q14. Can we share your story:** Yes, but please show me the final version before publishing

---

## Q7. Please briefly describe your use case.

Governed invoice-to-PO reconciliation in procure to pay, running on live SAP S/4HANA.

A supplier invoice arrives that disagrees with the purchase order. A Maestro BPMN process
orchestrates three coded LangGraph agents as StartAgentJob service tasks: a matching agent
aligns supplier lines to PO items, a deterministic JavaScript tolerance gate (2 percent price,
1 unit quantity) auto-clears anything inside tolerance without any model call, a variance agent
classifies what is left and prepares the S/4 correction, and an event-based gateway suspends the
process at a human gate until a person approves or escalates. On approval a posting-prep agent
builds the exact A_PurchaseOrderItem update, and the write is deliberately held.

The agents read live SAP over an OData to MCP server on BTP with XSUAA client credentials, and
they hold no write tool at all. The only write path is a separate deterministic step. The design
principle is that determinism decides, agents advise, and humans sign.

Proven: instance 2db6d4d8-b245-4531-9057-8172232524db, package
ExchangeReconSolutionCanvas.Agentic.ExchangeReconBpmn:1.0.5, completed in 2 minutes 56 seconds
with three real Orchestrator agent jobs inside one instance and the human gate suspending and
resuming.

---

## Q10. What challenges did you encounter while building the solution?

**1. The headline: solution validation and BPMN runtime disagree about StartAgentJob bindings.
This cost two full days.**

The CLI packer requires binding-backed `name` and `folderPath` on a `StartAgentJob` service task
and rejects literal `releaseKey` and `folderId`. But nothing in the CLI pack and deploy path ever
resolves those bindings into a concrete release key. So the sequence is:

- `uip solution pack --dry-run` returns **Valid**
- publish and deploy both **succeed**
- the instance then **faults at runtime** with ErrorCode 170005, "Required field 'releaseKey'
  missing", on the first StartAgentJob

Every hand-authored variant failed this way. I proved it across five different CLI attempts:
name and folderPath bindings alone, inline ReleaseKey and FolderKey alongside the bindings,
uploading the inner BPMN nupkg directly to the feed, co-locating the agents in the deployment
folder post-deploy, and a fresh solution folder. Validation passed every time. Runtime failed
every time.

What finally worked was not a CLI fix. It was **round-tripping the process through Studio Web's
canvas** and re-picking each agent in the designer, which runs discovery and emits three things
hand-authoring cannot produce: `releaseKey` bindings with `propertyAttribute="Key"`, StartAgentJob
**v2** payloads with input schemas and typed outputs, and decisively, the agents materialised as
**in-solution resources** under `resources/solution_folder/process/agent/*.json` so the deploy
ships agents and BPMN together into one folder and resolves the bindings locally.

That is a genuinely good design once you know it exists. The problem is that nothing tells you,
and the failure surfaces at runtime rather than at pack time.

**The specific asks:** either resolve agent bindings during pack and deploy, or fail at
`pack --dry-run` on any StartAgentJob whose binding cannot be resolved. A validator that returns
Valid for a package that cannot start is the single most expensive thing I hit. And error 170005
should name the element and say which binding is unresolved, not just report a missing field.

**2. This also breaks coding agents, which matters more than it looks.**

I built this with Claude Code through UiPath for Coding Agents, and the CLI plus skills
combination was genuinely productive. But the BPMN skill fixtures produce BPMN that validates and
does not run, for exactly the reason above. So the coding agent produced confidently wrong output
and the toolchain confirmed it was correct. **Skill fixtures for coding agents should be
runtime-verified, not just schema-valid.** A coding agent cannot reason its way out of a
validator that lies to it, and this is going to be a recurring failure class as more people build
this way.

**3. The `Maestro.ReceiveMessageEvent` contract is undiscoverable.**

Getting a message-based human gate working required finding, by trial and error, that the context
field is `name` and not `messageName`, that `Reference` must be a direct input with
`target="bodyField"`, that the output must be `name="response" type="Maestro.ReceiveMessageEvent"`,
and that `messageEventDefinition` must be empty with no `messageRef` and no root `<bpmn:message>`
element. Any deviation fails quietly. This contract deserves to be documented in one place, or
better, generated.

**4. Decision expressions over a message payload are shape-fragile with no way to inspect the
shape.**

My first completed composed run took the default escalate branch rather than approve, because the
condition expression did not match the actual shape of the message envelope. There is no way to
see the resolved envelope before runtime, so this is discovered only by running it and reading the
trace. A designer-side preview of the resolved message payload schema, or a test-send that echoes
the envelope, would remove a whole class of silent misrouting.

**5. The license matrix actively misled me for two days.**

`uip or licenses info` reported an ENTERPRISE plan with every Allowed value at 0, including
AgentService and ProcessOrchestration, while agent jobs were demonstrably running successfully on
serverless runtime in the same tenant. I concluded I was blocked by a runtime capacity wall and
spent two days on the wrong problem. The real cause was binding resolution. **Serverless and
pooled runtime availability should be surfaced distinctly from allocated license counts**, because
right now a zeroed matrix reads as "you cannot run this" when you can.

**6. Auth tokens are per project folder, which does not fit multi-agent solutions.**

`uipath auth` authenticates a single project folder. In a solution with three coded agents, that
is three separate authentications, and refreshing one does not refresh its siblings. A stale token
in one agent folder fails at run time with "Access token is expired", not at CLI time, so it looks
like an agent bug. With a roughly one hour token life this is a real operational tax before any
demo or test run. A tenant-level token cache shared across the projects in a solution would fix it.

**7. Windows developer experience.**

`uip or jobs start --input-arguments` has its JSON mangled by PowerShell quoting and only works
reliably through `cmd /c`. Worth either documenting prominently or accepting a file path for
input arguments.

---

## Q11. If you had to change one thing about the UiPath Platform experience, what would it be and why?

**Make validation and runtime agree. If `uip solution pack --dry-run` returns Valid, the package
must be able to start.**

Everything else on my list cost me minutes or hours. This one cost two days, and it cost them in
the most expensive way possible: not by failing, but by passing. Pack said Valid, publish
succeeded, deploy succeeded, and only the instance told me the truth. Because every signal
upstream of runtime was green, I trusted the wrong hypothesis and went looking for a capacity
problem that did not exist.

This matters far more in the agentic era than it did for classic RPA, for two reasons. Composed
processes have many more resolution points, since every agent reference is a binding that has to
resolve to a release in a folder. And coding agents now sit between the developer and the
platform, and they calibrate almost entirely on tool output. When the validator says Valid, a
coding agent believes it and moves on confidently. A validator that can return Valid for a
package that cannot start does not just slow a human down. It actively teaches an AI developer the
wrong thing.

The concrete change: resolve agent bindings at pack or deploy time, and where that is not
possible, fail loudly at pack time naming the element and the unresolved binding.

---

## Q12. What surprised you the most about building with UiPath? What would you tell another developer trying this for the first time?

**The surprise: the agents were the easy part.**

I expected the hard problem to be the reasoning. Getting three coded LangGraph agents to read a
live SAP S/4HANA purchase order over MCP, classify a price and quantity variance, and prepare a
correct A_PurchaseOrderItem update went smoothly, and the LLM Gateway meant I never handled a raw
model key. The hard problem turned out to be composition: getting three proven agents to run
inside one process. Ninety percent of my lost time was binding resolution and deployment topology,
not AI.

The second surprise was how good the runtime is once it runs. Durable suspend and resume at a
human gate genuinely works. My process paused at the gate for about six minutes on one run and
twenty seconds on another, woke up on a correlated message, and carried on. That is not a small
thing to get right and it is the reason the whole design holds together.

**What I would tell another developer, in one line: build it in the Studio Web canvas first, even
if you intend to live in the CLI.**

Author the process in the designer and pick your agents there, then commit that output and hand
edit from it. The canvas emits things you cannot reliably hand author: releaseKey bindings, v2
activity payloads with typed schemas, and agents materialised as in-solution resources so the
deploy ships them alongside the BPMN. I did it the other way round, hand authored first, and lost
two days to a package that validated and would not run.

Three more, cheaply learned. Re-authenticate every agent folder before any run, because the token
is per folder and lives about an hour. Read the element executions JSON rather than the UI when
something misroutes, because it gives you the per-element job keys and status and it is the fastest
way to see which branch actually fired. And put your deterministic logic in a script task rather
than in an agent; my tolerance gate takes one second, makes no model call, clears the bulk of
cases, and is trivially auditable. Agents should only handle what determinism cannot.

---

## Q13. What did you build with Maestro that would have been a mess to stitch together without it?

**A financial-control approval that suspends a live multi-agent process indefinitely, then resumes
it exactly where it stopped, with the whole thing auditable per element.**

Concretely, in one BPMN process: three coded agents invoked as StartAgentJob service tasks, a
deterministic tolerance gate, an exclusive gateway, and then an event-based gateway racing two
message catch events, ApproveGate and EscalateGate, both correlated on the purchase order number.
When approval arrives, the winning branch fires and Maestro cancels the loser automatically. My
trace shows Event_Approve Completed and Event_EscalateMsg Terminated in the same instance. Three
boundary error events on the agent tasks route every failure to one escalation path.

To build that myself I would have needed a durable state store, a scheduler, a correlation
mechanism keyed on business identity rather than a technical ID, a race-and-cancel primitive for
the two-outcome gate, retry and error boundaries around three separate long-running jobs, and an
audit log that ties each step to the job that ran it. That is a distributed systems project, and it
is the part of an agentic process that is genuinely hard, not the prompting.

Two specific things I want to call out as genuinely well designed. **Correlating on a business
reference rather than an instance ID** is the right call, because it means the approver's system
does not need to know anything about Maestro internals to resume the process. And the **element
executions output**, with a JobKey and an Orchestrator ExternalLink per element plus status and
timings, is excellent. It is what let me prove that three real agent jobs ran inside one instance
rather than asking anyone to take my word for it, and for a governance use case that record is not
a debugging convenience, it is the product.

The honest limit, and I will say it plainly: the message gate correlates on message name and
reference but does not verify who sent the message. For a financial approval, approver identity is
the thing that matters most, so today I would reach for an Action Center task to get it. A
first-class way to attach a verified approver identity to a message-based gate, so the decision
carries a person and not just a payload, would close the last gap between this being a working
process and a deployable financial control.

---

## Addendum: findings filed after survey submission, verified 2026-07-22

The survey above is submitted. These three findings were verified the evening before the finale
and are recorded here in the same style as Q10: grounded, with IDs, verifiable.

**8. The Actions service is not provisioned on the hackathon staging tenant, so no form of
Action Center HITL is possible here by entitlement.**

Task API POST `/tasks/GenericTasks/CreateTask` returns 404 with "Service: actions not found in
Organization". The consequence is that neither native Actions.HITL user tasks nor external
Action Center tasks are possible on this tenant, so human in the loop is limited to Maestro
message events by entitlement rather than by design choice. This lands directly on the honest
limit called out in Q13: the one feature that would attach a verified approver identity to the
gate is the one the tenant cannot provision. Suggest documenting an entitlement matrix for
hackathon tenants, or enabling Actions on tenants that have ProcessOrchestration enabled.

**9. Positive finding: hand-authored connection bindings deploy correctly when resolved with
`uip solution deploy config link`.**

Connection bindings hand-authored in a Maestro BPMN, as Intsvc.ActivityExecution service tasks
referencing `=bindings.X` plus connection resources declared in `bindings_v2.json`, pack,
publish, and deploy correctly once the bindings are resolved via `uip solution deploy config
link`. Proven on ExchangeReconSolutionTeams 1.0.7, deployment ExchangeReconTeams,
ActivationStatus SuccessfulActivate, with a Gmail SendEmail task and a Slack SendMessage task
both linked to live connections. This is the exact binding class that fails for agent releaseKey
bindings in finding #1. The deploy-config path proves resolution outside the Studio Web canvas
is possible. Suggest extending the same resolution mechanism to process and agent resources so
hand-authored BPMN can deploy without a Studio Web round-trip.

**10. Test Manager v2 API allows project creation but exposes no working test-case route.**

POST `/projects` works, with the note that the field is `projectPrefix`; project "Exchange Recon
- Agent Evals" (prefix RECON, id 3dcc9b9e-8719-0100-48a7-0b49ea40aef1) was created this way. But
every test-case route tried, `/testcases`, `/test-cases`, `/testCases`, and the project-scoped
variants, returns 404 itemNotFound. The consequence is that test cases must be created by hand
in the UI, which turns an automatable eval-publishing step into a click task. Suggest publishing
the case CRUD surface or documenting the intended route.


### Correction note, dated 2026-07-22 (survey text above is frozen as submitted)

Two sentences in the submitted survey describe the tolerance gate's auto-clear as runtime
behavior ("auto-clears anything inside tolerance without any model call"; "clears the bulk
of cases"). For the record: the deterministic tolerance CHECK ran in every instance (about
one second, no model call), but the auto-clear ENDING itself is the subject of finding #2,
parked behind the script-output defect, and no instance has ended auto-cleared; in-tolerance
cases route conservatively to the human. The sentences describe design intent. Stated here
so the survey text and the runtime record cannot be read as contradicting each other.


**11. Input-expression evaluation failures bypass boundary error events.**

When an activity's input expression fails to evaluate (error 400300, here
`=vars.matchedLines[0].po_item` against an empty list), the element is marked Failed and
the instance faults, but the task's attached boundary error event never fires: the failure
happens before the task is considered running. Reproduced on ExchangeReconTeamsNotify
1.0.8, instance e387d1ec. Consequence: a flow that is fully shielded with boundary events
on every integration and agent task can still fault, unhandled, on a data-shape surprise
in the inputs. Suggest either routing input-evaluation failures through the same boundary
error path as execution failures, or documenting the distinction and offering a
flow-level error handler for pre-execution failures.


### Addendum part two, dated 2026-07-22 late evening (the carrier discovery)

Continued iteration on the enriched twin (versions 1.0.9 through 1.0.12) produced four
sharper findings, each with a committed trace:

**12. Runtime carrier split: separate uipath:input elements execute; context fields do
not reach the runtime.** On Intsvc.ActivityExecution, a body passed as a separate
uipath:input element (type json, target body) arrived fully evaluated, expressions
resolved, visible in the instance variables view. The connection passed as a context
field arrived null (error: Value cannot be null, Parameter 'Connection'), whether given
as a binding reference or a literal id. On Intsvc.UnifiedHttpRequest, method/url/headers
set as context fields produce 'Method' is required and cannot be empty at runtime. The
registry note "inputs are managed by the IS connector framework and serialized as
separate uipath:input elements" appears to describe exactly this, but the required
element shape is undocumented. Suggest documenting the runtime carrier per extension
type, or reading context fields at runtime.

**13. Positive: =js: expressions inside a task's JSON body inputs evaluate correctly,**
including multi-statement function bodies computing over an agent's structured output
(used to compute price/quantity/value variances inline from matched lines after script
outputs proved unusable). This is a practical workaround lane for finding #2.

**14. Orchestrator.BusinessRules task rejects valid numeric arguments.** With real
numbers delivered (instance 21230b01, JobArguments visible in the variables view as
PriceVariancePct 10, QtyVarianceUnits 1, LineValueGbp 1375), the task still returns 400
Invalid business rule task arguments / Invalid activity input. Note the variables view
shows the argument keys PascalCased while the DMN inputs are snake_case
(price_variance_pct); if the runtime re-cases JobArguments keys before rule input
matching, no snake_case DMN input can ever be matched by this task. The rule artifact
itself is well-formed (attached DMN validates; the same table renders and versions in
the portal). No public rule-execution API endpoint was discoverable to cross-check
evaluation directly (OData GET returns BusinessRule does not exist against the linked
folder; all execute-shaped POSTs return 405).

**15. Script-task output bindings never populate, full scope.** Instance 870263b2
variables show every declared script output null, including the canvas-native whole
result output, while the same script's computed values demonstrably exist (the inline
recomputation in finding #13 yields correct numbers from the same data). This widens
finding #2 from "gateway condition unreachable" to "script outputs are never available
to any downstream consumer."
