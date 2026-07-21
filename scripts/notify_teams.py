"""Post a styled status card to the Teams channel via the Power Automate webhook.

Usage:
    python scripts/notify_teams.py [--status good|warn|bad|info] "Title" [line ...]

Lines shaped like "Key: value" render as a fact table; other lines render as text.
Card is Adaptive Card v1.2 (maximum Teams compatibility). The webhook URL is read from
TEAMS_WEBHOOK_URL or the gitignored scripts/.teams-webhook - never commit it.
"""

import json
import os
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

STYLE = {
    "good": {"container": "good", "glyph": "✅", "accent": "Good"},
    "warn": {"container": "warning", "glyph": "⚠️", "accent": "Warning"},
    "bad": {"container": "attention", "glyph": "❌", "accent": "Attention"},
    "info": {"container": "emphasis", "glyph": "\U0001f537", "accent": "Accent"},
}

ORCHESTRATOR_URL = (
    "https://staging.uipath.com/hackathon26_751/DefaultTenant/orchestrator_/"
    "?tid=743053&fid=3252146"
)
SAP_URL = "https://my405139.s4hana.cloud.sap/ui#PurchaseOrder-manage"


def webhook_url() -> str:
    url = os.environ.get("TEAMS_WEBHOOK_URL", "").strip()
    if not url:
        secret_file = Path(__file__).parent / ".teams-webhook"
        if secret_file.exists():
            url = secret_file.read_text(encoding="utf-8").strip()
    if not url:
        sys.exit("No webhook: set TEAMS_WEBHOOK_URL or create scripts/.teams-webhook")
    return url


def build_card(title: str, lines: list[str], status: str) -> dict:
    s = STYLE.get(status, STYLE["info"])
    facts = []
    prose = []
    for line in lines:
        if ": " in line and len(line.split(": ", 1)[0]) <= 28:
            key, _, value = line.partition(": ")
            facts.append({"title": key.strip(), "value": value.strip()})
        else:
            prose.append(line)

    header = {
        "type": "Container",
        "style": s["container"],
        "bleed": True,
        "items": [
            {
                "type": "ColumnSet",
                "columns": [
                    {
                        "type": "Column",
                        "width": "auto",
                        "verticalContentAlignment": "Center",
                        "items": [
                            {"type": "TextBlock", "text": s["glyph"], "size": "ExtraLarge"}
                        ],
                    },
                    {
                        "type": "Column",
                        "width": "stretch",
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": title,
                                "weight": "Bolder",
                                "size": "Large",
                                "wrap": True,
                            },
                            {
                                "type": "TextBlock",
                                "text": "EXCHANGE RECON · GOVERNED P2P · LIVE SAP",
                                "size": "Small",
                                "isSubtle": True,
                                "spacing": "None",
                            },
                        ],
                    },
                ],
            }
        ],
    }

    body: list[dict] = [header]
    if prose:
        body.append(
            {
                "type": "Container",
                "spacing": "Medium",
                "items": [
                    {"type": "TextBlock", "text": p, "wrap": True, "spacing": "Small"}
                    for p in prose
                ],
            }
        )
    if facts:
        body.append(
            {
                "type": "Container",
                "spacing": "Medium",
                "separator": True,
                "items": [{"type": "FactSet", "facts": facts}],
            }
        )
    body.append(
        {
            "type": "TextBlock",
            "text": f"{datetime.now().strftime('%d %b %Y %H:%M')} · 3 coded agents · Maestro BPMN · write-back held",
            "size": "Small",
            "isSubtle": True,
            "separator": True,
            "spacing": "Medium",
        }
    )

    return {
        "type": "message",
        "attachments": [
            {
                "contentType": "application/vnd.microsoft.card.adaptive",
                "content": {
                    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                    "type": "AdaptiveCard",
                    "version": "1.2",
                    "msteams": {"width": "Full"},
                    "body": body,
                    "actions": [
                        {
                            "type": "Action.OpenUrl",
                            "title": "Orchestrator ↗",
                            "url": ORCHESTRATOR_URL,
                        },
                        {"type": "Action.OpenUrl", "title": "SAP S/4HANA ↗", "url": SAP_URL},
                    ],
                },
            }
        ],
    }


def main() -> None:
    args = sys.argv[1:]
    status = "info"
    if args and args[0] == "--status":
        status = args[1]
        args = args[2:]
    if not args:
        sys.exit("Usage: notify_teams.py [--status good|warn|bad|info] TITLE [LINE ...]")
    payload = json.dumps(build_card(args[0], args[1:], status)).encode()
    req = urllib.request.Request(
        webhook_url(), data=payload, headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        print(f"teams: HTTP {resp.status}")


if __name__ == "__main__":
    main()
