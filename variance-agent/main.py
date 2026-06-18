from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import START, StateGraph, END
from uipath_langchain.chat import UiPathAzureChatOpenAI
from pydantic import BaseModel, Field


class GraphInput(BaseModel):
    refiner_statement: str = Field(
        description="The refiner's settlement statement (text or JSON) for the exchange."
    )
    counterparty_statement: str = Field(
        description="The counterparty's settlement statement for the same exchange."
    )


class GraphOutput(BaseModel):
    variance: str = Field(
        description="The quantified variance between the two statements, with units and "
        "currency, e.g. '-1,420.5 bbl (-$98,236)'."
    )
    confidence: float = Field(
        description="Confidence from 0.0 to 1.0 that the explanation and proposed "
        "correction are right. Lower it when the statements are ambiguous."
    )
    explanation: str = Field(
        description="Plain-English explanation of WHY the two statements disagree."
    )
    proposed_correction: str = Field(
        description="The proposed correction that would reconcile the statements. Advice "
        "only — never a posting."
    )


SYSTEM_PROMPT = """You are a crude-exchange settlement reconciliation analyst.

Two settlement statements for the same exchange — one from the refiner, one from the
counterparty — disagree beyond tolerance. Your job is judgment, not posting:

- Read both statements and identify the variance. Quantify it with units and currency.
- Explain in plain English WHY they disagree: temperature-basis differences (60F vs
  observed), demurrage, timing, unit conversions, or missing line items.
- Score your confidence from 0.0 to 1.0.
- Propose a correction that would reconcile the two statements.

Hard rule: you NEVER post to a ledger and you NEVER move money. You only explain and
recommend. A human reviewer approves your proposal or escalates it to the trading desk.
If the statements are too ambiguous to explain with confidence, say so plainly and
lower your confidence score rather than guessing."""


async def explain_variance(state: GraphInput) -> GraphOutput:
    # Lazy LLM init inside the node (module-level clients break `uip codedagent init`).
    llm = UiPathAzureChatOpenAI(model="gpt-4o-2024-11-20", temperature=0.2)
    structured = llm.with_structured_output(GraphOutput)
    user = (
        f"Refiner statement:\n{state.refiner_statement}\n\n"
        f"Counterparty statement:\n{state.counterparty_statement}"
    )
    raw = await structured.ainvoke([SystemMessage(SYSTEM_PROMPT), HumanMessage(user)])
    return GraphOutput.model_validate(raw)


builder = StateGraph(GraphInput, output=GraphOutput)
builder.add_node("explain_variance", explain_variance)
builder.add_edge(START, "explain_variance")
builder.add_edge("explain_variance", END)

graph = builder.compile()
