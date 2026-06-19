"""MCP client helper — connects the agent to the SAP Cloud VB MCP server.

The deployed/coded agent reaches the BTP-hosted SAP MCP over HTTP directly (not via
the claude.ai connector). All connection details come from the environment so no secret
is ever committed:

    SAP_MCP_URL          the BTP MCP endpoint
                         (e.g. https://<host>.cfapps.eu10-004.hana.ondemand.com/mcp)
    SAP_MCP_AUTH_HEADER  full Authorization header value (takes precedence), or
    SAP_MCP_TOKEN        a bearer token (wrapped as "Bearer <token>")

If the BTP server uses XSUAA client-credentials instead of a static token, set
SAP_MCP_AUTH_HEADER to a freshly-minted "Bearer <jwt>" (or extend this helper with a
token-fetch step using the service key).
"""
import os

from langchain_mcp_adapters.client import MultiServerMCPClient


def _server_config() -> dict:
    url = os.environ.get("SAP_MCP_URL")
    if not url:
        raise RuntimeError(
            "SAP_MCP_URL is not set — point it at the SAP Cloud VB MCP endpoint."
        )
    headers: dict[str, str] = {}
    auth_header = os.environ.get("SAP_MCP_AUTH_HEADER")
    token = os.environ.get("SAP_MCP_TOKEN")
    if auth_header:
        headers["Authorization"] = auth_header
    elif token:
        headers["Authorization"] = f"Bearer {token}"
    return {"sap": {"url": url, "transport": "streamable_http", "headers": headers}}


async def get_sap_tools():
    """Connect to the SAP Cloud VB MCP and return its tools as LangChain tools."""
    client = MultiServerMCPClient(_server_config())
    return await client.get_tools()
