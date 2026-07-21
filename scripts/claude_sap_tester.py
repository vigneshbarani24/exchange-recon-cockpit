"""Claude-as-tester: independent live read of the PO over the same SAP MCP the agents use.

Reads SAP_MCP_* config from an agent .env (never prints secrets), fetches an XSUAA
client-credentials token, connects to the MCP server over streamable_http, and reads
the purchase-order items for the eval ground-truth baseline.

Usage (from repo root):
    cd variance-agent && uv run python ../scripts/claude_sap_tester.py [--list-tools]
"""

import asyncio
import json
import sys
from pathlib import Path

import httpx
from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

PO = "4500000021"


def load_env() -> dict:
    env_path = Path(__file__).resolve().parent.parent / "variance-agent" / ".env"
    conf = {}
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            conf[k.strip()] = v.strip()
    return conf


def xsuaa_token(conf: dict) -> str:
    resp = httpx.post(
        conf["SAP_MCP_TOKEN_URL"].rstrip("/") + "/oauth/token",
        data={"grant_type": "client_credentials"},
        auth=(conf["SAP_MCP_CLIENT_ID"], conf["SAP_MCP_CLIENT_SECRET"]),
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


async def main() -> None:
    conf = load_env()
    token = xsuaa_token(conf)
    url = conf["SAP_MCP_URL"]
    async with streamablehttp_client(url, headers={"Authorization": f"Bearer {token}"}) as (
        read,
        write,
        _,
    ):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await session.list_tools()
            if "--list-tools" in sys.argv:
                for t in tools.tools:
                    print(f"TOOL {t.name}: {(t.description or '')[:140]}")
                return
            if "--schema" in sys.argv:
                for t in tools.tools:
                    if t.name == "execute-entity-operation":
                        print(json.dumps(t.inputSchema, indent=1))
                return
            if "--discover" in sys.argv:
                res = await session.call_tool("search-sap-services", {"query": "purchase"})
                for item in res.content:
                    if getattr(item, "text", None):
                        print(item.text[:3000])
                return
            if "--entities" in sys.argv:
                res = await session.call_tool(
                    "discover-service-entities", {"serviceId": sys.argv[-1]}
                )
                for item in res.content:
                    if getattr(item, "text", None):
                        print(item.text[:3000])
                return
            result = await session.call_tool(
                "execute-entity-operation",
                {
                    "serviceId": "API_PURCHASEORDER_PROCESS_SRV",
                    "entityName": "A_PurchaseOrderItemType",
                    "operation": "read",
                    "queryOptions": {
                        "$filter": f"PurchaseOrder eq '{PO}'",
                        "$select": "PurchaseOrder,PurchaseOrderItem,Material,PurchaseOrderItemText,OrderQuantity,PurchaseOrderQuantityUnit,NetPriceAmount,DocumentCurrency",
                    },
                },
            )
            for item in result.content:
                text = getattr(item, "text", None)
                if text:
                    print(text[:4000])


if __name__ == "__main__":
    asyncio.run(main())
