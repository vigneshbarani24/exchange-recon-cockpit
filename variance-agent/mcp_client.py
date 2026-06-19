"""MCP client helper — connects the agent to the SAP Cloud VB MCP server.

Connection details come from the environment (UiPath assets in prod, .env locally) so no
secret is ever committed:

    SAP_MCP_URL   the MCP endpoint (the .../mcp route)

Auth, in priority order:
    SAP_MCP_AUTH_HEADER   full Authorization header value, or
    SAP_MCP_TOKEN         a bearer token, or
    XSUAA client-credentials (recommended, non-interactive — works for a deployed agent):
        SAP_MCP_CLIENT_ID, SAP_MCP_CLIENT_SECRET, SAP_MCP_TOKEN_URL
"""
import os

import httpx
from langchain_mcp_adapters.client import MultiServerMCPClient


def _fetch_client_credentials_token() -> str | None:
    cid = os.environ.get("SAP_MCP_CLIENT_ID")
    secret = os.environ.get("SAP_MCP_CLIENT_SECRET")
    token_url = os.environ.get("SAP_MCP_TOKEN_URL")
    if not (cid and secret and token_url):
        return None
    resp = httpx.post(
        token_url.rstrip("/") + "/oauth/token",
        data={"grant_type": "client_credentials"},
        auth=(cid, secret),
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def _auth_header() -> str | None:
    if os.environ.get("SAP_MCP_AUTH_HEADER"):
        return os.environ["SAP_MCP_AUTH_HEADER"]
    if os.environ.get("SAP_MCP_TOKEN"):
        return f"Bearer {os.environ['SAP_MCP_TOKEN']}"
    token = _fetch_client_credentials_token()
    return f"Bearer {token}" if token else None


def _server_config() -> dict:
    url = os.environ.get("SAP_MCP_URL")
    if not url:
        raise RuntimeError(
            "SAP_MCP_URL is not set — point it at the SAP Cloud VB MCP endpoint."
        )
    headers: dict[str, str] = {}
    auth = _auth_header()
    if auth:
        headers["Authorization"] = auth
    return {"sap": {"url": url, "transport": "streamable_http", "headers": headers}}


async def get_sap_tools():
    """Connect to the SAP Cloud VB MCP and return its tools as LangChain tools."""
    client = MultiServerMCPClient(_server_config())
    return await client.get_tools()
