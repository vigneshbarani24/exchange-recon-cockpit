"""Multi-PO invoice run campaign against the deployed two-gate recon flow.

For each scenario: starts an instance of ExchangeReconBpmn (Shared/ExchangeReconCanvas),
watches element executions, sends ApproveGate/EscalateGate when the human gate arms
(scenarios with an expected decision), and records the full run — steps, agent job keys,
timings, ending — into src/data/runsManifest.json plus a raw trace per run under finale/runs/.

Usage (repo root):  python scripts/run_invoice_campaign.py [--only 1,4]
"""

import argparse
import concurrent.futures
import json
import subprocess
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://staging.uipath.com/hackathon26_751/DefaultTenant/orchestrator_"
FOLDER_ID = "3252146"
FOLDER_KEY = "e3945ea1-de36-4504-bf98-dc6503edc87f"
RELEASE_KEY = "476f603d-941f-43a7-bae8-50db4aa67f55"  # placeholder, resolved at runtime
POLL_SECONDS = 12
RUN_TIMEOUT_SECONDS = 10 * 60

SCENARIOS = [
    {
        "id": 1,
        "po": "4500000021",
        "invoice": "INV-88231",
        "scenario": "Price +10% and over-delivery on a 2-line PO",
        "decision": "approve",
        "supplier_document": (
            "Supplier invoice INV-88231, ref PO 4500000021, GBP. "
            "Line 1: Material RM27 (Packaging Box) 50 PC at 27.50 per ea. "
            "Line 2: Material RM16 6 PC at 2.00 per ea."
        ),
        "expected": "approved-corrected",
    },
    {
        "id": 2,
        "po": "4500001668",
        "invoice": "INV-90341",
        "scenario": "Clean 5-line invoice, exact match",
        "decision": None,
        "supplier_document": (
            "Supplier invoice INV-90341, ref PO 4500001668, GBP. "
            "Line 1: Material 1891 1 PC at 2000.00 per ea. "
            "Line 2: Material 1891 1 PC at 2000.00 per ea. "
            "Line 3: Material 1891 1 PC at 2000.00 per ea. "
            "Line 4: Material 1891 1 PC at 2000.00 per ea. "
            "Line 5: Material 1891 1 PC at 2000.00 per ea."
        ),
        "expected": "auto-approved",
    },
    {
        "id": 3,
        "po": "4500001676",
        "invoice": "INV-90355",
        "scenario": "Over-delivery: 18 units billed vs 15 ordered",
        "decision": "approve",
        "supplier_document": (
            "Supplier invoice INV-90355, ref PO 4500001676, GBP. "
            "Line 1: Material 734 18 PC at 13.00 per ea."
        ),
        "expected": "approved-corrected",
    },
    {
        "id": 4,
        "po": "4500001681",
        "invoice": "INV-90402",
        "scenario": "Price +10% on high-value line (3000 -> 3300)",
        "decision": "escalate",
        "supplier_document": (
            "Supplier invoice INV-90402, ref PO 4500001681, GBP. "
            "Line 1: Material 1891 1 PC at 3300.00 per ea."
        ),
        "expected": "escalated",
    },
    {
        "id": 5,
        "po": "4500001666",
        "invoice": "INV-90366",
        "scenario": "Price +1.01%, inside the 2% tolerance",
        "decision": None,
        "supplier_document": (
            "Supplier invoice INV-90366, ref PO 4500001666, GBP. "
            "Line 1: Material RM023 10 PC at 48.99 per ea."
        ),
        "expected": "auto-approved",
    },
    {
        "id": 6,
        "po": "4500001680",
        "invoice": "INV-90410",
        "scenario": "Under-delivery: 8 billed vs 11 ordered (EUR)",
        "decision": "escalate",
        "supplier_document": (
            "Supplier invoice INV-90410, ref PO 4500001680, EUR. "
            "Line 1: Material 6 8 PC at 100.00 per ea."
        ),
        "expected": "escalated",
    },
]


