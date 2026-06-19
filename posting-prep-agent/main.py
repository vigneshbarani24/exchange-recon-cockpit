from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langgraph.graph import START, StateGraph, END
from uipath_langchain.chat import UiPathAzureChatOpenAI
from pydantic import BaseModel, Field

from mcp_client import get_sap_tools

PO_SERVICE = "API_PURCHASEORDER_PROCESS_SRV"
PO_ITEM_ENTITY = "A_PurchaseOrderItemType"


class GraphInput(BaseModel):
    purchase_order: str = Field(description="The S/4 purchase order number, e.g. '4500000021'.")
    po_item: str = Field(description="The PO item number to correct, e.g. '20'.")
    approved_action: str = Field(
        description="The human-APPROVED correction in plain English, e.g. "
        "'Accept the over-delivery; update the PO order quantity to 6'."
    )


class FieldUpdate(BaseModel):
    field: str = Field(
        description="S/4 field name, e.g. 'OrderQuantity' or 'NetPriceAmount'."
    )
    current_value: str = Field(
        description="Current S/4 value (read via MCP), for the audit trail."
    )
    new_value: str = Field(description="The new value to write.")


class GraphOutput(BaseModel):
    purchase_order: str
    po_item: str
    update_entity: str = Field(
        description="The S/4 OData entity to update (A_PurchaseOrderItemType)."
    )
    field_updates: list[FieldUpdate] = Field(
        description="The field(s) to change, each with its current and new value. The row "
        "keys are PurchaseOrder=purchase_order and PurchaseOrderItem=po_item."
    )
    human_summary: str = Field(
        description="One line a buyer can read: what will change, from what to what."
    )
    ready_to_post: bool = Field(
        description="True only if the update is well-formed and safe to hand to the "
        "deterministic post step."
    )


SYSTEM_PROMPT = f"""You prepare a SAP S/4HANA purchase-order-item update from a correction that
a human buyer has ALREADY APPROVED. You do NOT decide whether to correct — that decision is
made. You translate the approved action into a precise, well-formed S/4 update payload.

Use the SAP OData MCP tools. First READ the current PO item to confirm the field and its
current value, by calling `execute-entity-operation`:
  serviceId    = "{PO_SERVICE}"
  entityName   = "{PO_ITEM_ENTITY}"
  operation    = "read"
  queryOptions = {{"$filter": "PurchaseOrder eq '<PO>' and PurchaseOrderItem eq '<item>'"}}

Then map the approved action to S/4 field names:
  - a quantity change  -> OrderQuantity
  - a unit-price change -> NetPriceAmount
  - (other fields by their A_PurchaseOrderItem names)
Put the key properties in update_keys (PurchaseOrder, PurchaseOrderItem), the NEW value(s) in
update_fields, and the field's current value(s) in current_values for the audit trail.

Hard rule: you NEVER write to SAP. You only PREPARE the payload; a separate deterministic step
performs the update after this. Set ready_to_post=false and explain in human_summary if the
approved action is ambiguous or the field cannot be resolved."""


async def prepare(state: GraphInput) -> GraphOutput:
    tools = await get_sap_tools()
    tools_by_name = {t.name: t for t in tools}
    llm = UiPathAzureChatOpenAI(model="gpt-4o-2024-11-20", temperature=0.1)
    llm_with_tools = llm.bind_tools(tools)

    messages = [
        SystemMessage(SYSTEM_PROMPT),
        HumanMessage(
            f"Purchase order: {state.purchase_order}\n"
            f"PO item: {state.po_item}\n\n"
            f"Approved correction:\n{state.approved_action}"
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
        messages + [HumanMessage("Now produce the structured update payload.")]
    )
    return GraphOutput.model_validate(final)


builder = StateGraph(GraphInput, output=GraphOutput)
builder.add_node("prepare", prepare)
builder.add_edge(START, "prepare")
builder.add_edge("prepare", END)

graph = builder.compile()
