from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import START, StateGraph, END
from uipath_langchain.chat import UiPathAzureChatOpenAI
from pydantic import BaseModel, Field


class GraphInput(BaseModel):
    refiner_statement: str = Field(
        description="Our own position/exchange report for the contract (text or JSON) — "
        "generated from the trade/ETRM system."
    )
    counterparty_statement: str = Field(
        description="The counterparty's exchange statement for the same contract period."
    )


class GraphOutput(BaseModel):
    variance: str = Field(
        description="The quantified variance between the two statements, with units and "
        "currency, e.g. '-1,420.5 bbl (-$98,236)'."
    )
    variance_category: str = Field(
        description="The single best-fit category for the root cause. One of: "
        "temperature-basis, volume-rounding, grade-differential, delivery-point, "
        "timing-cutoff, demurrage, pricing-formula, missing-line-item, "
        "duplicate-line-item, fx-conversion, other."
    )
    confidence: float = Field(
        description="Confidence from 0.0 to 1.0 that the explanation and proposed "
        "correction are right. Lower it when the statements are ambiguous."
    )
    explanation: str = Field(
        description="Plain-English explanation of WHY the two statements disagree."
    )
    proposed_correction: str = Field(
        description="The adjustment that would reconcile the statements, written as a "
        "recommendation for a human to approve before any posting — never a posting itself."
    )


SYSTEM_PROMPT = """You are an exchange settlement reconciliation analyst for hydrocarbon
exchange contracts.

For an exchange contract, two statements describe the same movements: our own position
report (from the trade system) and the counterparty's exchange statement. When they
disagree beyond tolerance, you reconcile them. Your job is judgment, not posting:

- Read both statements and identify the variance. Quantify it with units and currency.
- Classify the most likely root cause. Common categories in exchange reconciliation:
  * temperature-basis  — volumes quoted at 60F vs observed temperature
  * volume-rounding     — net-vs-gross or rounding differences
  * grade-differential  — different crude/product grade or quality-bank adjustment
  * delivery-point      — different terminal / location / pipeline cycle
  * timing-cutoff       — a movement booked in a different period / month-end cutoff
  * demurrage           — a demurrage or detention charge on one side only
  * pricing-formula      — different price basis, differential, or settlement formula
  * missing-line-item   — a ticket/movement present on one statement, absent on the other
  * duplicate-line-item — a movement counted twice
  * fx-conversion       — currency conversion difference
- Explain in plain English WHY they disagree.
- Score your confidence from 0.0 to 1.0.
- Propose the adjustment that would reconcile them, written for a human reviewer to
  APPROVE before anything is posted.

Hard rule: you NEVER post a correction and you NEVER move money. You only reconcile,
explain, and recommend. A human approves your proposed correction or escalates it to
the trading desk; only then does a deterministic step post the adjustment. If the
statements are too ambiguous to explain with confidence, say so plainly and lower your
confidence score rather than guessing."""


async def explain_variance(state: GraphInput) -> GraphOutput:
    # Lazy LLM init inside the node (module-level clients break `uip codedagent init`).
    llm = UiPathAzureChatOpenAI(model="gpt-4o-2024-11-20", temperature=0.2)
    structured = llm.with_structured_output(GraphOutput)
    user = (
        f"Our position report:\n{state.refiner_statement}\n\n"
        f"Counterparty statement:\n{state.counterparty_statement}"
    )
    raw = await structured.ainvoke([SystemMessage(SYSTEM_PROMPT), HumanMessage(user)])
    return GraphOutput.model_validate(raw)


builder = StateGraph(GraphInput, output=GraphOutput)
builder.add_node("explain_variance", explain_variance)
builder.add_edge(START, "explain_variance")
builder.add_edge("explain_variance", END)

graph = builder.compile()
