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


class PreparedCorrection(BaseModel):
    po_item: str
    entity: str = Field(description="The S/4 OData entity to update (A_PurchaseOrderItem).")
    field: str = Field(
        description="The S/4 field to change: OrderQuantity for a quantity correction, "
        "NetPriceAmount for a price correction."
    )
    current_value: str = Field(description="The current S/4 value (read from the PO).")
    new_value: str = Field(description="The value that resolves the variance.")
    summary: str = Field(description="One line a buyer reads: what changes, from/to.")
    ready_to_post: bool = Field(
        description="True if well-formed and safe to hand to the deterministic post step."
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
    prepared_corrections: list[PreparedCorrection] = Field(
        description="For each line with a variance, the S/4 update that would correct it — "
        "prepared, never posted. The deterministic step posts only after human approval."
    )


SYSTEM_PROMPT = f"""You are a procure-to-pay reconciliation agent. In one pass you run the whole
governed pipeline against the buyer's REAL purchase order in SAP S/4HANA:

1. RETRIEVE — read the real PO lines from S/4. Call `execute-entity-operation`:
   serviceId    = "{PO_SERVICE}"
   entityName   = "{PO_ITEM_ENTITY}"
   operation    = "read"
   queryOptions = {{"$filter": "PurchaseOrder eq '<PO>'", "$select": "PurchaseOrder,PurchaseOrderItem,Material,PurchaseOrderItemText,OrderQuantity,PurchaseOrderQuantityUnit,NetPriceAmount,NetPriceQuantity,DocumentCurrency"}}
2. MATCH — align each supplier line to the best PO item by material / description.
3. CLASSIFY — for each matched line compare quantity and unit price (NetPriceAmount per
   NetPriceQuantity) and classify the variance: price-variance, quantity-variance,
   uom-mismatch, material-mismatch, currency-mismatch, tax-variance, missing-line,
   duplicate-line, over-delivery, under-delivery. Within the tolerance percent → "none".
4. PROPOSE — write a plain-English proposed correction for each variance line.
5. PREPARE — for each variance line, prepare the concrete S/4 update that would resolve it
   (`prepared_corrections`): the A_PurchaseOrderItem field (OrderQuantity for a quantity
   issue, NetPriceAmount for a price issue), the current value (from the PO you read), and
   the new value. This is PREPARED, not posted.

Hard rule: you NEVER write to SAP and you NEVER post. You read, reconcile, explain, and
PREPARE; a human buyer approves, and only then does a deterministic step post the update.
If you cannot read the PO, set overall_status to "error" and explain."""


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

    # Bounded tool-calling loop: the agent pulls the real PO via MCP, then runs the pipeline.
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
        messages
        + [HumanMessage("Now produce the structured reconciliation, including prepared_corrections.")]
    )
    return GraphOutput.model_validate(final)


builder = StateGraph(GraphInput, output=GraphOutput)
builder.add_node("reconcile", reconcile)
builder.add_edge(START, "reconcile")
builder.add_edge("reconcile", END)

graph = builder.compile()
