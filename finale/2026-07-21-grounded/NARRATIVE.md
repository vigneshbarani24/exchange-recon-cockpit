# NARRATIVE.md

The argument the whole submission makes. Deck, script, README and Q&A all derive from this
page. If a line does not serve this argument, cut it.

---

## The thesis in one sentence

**Enterprises are not refusing agents because agents cannot reason. They are refusing them
because nobody will give a probabilistic system write access to the ledger. So build the
reasoning with no authority attached: determinism decides, agents advise, humans sign.**

## The frame: AI is the new RPA

Around 2005, RPA took the deterministic bulk of the back office. It did not win because the
robots were clever. It won because the industry wrapped it in orchestration, audit trails,
credential vaults and human checkpoints, and that made it deployable inside a control
environment.

In 2026 agents are taking the judgment layer. The same discipline applies, and it has not
been applied yet. The winners will not be the smartest agents. They will be the governed
ones.

The closing form of this: **"AI is the new RPA, and it needs the same discipline RPA got."**

## Why this framing beats the obvious one

Do not stand in front of two product VPs who build reasoning agents and argue that AI cannot
reason. You will lose the room in ten seconds and you will also be wrong.

Argue the sharper thing instead. Reasoning is real and it is useful. **Authority is the
problem.** That reframe is not a concession, it is the entire product. And it happens to be
the published position of the judge most likely to probe governance: agents are
non-deterministic by nature, and that creativity becomes a liability when the process carries
compliance requirements and financial consequences; sometimes determinism is good, because
it fails the same way every time. Hand him his own thesis with a completed Maestro instance
behind it.

**Deck line: deterministic where it counts, agentic where it helps.**
**Spoken line: enterprises want RPA's reliability with agentic reach.**

---

## The visual: the iceberg

One diagram carries the whole architecture.

- **Below the waterline, the deterministic mass.** Rules, tolerance gates, the RPA and
  integration layer. The bulk of the work, cleared silently, without a single model call. In
  this build that is `Task_Tolerance`: 2 percent price, 1 unit quantity, plain JavaScript
  inside the BPMN. If the invoice is within tolerance it auto-clears and no agent is ever
  invoked.
- **At the waterline, the exception-handling agents.** Matching, variance, posting-prep.
  They reason only where determinism runs out. Call them exception-handling agents
  everywhere, in the repo, the deck and out loud. The name is the argument.
- **At the peak, the human.** Sole write authority. Small, deliberate, expensive, and the
  only actor who can commit.

Label the three layers with the Three Laws.

## The provocation: second-class agents by design

These agents hold no write tools, no authority and no autonomy over money. They are
deliberately subordinate: a deterministic gate above them, a quarantined executor below
them, a human at the peak. That is not a limitation that survived the build. It is the
design.

The supporting line, and it is the judge's own: even with human workforces we do not let a
person just do whatever. We constrain them inside workflows. These agents get exactly the
same treatment, and low handling autonomy is the feature.

## The correction that matters: stateless reasoning, stateful process

Half of the instinct here is right and the wrong half is dangerous. Get it precise.

**Right, and say it:** each invoice is an independent unit of judgment. No accumulated
memory, no cross-case learning, no RAG, no vector store, no knowledge graph. And the reason
is the sharp bit: **the system of record is the context.** SAP already holds the ground
truth, so the agent fetches it live instead of building a retrieval layer to approximate it.
Much of the field built context infrastructure to simulate what this build simply reads from
the source.

**Wrong, and never say it flatly:** the process is not stateless. Maestro holds durable
state. That is precisely how the human gate suspended for 20 seconds on run 3 and about six
minutes on run 1, and then woke up and carried on. Claim statelessness flatly and the first
judge who asks about a long-running approval takes the point off you.

**The precise claim, which is also the stronger one: stateless reasoning, stateful process.**
The agents carry nothing between invoices. Maestro carries everything between steps. That
separation is why this deploys and why it audits.

---

## Where the human gate belongs

Back-office agentic work is multi-system by nature. That is the whole reason it is expensive
and the whole reason it resists automation. But it means every governed flow ends up asking
a business user to open one more screen to approve one more thing, and business users will
not do that. Approval queues that live in a tool nobody has open are approval queues that
age.

So the gate should go where the human already is. In this build the human gate is a Maestro
message event correlated on name plus reference. That shape is already an approval card
waiting to happen: two racing catch events, `ApproveGate` and `EscalateGate`, are two
buttons. Pushing the card into Microsoft Teams and letting the button click send the message
back does not weaken the governance. It moves the gate to where the approver lives and, done
properly, it attaches an identity to the decision that the CLI never could.

Framing when you say it: **the process does not ask the human to come to it. It goes to
where the human already works, and it still refuses to move without them.** Design and risk
in `BUILD-BRIEF.md`; whether it ships by July 23 is undecided, so the deck must work either
way.

---

## The Three Laws, unchanged

1. Every agent action is authorised before it happens.
2. Every exception reaches a human, with evidence.
3. Every decision is reconstructable afterwards.

Lifted from a real finance control. What is new is not the rules. It is an agent that obeys
them, and a completed process instance that proves it obeyed them.

---

## Lines to use

- "Reasoning is real. Authority is the problem."
- "Determinism decides, agents advise, humans sign."
- "Deterministic where it counts, agentic where it helps."
- "Stateless reasoning, stateful process."
- "The system of record is the context."
- "An agent can be perfectly valid in the ERP and still be unauthorised in the business."
- "Second-class agents, by design."
- "Most agentic demos agree two numbers they made up. This one reads a purchase order it has
  never seen, at runtime, and is structurally incapable of writing back."
- "AI is the new RPA, and it needs the same discipline RPA got."

## Lines never to say

- Anything of the form "AI cannot reason" or "agents are not ready." Two of the people in
  the room ship agent products.
- "Fully autonomous", "the agent decides", "the agent posts to SAP." None of these are true
  and all of them destroy the argument.
- "Three way match." There is no goods receipt read. It is invoice to PO.
- "Stateless" without the word "reasoning" attached.
- "Deployed at" any customer. See `VALUE.md` for the exact permitted phrasing.
- Any customer name.
