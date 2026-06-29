# Architecture diagrams

Two sets, both in this folder. Open any `.drawio` at [diagrams.net](https://app.diagrams.net)
(File → Open) and **File → Export as → PNG** (scale 2×) for the deck / Devpost / video.

## 1. Technical diagram set (this submission) — `*.drawio`, one view per file

| File | Audience | What it proves |
| --- | --- | --- |
| `context.drawio` | Judge (60-sec glance) | The system as one box + the real external systems it talks to (SAP S/4HANA, UiPath Orchestrator/Maestro, LLM Gateway). All external links **live**. |
| `sequence.drawio` | Judge + engineer | The demo-path flow: supplier invoice + PO → matching → tolerance → variance → human gate → posting-prep → **Update PO (held)**. The held write is dashed. |
| `components.drawio` | Engineer | Container view by layer (client / orchestration / agents / integrations / data), edges labelled with protocol (OAuth PKCE, MCP `execute-entity-operation`, `StartAgentJob`, LLM call). |
| `agents.drawio` | Engineer | The Maestro BPMN control flow — three `StartAgentJob` nodes, deterministic tolerance gateway, human gate, decision, escalation boundaries. |
| `deployment.drawio` | Engineer | Where each piece runs (UiPath Orchestrator Serverless runtime, SAP BTP MCP server, SAP S/4HANA) + trust boundaries + the capacity-constraint note. |
| `index.drawio` | — | Combined one-page overview of the above. |

**Legend (on every diagram):** solid blue/green = **LIVE** (real path; the variance-agent read is
proven, Job `dbedd8aa…`). Dashed grey = **MOCKED / HELD / aspirational** (the S/4 write-back).

## 2. Narrative pitch deck — `../architecture-deck.drawio`

One multi-page draw.io file, **one page per narrative beat** (`01-problem` … `06-claude-code`), in a
UiPath-branded visual system. Use this for the slide deck; use set 1 for the README/ARCHITECTURE and
the "under the hood" video beat. Spec: `docs/superpowers/specs/2026-06-22-architecture-diagrams-design.md`.

| Page | Beat | Scores |
| --- | --- | --- |
| `01-problem` | invoice ≠ PO, payment blocked | Business Impact |
| `02-governed-agency` | deterministic / agent / human lanes | Creativity (the thesis) |
| `03-platform` | the full UiPath stack → SAP | Platform Usage |
| `04-differentiator` | agent → MCP → live S/4 + the proof callout | Technical Execution (money slide) |
| `05-flow` | end-to-end reconciliation sequence | Completeness |
| `06-claude-code` | spec → Claude Code → deployed job loop | Coding-Agents bonus |

Palette (keep consistent): accent UiPath orange `#FA4616` · ink/navy `#1A1F36` · neutrals
`#F4F5F7`/`#6B7280`. Color code: Agent `#FDE4DB`/`#FA4616` · Deterministic `#DCE6F4`/`#2E5AAC` ·
Human `#FBEFD4`/`#D99A2B` · SAP `#E5F2FB`/`#0A6ED1` · MCP `#ECE3F5`/`#7A3FB0`.

## Honesty note
The orchestration views (`agents.drawio`, `sequence.drawio`, deck pages 3/5) show the Maestro as
**architecture/flow** — built, validated, and **deployed**, instance launches. What is *proven live*
is the **agent** (deployed Orchestrator job reading real S/4). Do **not** caption any of them as "the
instance ran end-to-end" or "the gate cleared" — see [`../../.agent/submission/PHASE1-rubric-and-requirements.md`](../../.agent/submission/PHASE1-rubric-and-requirements.md).
