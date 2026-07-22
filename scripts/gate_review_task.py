"""Action Center bridge: create an app task for a suspended gate, relay the outcome.

Usage (once an Action App exists in the folder):
  python scripts/gate_review_task.py --app-id <guid> --po 4500000021 \
      [--summary "text shown to the reviewer"] [--folder-id 3253138]

Creates an AppTask in Action Center carrying the review evidence, polls until a human
completes it, maps the chosen action (Approve/Escalate) to the correlated gate message,
and sends it. The gate mechanics stay untouched: the task is the reviewer surface, the
decision still travels as the governed message whose name is the decision.
"""
import argparse
import json
import subprocess
import sys
import time
import urllib.request

BASE = "https://staging.uipath.com/hackathon26_751/DefaultTenant/orchestrator_"
PIMS = "https://staging.uipath.com/hackathon26_751/DefaultTenant/pims_/api/v1"
TWIN_FOLDER_ID = "3253138"
TWIN_FOLDER_KEY = "7ca50286-caae-4746-a228-c293e65bfd83"


def token() -> str:
    out = subprocess.run(["uip", "login", "refresh", "--output", "json"],
                         capture_output=True, text=True, shell=True).stdout
    data = json.loads(out[out.find("{"):])
    return data["Data"].get("AccessToken") or data["Data"]["access_token"]


def call(tok: str, method: str, url: str, folder_id: str, body=None):
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode() if body is not None else None,
        method=method,
        headers={"Authorization": f"Bearer {tok}", "User-Agent": "curl/8.4.0",
                 "X-UIPATH-OrganizationUnitId": folder_id,
                 "Content-Type": "application/json", "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read().decode()
            return r.status, json.loads(raw) if raw.strip() else {}
    except urllib.error.HTTPError as e:
        return e.code, {"error": e.read().decode()[:400]}


def send_gate(tok: str, folder_key: str, decision: str, po: str, note: str):
    name = "ApproveGate" if decision == "approve" else "EscalateGate"
    body = {"name": name, "reference": po,
            "itemData": {"decision": decision, "note": note}}
    req = urllib.request.Request(
        PIMS + "/instances/messages/send", data=json.dumps(body).encode(),
        method="POST",
        headers={"Authorization": f"Bearer {tok}", "User-Agent": "curl/8.4.0",
                 "x-uipath-folderkey": folder_key,
                 "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--app-id", required=True, help="Action App id (GUID)")
    ap.add_argument("--app-version", type=int, default=1)
    ap.add_argument("--po", required=True)
    ap.add_argument("--summary", default="Variance review: see the instance trace.")
    ap.add_argument("--folder-id", default=TWIN_FOLDER_ID)
    ap.add_argument("--folder-key", default=TWIN_FOLDER_KEY)
    ap.add_argument("--wait-minutes", type=int, default=30)
    args = ap.parse_args()

    tok = token()
    status, created = call(tok, "POST", BASE + "/tasks/AppTasks/CreateAppTask",
                           args.folder_id, {
        "appId": args.app_id,
        "appVersion": args.app_version,
        "title": f"Recon gate review: PO {args.po}",
        "priority": "High",
        "data": {"purchaseOrder": args.po, "summary": args.summary,
                 "note": "Approve to accept the prepared correction; Escalate to route to the buyer."},
    })
    print("CREATE:", status, json.dumps(created)[:240])
    if status not in (200, 201):
        sys.exit("Task creation failed; check app id/version and folder.")
    task_id = created.get("Id") or created.get("id")
    print(f"Action Center task {task_id} created. Waiting for the reviewer...")

    deadline = time.time() + args.wait_minutes * 60
    while time.time() < deadline:
        status, task = call(tok, "GET", BASE + f"/odata/Tasks({task_id})", args.folder_id)
        state = (task.get("Status") or "").lower()
        if state == "completed":
            action = (task.get("Action") or "").strip().lower()
            decision = "approve" if "approve" in action else "escalate"
            print(f"Reviewer chose: {task.get('Action')} -> sending {decision} message")
            result = send_gate(token(), args.folder_key, decision, args.po,
                               f"Decided in Action Center task {task_id} ({task.get('Action')}).")
            print("GATE MESSAGE SENT:", json.dumps(result)[:160])
            return
        time.sleep(10)
    sys.exit("Reviewer did not complete the task in time; gate untouched (timer governs).")


if __name__ == "__main__":
    main()
