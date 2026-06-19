from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langgraph.graph import START, StateGraph, END
from uipath_langchain.chat import UiPathAzureChatOpenAI
from pydantic import BaseModel, Field

from mcp_client import get_sap_tools

PO_SERVICE = "API_PURCHASEORDER_PROCESS_SRV"
PO_ITEM_ENTITY = "A_PurchaseOrderItemType"


class GraphInput(BaseModel):
    purchase_order: str = Field(
        description="The S/4 purchase order number, e.g. '4500000021'."
    )
    supplier_document: str = Field(
        description="The inbound supplier order-confirmation / invoice (text or JSON): "
        "per-line material/description, quantity, unit price, currency."
    )


class MatchedLine(BaseModel):
    po_item: str = Field(description="PO item number, e.g. '10'.")
    material: str
    description: str
    po_quantity: str
    po_unit_price: str
    supplier_quantity: str
    supplier_unit_price: str
    currency: str
    match_basis: str = Field(
        description="How the supplier line was matched to the PO item (e.g. 'material' "
        "or 'description')."
    )
    match_confidence: float = Field(description="0.0–1.0 confidence in this line match.")


class GraphOutput(BaseModel):
    purchase_order: str
    summary: str = Field(description="One-line summary of the matching result.")
    matched_lines: list[MatchedLine]
    unmatched_supplier_lines: list[str] = Field(
        description="Supplier lines with no corresponding PO item."
    )
    unmatched_po_items: list[str] = Field(
        description="PO items not referenced by the supplier document."
    )


SYSTEM_PROMPT = f"""You are a procure-to-pay matching agent. Your job is RETRIEVAL and LINE
ALIGNMENT — not judgment. You align an inbound supplier order-confirmation / invoice to the
buyer's real purchase order in SAP S/4HANA.

Use the SAP OData MCP tools. Read the real PO lines by calling `execute-entity-operation`:
  serviceId    = "{PO_SERVICE}"
  entityName   = "{PO_ITEM_ENTITY}"
  operation    = "read"
  queryOptions = {{"$filter": "PurchaseOrder eq '<PO>'", "$select": "PurchaseOrder,PurchaseOrderItem,Material,PurchaseOrderItemText,OrderQuantity,PurchaseOrderQuantityUnit,NetPriceAmount,NetPriceQuantity,DocumentCurrency"}}

Then align each supplier line to the best PO item by material number or description. For each
matched pair, carry BOTH sides' quantity and unit price verbatim (do not compute variances —
that is the variance agent's job). List any supplier lines that match no PO item, and any PO
items the supplier document does not reference.

You never write to SAP. If you cannot read the PO, return an empty match set and say so in
the summary."""


async def match(state: GraphInput) -> GraphOutput:
    tools = await get_sap_tools()
    tools_by_name = {t.name: t for t in tools}
    llm = UiPathAzureChatOpenAI(model="gpt-4o-2024-11-20", temperature=0.1)
    llm_with_tools = llm.bind_tools(tools)

    messages = [
        SystemMessage(SYSTEM_PROMPT),
        HumanMessage(
            f"Purchase order: {state.purchase_order}\n\n"
            f"Supplier document:\n{state.supplier_document}"
        ),
    ]
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
            except Exception as exc:
                result = f"Tool error: {exc}"
            messages.append(
                ToolMessage(content=str(result)[:8000], tool_call_id=call["id"])
            )

    structured = llm.with_structured_output(GraphOutput)
    final = await structured.ainvoke(
        messages + [HumanMessage("Now produce the structured matching result.")]
    )
    return GraphOutput.model_validate(final)


builder = StateGraph(GraphInput, output=GraphOutput)
builder.add_node("match", match)
builder.add_edge(START, "match")
builder.add_edge("match", END)

graph = builder.compile()
