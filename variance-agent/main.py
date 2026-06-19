from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langgraph.graph import START, StateGraph, END
from uipath_langchain.chat import UiPathAzureChatOpenAI
from pydantic import BaseModel, Field

from mcp_client import get_sap_tools

# The S/4 OData service + entity the agent reconciles against (real, via MCP).
PO_SERVICE = "API_PURCHASEORDER_PROCESS_SRV"
PO_ITEM_ENTITY = "A_PurchaseOrderItemType"


class GraphInput(BaseModel):
    purchase_order: str = Field(
        description="The S/4 purchase order number to reconcile, e.g. '4500000021'."
    )
    supplier_document: str = Field(
        description="The inbound supplier order-confirmation / invoice for this PO (text "
        "or JSON): per-line material, quantity, unit price, currency."
    )
    tolerance_pct: float = Field(
        default=2.0,
        description="Per-line price/quantity tolerance in percent; within this a line is "
        "treated as matched.",
    )


class LineVariance(BaseModel):
    po_item: str = Field(description="PO item number, e.g. '10'.")
    material: str
    description: str
    po_quantity: str
    supplier_quantity: str
    po_unit_price: str
    supplier_unit_price: str
    currency: str
    variance_category: str = Field(
        description="One of: price-variance, quantity-variance, uom-mismatch, "
        "material-mismatch, currency-mismatch, tax-variance, missing-line, "
        "duplicate-line, over-delivery, under-delivery, none."
    )
    variance_amount: str = Field(
        description="The quantified line variance with currency, e.g. '+£125.00'."
    )
    explanation: str = Field(description="Plain-English reason the line disagrees.")
    proposed_correction: str = Field(
        description="Recommended PO-item correction for a human buyer to APPROVE before "
        "any write — never a write itself."
    )


class GraphOutput(BaseModel):
    purchase_order: str
    overall_status: str = Field(
        description="within-tolerance | variance-found | error"
    )
    summary: str = Field(description="One-line summary of the reconciliation outcome.")
    confidence: float = Field(
        description="0.0–1.0 confidence in the reconciliation; lower it when ambiguous."
    )
    line_variances: list[LineVariance]


SYSTEM_PROMPT = f"""You are a procure-to-pay reconciliation analyst. You reconcile an inbound
supplier order-confirmation / invoice against the buyer's REAL purchase order in SAP S/4HANA.

You have SAP OData MCP tools. To read the real PO lines, call `execute-entity-operation` with:
  serviceId    = "{PO_SERVICE}"
  entityName   = "{PO_ITEM_ENTITY}"
  operation    = "read"
  queryOptions = {{"$filter": "PurchaseOrder eq '<PO>'", "$select": "PurchaseOrder,PurchaseOrderItem,Material,PurchaseOrderItemText,OrderQuantity,PurchaseOrderQuantityUnit,NetPriceAmount,NetPriceQuantity,DocumentCurrency"}}

Then, for each PO line, find the matching supplier line (by material / description) and compare
quantity and unit price (NetPriceAmount per NetPriceQuantity). Classify each line:
  price-variance, quantity-variance, uom-mismatch, material-mismatch, currency-mismatch,
  tax-variance, missing-line (present on one side only), duplicate-line, over-delivery,
  under-delivery. A line within the tolerance percent is category "none".

Hard rule: you NEVER write to SAP and you NEVER post a correction. You only read, reconcile,
explain, and recommend a correction for a human buyer to approve. If you cannot read the PO,
set overall_status to "error" and explain why."""


async def reconcile(state: GraphInput) -> GraphOutput:
    # Lazy init inside the node (module-level clients break `uip codedagent init`).
    tools = await get_sap_tools()
    tools_by_name = {t.name: t for t in tools}
    llm = UiPathAzureChatOpenAI(model="gpt-4o-2024-11-20", temperature=0.1)
    llm_with_tools = llm.bind_tools(tools)

    messages = [
        SystemMessage(SYSTEM_PROMPT),
        HumanMessage(
            f"Purchase order: {state.purchase_order}\n"
            f"Tolerance: {state.tolerance_pct}%\n\n"
            f"Supplier document:\n{state.supplier_document}"
        ),
    ]

    # Bounded tool-calling loop: let the agent pull the real PO via MCP, then reason.
    for _ in range(6):
        ai = await llm_with_tools.ainvoke(messages)
        messages.append(ai)
        if not getattr(ai, "tool_calls", None):
            break
        for call in ai.tool_calls:
            tool = tools_by_name.get(call["name"])
            try:
                result = (
                    await tool.ainvoke(call["args"])
                    if tool
                    else f"Unknown tool {call['name']}"
                )
            except Exception as exc:  # surface to the model, don't crash the graph
                result = f"Tool error: {exc}"
            messages.append(
                ToolMessage(content=str(result)[:8000], tool_call_id=call["id"])
            )

    structured = llm.with_structured_output(GraphOutput)
    final = await structured.ainvoke(
        messages + [HumanMessage("Now produce the structured reconciliation result.")]
    )
    return GraphOutput.model_validate(final)


builder = StateGraph(GraphInput, output=GraphOutput)
builder.add_node("reconcile", reconcile)
builder.add_edge(START, "reconcile")
builder.add_edge("reconcile", END)

graph = builder.compile()
