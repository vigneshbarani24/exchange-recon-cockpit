"""po_lookup.py -- live PO line-item lookup from S/4HANA over the SAP MCP.

Independent and read-only. Reuses the exact env/asset config and XSUAA
client-credentials token flow as claude_sap_tester.py, then reads all
A_PurchaseOrderItemType rows for a given purchase order live over the MCP and
prints a clean, ASCII-only aligned table.

Usage (from repo root):
    cd variance-agent && uv run python ../scripts/po_lookup.py 4500000021
    cd variance-agent && uv run python ../scripts/po_lookup.py 4500000021 --json
    cd variance-agent && uv run python ../scripts/po_lookup.py 4500000021 --debug

Exit codes:
    0  items printed
    1  token / MCP / transport failure (one-line reason; --debug for traceback)
    2  no items returned for the given PO
"""

import argparse
import asyncio
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

# Make the sibling tester module importable no matter the current directory,
# so the env resolution and token flow stay byte-for-byte identical.
sys.path.insert(0, str(Path(__file__).resolve().parent))

from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

from claude_sap_tester import load_env, xsuaa_token

# Force UTF-8 on stdout so the middot header never trips a cp1252 console.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

SERVICE_ID = "API_PURCHASEORDER_PROCESS_SRV"
ENTITY = "A_PurchaseOrderItemType"
# NetAmount is intentionally absent: this service's A_PurchaseOrderItemType read
# 404s when it is requested in $select. render_table still shows a NET AMOUNT
# column if any returned row happens to carry the field (the "if present" case).
SELECT = (
    "PurchaseOrder,PurchaseOrderItem,Material,PurchaseOrderItemText,"
    "OrderQuantity,PurchaseOrderQuantityUnit,NetPriceAmount,DocumentCurrency"
)

# Column layout: (header, source key, alignment, truncate-width).
COLUMNS = [
    ("ITEM", "PurchaseOrderItem", "l", None),
    ("MATERIAL", "Material", "l", None),
    ("TEXT", "PurchaseOrderItemText", "l", 30),
    ("QTY", "OrderQuantity", "r", None),
    ("UOM", "PurchaseOrderQuantityUnit", "l", None),
    ("NET PRICE", "NetPriceAmount", "r", None),
    ("CURR", "DocumentCurrency", "l", None),
]
NET_AMOUNT_COLUMN = ("NET AMOUNT", "NetAmount", "r", None)


class POLookupFailure(Exception):
    """An operational failure carrying a one-line, human-readable reason."""


def _leaf(exc: BaseException) -> BaseException:
    """Drill through anyio/asyncio ExceptionGroups to the underlying error."""
    while isinstance(exc, BaseExceptionGroup) and exc.exceptions:
        exc = exc.exceptions[0]
    return exc


def _first_line(text: str) -> str:
    for line in text.splitlines():
        line = line.strip()
        if line:
            return line[:200]
    return text[:200]


def _extract_rows(result) -> list:
    """Turn an execute-entity-operation result into a list of item dicts."""
    texts = [i.text for i in result.content if getattr(i, "text", None)]
    joined = "\n".join(texts).strip()

    if getattr(result, "isError", False):
        raise POLookupFailure(_first_line(joined) or "MCP tool returned an error")
    if not joined:
        return []

    # The server prefixes a human-readable status line before the JSON body,
    # so decode from the first JSON delimiter and ignore any trailing text.
    starts = [i for i in (joined.find("{"), joined.find("[")) if i != -1]
    if not starts:
        raise POLookupFailure(_first_line(joined))
    try:
        payload, _ = json.JSONDecoder().raw_decode(joined[min(starts):])
    except json.JSONDecodeError:
        raise POLookupFailure(_first_line(joined))

    # OData v2 shape returned by this service: {"d": {"results": [...]}}
    if isinstance(payload, dict) and isinstance(payload.get("d"), dict):
        rows = payload["d"].get("results", [])
        return rows if isinstance(rows, list) else []
    # Tolerate a bare list or an OData v4 {"value": [...]} envelope.
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict) and isinstance(payload.get("value"), list):
        return payload["value"]
    # Surface a structured error payload as a one-line reason.
    if isinstance(payload, dict) and "error" in payload:
        err = payload["error"]
        if isinstance(err, dict):
            msg = err.get("message", err)
            if isinstance(msg, dict):
                msg = msg.get("value", msg)
            err = msg
        raise POLookupFailure(str(err)[:200])
    return []