def log(msg: str) -> None:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)


def uip_token() -> str:
    out = subprocess.run(
        ["uip", "login", "refresh", "--output", "json"], capture_output=True, text=True, shell=True
    ).stdout
    data = json.loads(out[out.find("{"):])
    return data["Data"].get("AccessToken") or data["Data"]["access_token"]


def resolve_release(token: str) -> str:
    req = urllib.request.Request(
        BASE + "/odata/Releases?%24select=Key,Name",
        headers={"Authorization": f"Bearer {token}", "User-Agent": "curl/8.4.0", "X-UIPATH-OrganizationUnitId": FOLDER_ID},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        for rel in json.load(r).get("value", []):
            if rel["Name"] == "ExchangeReconBpmn":
                return rel["Key"]
    raise RuntimeError("ExchangeReconBpmn release not found")


def start_job(token: str, release_key: str, scenario: dict) -> str:
    body = json.dumps(
        {
            "startInfo": {
                "ReleaseKey": release_key,
                "Strategy": "ModernJobsCount",
                "JobsCount": 1,
                "InputArguments": json.dumps(
                    {
                        "purchaseOrder": scenario["po"],
                        "supplierDocument": scenario["supplier_document"],
                    }
                ),
            }
        }
    ).encode()
    req = urllib.request.Request(
        BASE + "/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs",
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {token}", "User-Agent": "curl/8.4.0",
            "X-UIPATH-OrganizationUnitId": FOLDER_ID,
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)["value"][0]["Key"]


def element_executions(job_key: str) -> dict:
    out = subprocess.run(
        [
            "uip", "maestro", "bpmn", "instance", "element-executions",
            job_key, "-f", FOLDER_KEY, "--output", "json",
        ],
        capture_output=True,
        text=True,
        shell=True,
    ).stdout
    start = out.find("{")
    if start < 0:
        return {}
    try:
        return json.loads(out[start:]).get("Data") or {}
    except json.JSONDecodeError:
        return {}


def send_gate(decision: str, po: str) -> None:
    name = "ApproveGate" if decision == "approve" else "EscalateGate"
    note = (
        "Accept the variance agent's proposed correction."
        if decision == "approve"
        else "Rejected by reviewer - route to buyer."
    )
    inputs = json.dumps(
        {"name": name, "reference": po, "itemData": {"decision": decision, "note": note}}
    )
    subprocess.run(
        ["uip", "maestro", "bpmn", "instance", "message", "send", "-f", FOLDER_KEY, "--inputs", inputs],
        capture_output=True,
        text=True,
        shell=True,
    )
    log(f"PO {po}: sent {name}")


def notify(title: str, *lines: str, status: str = "info") -> None:
    subprocess.run(
        ["python", str(ROOT / "scripts" / "notify_teams.py"), "--status", status, title, *lines],
        capture_output=True,
        text=True,
    )


def run_scenario(token: str, release_key: str, scenario: dict) -> dict:
    started = datetime.now(timezone.utc)
    job_key = start_job(token, release_key, scenario)
    log(f"PO {scenario['po']}: started instance {job_key}")
    sent = False
    deadline = time.time() + RUN_TIMEOUT_SECONDS
    data: dict = {}
    while time.time() < deadline:
        time.sleep(POLL_SECONDS)
        data = element_executions(job_key)
        if not data:
            continue
        statuses = {e["ElementId"]: e["Status"] for e in data.get("ElementExecutions", [])}
        if (
            not sent
            and scenario["decision"]
            and statuses.get("Event_Approve") == "InProgress"
        ):
            send_gate(scenario["decision"], scenario["po"])
            sent = True
        if data.get("Status") in ("Completed", "Faulted", "Cancelled"):
            break
    finished = datetime.now(timezone.utc)
    steps = []
    agent_jobs = {}
    ending = "unknown"
    for e in data.get("ElementExecutions", []):
        jk = e.get("JobKey") or (
            e["ElementRuns"][0].get("JobKey") if e.get("ElementRuns") else None
        )
        steps.append(
            {
                "elementId": e["ElementId"],
                "type": e["ElementType"],
                "extension": e.get("ElementExtensionType"),
                "status": e["Status"],
                "jobKey": jk,
                "started": e.get("StartedTimeUtc"),
                "completed": e.get("CompletedTimeUtc"),
            }
        )
        if e["ElementId"] == "Task_MatchAgent":
            agent_jobs["matching"] = jk
        if e["ElementId"] == "Task_VarianceAgent":
            agent_jobs["variance"] = jk
        if e["ElementId"] == "Task_PostingPrepAgent":
            agent_jobs["postingPrep"] = jk
        if e["ElementType"] == "EndEvent" and e["Status"] == "Completed":
            ending = {
                "End_AutoApproved": "auto-approved",
                "End_Corrected": "approved-corrected",
                "End_Escalated": "escalated",
            }.get(e["ElementId"], e["ElementId"])
    record = {
        "id": scenario["id"],
        "po": scenario["po"],
        "invoice": scenario["invoice"],
        "scenario": scenario["scenario"],
        "decision": scenario["decision"] or "auto",
        "expected": scenario["expected"],
        "ending": ending,
        "instanceStatus": data.get("Status"),
        "instanceId": job_key,
        "agentJobs": agent_jobs,
        "startedUtc": started.isoformat(timespec="seconds"),
        "finishedUtc": finished.isoformat(timespec="seconds"),
        "durationSec": int((finished - started).total_seconds()),
        "steps": steps,
    }
    (ROOT / "finale" / "runs").mkdir(parents=True, exist_ok=True)
    (ROOT / "finale" / "runs" / f"run-{scenario['id']}-po{scenario['po']}.json").write_text(
        json.dumps(data, indent=1), encoding="utf-8"
    )
    ok = ending == scenario["expected"]
    log(
        f"PO {scenario['po']}: {data.get('Status')} -> {ending} "
        f"({'as expected' if ok else 'EXPECTED ' + scenario['expected']}) in {record['durationSec']}s"
    )
    notify(
        f"Run {scenario['id']}/{len(SCENARIOS)}: PO {scenario['po']} -> {ending}",
        scenario["scenario"],
        f"Instance {job_key} | {record['durationSec']}s | agents: {len(agent_jobs)}",
        status="good" if ok else "warn",
    )
    return record


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", help="comma-separated scenario ids")
    args = parser.parse_args()
    chosen = SCENARIOS
    if args.only:
        ids = {int(x) for x in args.only.split(",")}
        chosen = [s for s in SCENARIOS if s["id"] in ids]
    token = uip_token()
    release_key = resolve_release(token)
    log(f"release {release_key}; running {len(chosen)} scenarios in waves of 2")
    records = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        futures = [pool.submit(run_scenario, token, release_key, s) for s in chosen]
        for f in concurrent.futures.as_completed(futures):
            records.append(f.result())
    records.sort(key=lambda r: r["id"])
    manifest_path = ROOT / "src" / "data" / "runsManifest.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    existing = []
    if manifest_path.exists():
        existing = [
            r
            for r in json.loads(manifest_path.read_text(encoding="utf-8"))
            if r["id"] not in {x["id"] for x in records}
        ]
    manifest = sorted(existing + records, key=lambda r: r["id"])
    manifest_path.write_text(json.dumps(manifest, indent=1), encoding="utf-8")
    log(f"manifest written: {manifest_path} ({len(manifest)} runs)")
    good = sum(1 for r in records if r["ending"] == r["expected"])
    notify(
        f"Campaign done: {good}/{len(records)} runs ended as expected",
        *[f"#{r['id']} PO {r['po']}: {r['ending']} ({r['durationSec']}s)" for r in records],
        status="good" if good == len(records) else "warn",
    )


if __name__ == "__main__":
    main()
