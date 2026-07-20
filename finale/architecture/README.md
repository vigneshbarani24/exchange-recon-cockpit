# finale/architecture/ — the SAP-BTP architecture diagram

`exchange-recon-sap-btp.drawio` — a **SAP Architecture Center-style** topology of the governed procure-to-pay reconciliation, relabeled to our **UiPath × SAP** stack. Built with the `sap-architecture` skill; validated (SAP-likeness ~85/100).

## What it shows (4 zones)
- **Client** — the Ops Cockpit (React SPA) signs in via **OAuth PKCE**.
- **UiPath Automation Cloud** — **Maestro (BPMN)** orchestration + Action Center human gate + LLM Gateway. This is the *execution* governance.
- **Coded Agents · MCP integration** — the 3 coded LangGraph agents (matching · variance · posting-prep) call the **SAP OData→MCP** server (on SAP BTP), authenticated by **XSUAA client-credentials**.
- **SAP S/4HANA Cloud** — `A_PurchaseOrderItem` is **read LIVE**; goods-receipt and vendor-master reads are **roadmap**.

Read **LIVE** (solid) · write **HELD** · **Warden** = the cross-platform *policy* decide-gate (roadmap layer, per `ROADMAP.md`).

## Flow
1. Ops user → cockpit, **OAuth PKCE** to UiPath Automation Cloud.
2. **Maestro** starts the coded agents (StartAgentJob).
3. Agents authenticate with **XSUAA** client-credentials (green auth edge).
4. Agents call the **SAP OData→MCP** server (MCP · read).
5. MCP reads **A_PurchaseOrderItem** from S/4HANA (OData · **LIVE**); goods-receipt / vendor-master are roadmap reads.
6. The write-back is **HELD** — a human approves in Action Center; a deterministic step would post. (Not drawn as wired; see `VERIFIED-STATE.md`.)

## To finish it (no draw.io on the build machine)
This machine has no draw.io renderer, so the PNG wasn't auto-generated. To export + drop on **deck slide 5**:
1. Open **app.diagrams.net** (free, no install) → *Open* → this `.drawio`.
2. Optional polish: retheme the *UiPath Automation Cloud* zone accent to UiPath orange (`#FA4616`); add a **Warden** box in that zone as the policy decide-gate above the agents (per your call to feature it).
3. *File → Export as → PNG* (2×, transparent) → drop it on deck slide 5 (replaces the "[paste flow diagram]" placeholder).

Built with the `sap-architecture` skill (SAP Architecture Center visual system). To regenerate/iterate: `python .claude/skills/sap-architecture/scripts/render_semantic.py "<request>" --archetype ai-agent --out <file>` then relabel.
