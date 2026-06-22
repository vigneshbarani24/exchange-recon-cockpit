"""Deterministic write-back — post an approved PO-item correction to S/4 over MCP.

This is the ONLY write path in the system. It runs **after a human approves** at the gate —
the agents never call it. It takes one prepared correction (the `A_PurchaseOrderItem` field +
new value the posting step produced) and PATCHes it on the live PO via the SAP OData MCP.

Usage (deterministic step / CLI):
    python post_correction.py <PO> <item> <field> <new_value>
    e.g. python post_correction.py 4500000021 20 OrderQuantity 6

Status: the PATCH currently 404s because the MCP server returns empty keyProperties for the
entity (see .agent/submission/writeback-plan.md). Once the server exposes the entity key, this
lands unchanged.
"""
import asyncio
import sys

from mcp_client import get_sap_tools

PO_SERVICE = "API_PURCHASEORDER_PROCESS_SRV"
PO_ITEM_ENTITY = "A_PurchaseOrderItemType"


async def post_correction(purchase_order: str, po_item: str, field: str, new_value: str) -> str:
    tools = {t.name: t for t in await get_sap_tools()}
    execute = tools.get("execute-entity-operation")
    if execute is None:
        return "execute-entity-operation tool not available on the MCP server."

    # The governed write: PATCH the single PO item field. Keyed by (PurchaseOrder, PurchaseOrderItem).
    result = await execute.ainvoke(
        {
            "serviceId": PO_SERVICE,
            "entityName": PO_ITEM_ENTITY,
            "operation": "update",
            "parameters": {
                "keys": {"PurchaseOrder": purchase_order, "PurchaseOrderItem": po_item},
                "data": {field: new_value},
            },
        }
    )
    return str(result)


def main() -> None:
    if len(sys.argv) != 5:
        print(__doc__)
        raise SystemExit(2)
    po, item, field, new_value = sys.argv[1:5]
    print(asyncio.run(post_correction(po, item, field, new_value)))


if __name__ == "__main__":
    main()