async def _read(url: str, token: str, po: str):
    async with streamablehttp_client(
        url, headers={"Authorization": f"Bearer {token}"}
    ) as (read, write, _):
        async with ClientSession(read, write) as session:
            await session.initialize()
            return await session.call_tool(
                "execute-entity-operation",
                {
                    "serviceId": SERVICE_ID,
                    "entityName": ENTITY,
                    "operation": "read",
                    "queryOptions": {
                        "$filter": f"PurchaseOrder eq '{po}'",
                        "$select": SELECT,
                    },
                },
            )


def fetch_items(po: str) -> list:
    # Acquire the token synchronously so a token failure raises a plain error
    # rather than being wrapped in the MCP session's ExceptionGroup.
    conf = load_env()
    token = xsuaa_token(conf)
    url = conf["SAP_MCP_URL"]
    result = asyncio.run(_read(url, token, po))
    # Parse outside the async context so POLookupFailure propagates cleanly.
    return _extract_rows(result)


def _truncate(value, width: int = 30) -> str:
    text = "" if value is None else str(value)
    return text if len(text) <= width else text[: width - 3] + "..."


def render_table(rows: list) -> str:
    cols = list(COLUMNS)
    if any(str(r.get("NetAmount", "")).strip() for r in rows):
        cols.append(NET_AMOUNT_COLUMN)

    matrix = []
    for r in rows:
        cells = []
        for _, key, _align, trunc in cols:
            value = r.get(key, "")
            value = "" if value is None else str(value)
            if trunc:
                value = _truncate(value, trunc)
            cells.append(value)
        matrix.append(cells)

    widths = []
    for idx, col in enumerate(cols):
        widest = len(col[0])
        for cells in matrix:
            widest = max(widest, len(cells[idx]))
        widths.append(widest)

    def fmt(cells) -> str:
        parts = []
        for idx, col in enumerate(cols):
            align = col[2]
            cell = cells[idx]
            parts.append(cell.rjust(widths[idx]) if align == "r" else cell.ljust(widths[idx]))
        return "  ".join(parts).rstrip()

    lines = [fmt([col[0] for col in cols])]
    lines.append("-" * (sum(widths) + 2 * (len(cols) - 1)))
    lines.extend(fmt(cells) for cells in matrix)
    return "\n".join(lines)


def header_line(po: str, n: int) -> str:
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    unit = "line" if n == 1 else "lines"
    return f"LIVE READ · S/4HANA over MCP · PO {po} · {n} {unit} · {ts}"


def run(po: str, as_json: bool) -> int:
    rows = fetch_items(po)
    if not rows:
        sys.stderr.write(f"PO {po}: no items returned (does it exist in this tenant?)\n")
        return 2
    if as_json:
        print(json.dumps(rows, indent=2))
        return 0
    print(header_line(po, len(rows)))
    print()
    print(render_table(rows))
    return 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="Live PO line-item lookup from S/4HANA over the SAP MCP."
    )
    p.add_argument("po", help="Purchase order number, e.g. 4500000021")
    p.add_argument("--json", action="store_true", help="Emit raw JSON rows instead of a table")
    p.add_argument("--debug", action="store_true", help="Show the full traceback on error")
    return p


def main() -> int:
    args = build_parser().parse_args()
    try:
        return run(args.po, args.json)
    except POLookupFailure as exc:
        sys.stderr.write(f"error: {exc}\n")
        return 1
    except Exception as exc:  # noqa: BLE001 -- one-line reason unless --debug
        if args.debug:
            raise
        leaf = _leaf(exc)
        sys.stderr.write(f"error: {type(leaf).__name__}: {leaf}\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
