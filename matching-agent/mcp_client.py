"""MCP client helper — connects the agent to the SAP MCP server.

Config resolves from the environment first (a gitignored .env locally), then falls back
to UiPath assets (so a DEPLOYED agent, which has no .env, reads them from Orchestrator):

    SAP_MCP_URL   the MCP endpoint (the .../mcp route)

Auth, in priority order:
    SAP_MCP_AUTH_HEADER   full Authorization header value, or
    SAP_MCP_TOKEN         a bearer token, or
    XSUAA client-credentials (recommended, non-interactive):
        SAP_MCP_CLIENT_ID, SAP_MCP_CLIENT_SECRET, SAP_MCP_TOKEN_URL
"""
import os

import httpx
from langchain_mcp_adapters.client import MultiServerMCPClient


def _asset(name: str) -> str | None:
    """Read a same-named UiPath asset — used by the deployed agent (no local .env)."""
    try:
        from uipath.platform import UiPath

        asset = UiPath().assets.retrieve(name)
        return getattr(asset, "value", None)
    except Exception:
        return None


def _get(name: str) -> str | None:
    return os.environ.get(name) or _asset(name)


def _fetch_client_credentials_token() -> str | None:
    cid = _get("SAP_MCP_CLIENT_ID")
    secret = _get("SAP_MCP_CLIENT_SECRET")
    token_url = _get("SAP_MCP_TOKEN_URL")
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
    header = _get("SAP_MCP_AUTH_HEADER")
    if header:
        return header
    token = _get("SAP_MCP_TOKEN")
    if token:
        return f"Bearer {token}"
    fetched = _fetch_client_credentials_token()
    return f"Bearer {fetched}" if fetched else None


def _server_config() -> dict:
    url = _get("SAP_MCP_URL")
    if not url:
        raise RuntimeError("SAP_MCP_URL is not set (env var or UiPath asset).")
    headers: dict[str, str] = {}
    auth = _auth_header()
    if auth:
        headers["Authorization"] = auth
    return {"sap": {"url": url, "transport": "streamable_http", "headers": headers}}


async def get_sap_tools():
    """Connect to the SAP MCP and return its tools as LangChain tools."""
    client = MultiServerMCPClient(_server_config())
    return await client.get_tools()
