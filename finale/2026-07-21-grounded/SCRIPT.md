# SCRIPT.md

The 5 minute finale run, timed, with the demo running live underneath it. Supersedes
`finale/DEMO-RUNBOOK.md`, whose instruction "never try the 3-agent Maestro run live, it
can't complete" is now false.

**Decision, locked with VB:** lead live with the composed Maestro instance, with the SAP tell
delivered from inside it. Recorded run 3 is the fallback.

---

## The scheduling insight that makes this work

The instance takes 2 min 56 s of wall clock, which sounds fatal in a 5 minute slot. It is
not, because **the human gate waits for you.** The process suspends at `Event_Approve` and
stays suspended until a message arrives. So the runtime is not dead time. You start the
instance early and deliver the entire argument over the top of it, and the process arrives at
the gate exactly when you want to talk about the gate.

Measured segment times from run 3, so you can pace against them:

| From instance start | What has happened |
|---|---|
| 0:00 | Start event fires |
| 0:47 | Matching agent job completes, 45 s |
| 0:49 | Deterministic tolerance gate completes, 1.1 s, no LLM |
| 1:47 | Variance agent job completes, 57 s |
| 1:48 | **Instance suspends at the human gate and waits** |
| on approval, plus 46 s | Posting-prep agent completes |
| plus 2 s | Correction prepared and held, End_Corrected |

---

## The run sheet

| Clock | On screen | What you say |
|---|---|---|
| **0:00 to 0:20** | Slide 1, then the supplier invoice next to the SAP PO line | "A supplier invoiced us. The price and the quantity do not match the purchase order in SAP. Somebody has to work out why, against the live system of record, before finance pays. Most agentic demos would now agree two numbers they made up. This one is about to read a purchase order it has never seen." |
| **0:20** | **Start the Maestro instance.** Say what you are doing. | "I am starting the process now. It will take about three minutes, so let me tell you why it is built this way while it runs." |
| **0:20 to 1:05** | Slide 3 | The problem. The 108 activities, the $5.7M, 5 desks and 4 days. Land: "the migration automated the transaction, not the exception." Then the authority line: "an agent can be perfectly valid in the ERP and still be unauthorised in the business." |
| **1:05 to 1:40** | Slide 5, the iceberg. Glance at the running instance. | The three layers. "The mass below the waterline is deterministic and clears silently. Notice what just happened on screen: the tolerance gate took one second and made no model call at all. Agents only reason where determinism runs out." |
| **1:40 to 2:10** | Slide 6, Three Laws | The Three Laws. Second-class agents by design. "Stateless reasoning, stateful process. The agents carry nothing between invoices. Maestro carries everything between steps." |
| **2:10 to 2:35** | **Switch to the running instance.** It is suspended at the human gate. | "And there it is. The process has stopped. Three agents have run as real Orchestrator jobs inside this one instance, and now it is suspended, waiting for a person. It will wait as long as it takes." |
| **2:35 to 3:00** | The variance agent output. Point at the PO side. | **The tell, and the most important 25 seconds in the run.** "This is why it matters that it is live. The agent was handed only the supplier's numbers. It is reporting the PO side: net price twenty-five pounds, order quantity five. There is exactly one way it knows that, which is by reading S/4 at runtime. There was no synthetic ground truth to lean on." |
| **3:00 to 3:15** | Approve. | "A person decides. I approve, and the process resumes." (See the branch note below.) |
| **3:15 to 4:05** | Posting-prep runs, then the held correction, then End_Corrected | "The posting-prep agent builds the exact S/4 update: item ten, net price twenty-five to twenty-seven fifty. And then it stops. The correction is prepared and held. The agents have no write tool at all. The only write path is a separate deterministic step that a human authorises. Deterministic check, agent judgment, human authority, kept apart on purpose." |
| **4:05 to 4:15** | Claude Code and `uip` on screen | "The agents, the BPMN and the cockpit were all built with Claude Code through UiPath for Coding Agents." |
| **4:15 to 4:50** | Slide 7, the two value cards | The close. Two enterprises, one pattern, deployment is a config delta. "Three minutes end to end with a person still holding the pen." Final line: "AI is the new RPA, and it needs the same discipline RPA got. Thank you." |
| **4:50 to 5:00** | Held on slide 7 | Buffer. Do not fill it. |

### The approval branch at 3:00
- **If the Teams gate ships** (see `BUILD-BRIEF.md`): the card is already sitting in Teams,
  posted by the process. Approve from Teams and say the line: "the process does not ask the
  approver to come to it. It goes to where they already work, and it still refuses to move
  without them."
- **If it does not ship:** approve with `uip maestro bpmn instance message send`, and say:
  "I am sending the approval message. In production this is an Action Center task or a Teams
  approval card, so the approver's identity is attached to the decision. Today it correlates
  on the purchase order and it does not check my role, and I will not pretend otherwise."

That second version is not a weak answer. Volunteering the exact boundary of your own
governance in front of these two judges is worth more than the feature.

---

## Pre-flight, T minus 60 minutes, in this order

1. **Rotate the SAP XSUAA secret** and confirm the MCP server answers. A rotated but
   un-updated secret is a dead demo.
2. **Re-auth UiPath in every agent folder.** The token is per folder. Authenticating in one
   does not refresh the others; this broke matching and posting-prep on 2026-07-20 while
   variance worked. Copy the fresh `.env` across all three. The token lives about an hour.
3. **Run the whole instance once, end to end.** If it goes green, you present live. If it
   does not, you present the recording and say why, calmly.
4. **Cue the fallback video** on a second device or a separate window, already open, cued to
   the start.
5. Browser zoom about 110 percent, notifications off, one clean window, cursor visible, mic
   tested.
6. **T minus 10 minutes, run it once more.** Not T minus 60. The token expiry window is the
   reason.

## Failure protocol

Rehearse until it is muscle memory. The jury mirrors your composure.

- **If the instance stalls for more than about 15 seconds at any step:** "the tenant is slow
  right now, let me show you this exact run." Cut to the recorded run 3 and keep narrating as
  if live. It is the same real run with the same job IDs. Do not apologise twice.
- **If auth fails at the start:** do not debug on camera. Go straight to the recording, say
  "the token is per folder and mine has expired, so here is the run from this morning", and
  carry on. That is a credible sentence and it costs you almost nothing.
- **Never:** attempt the SAP write-back, demo the fraud, duplicate or goods-receipt cases
  (no code exists), or call this a three way match.

## What the fallback video must contain

The same spine, subtitled, under 90 seconds of actual demo, cued to the instance start. Record
it from run 3 or a fresh green run. **Record this before touching anything else in the repo.**
It is also the Devpost demo video asset. Record it once, well.

## Rehearsal targets

- Memorise the first 35 seconds and the last 35 seconds word for word. Everything between can
  be spoken.
- Land at 4:50, not 5:00.
- The tell at 2:35 is the moment the room decides. Slow down there and point at the number.
