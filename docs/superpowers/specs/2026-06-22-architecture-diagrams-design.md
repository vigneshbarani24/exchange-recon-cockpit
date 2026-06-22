# Architecture Diagrams — Design Spec

## Context

The AgentHack submission (Track 2, Maestro BPMN) needs a deck-grade visual story. The current
single-page `.agent/submission/architecture.drawio` is functional but plain and internal. This spec
replaces it with a **consistent, UiPath-branded, multi-page diagram set** that leverages UiPath's
visual language and winning-submission patterns, so the deck / Devpost / video carry the architecture
clearly and on-brand.

**Audience:** AgentHack judges. Each diagram maps to a rubric beat (Presentation, Platform Usage,
Creativity, Technical Execution). **Why now:** the submission is built and deployed; the remaining
gap to "winning" is presentation — a clear, on-brand visual story that makes the platform breadth and
the real-SAP differentiator obvious at a glance.

## Goals / non-goals

- **Goal:** one editable, multi-page draw.io file — 5 (+1 optional) diagrams in a single shared visual
  system, exportable page-by-page to PNG by VB.
- **Non-goals:** not building the deck itself (VB composes in Canva/PowerPoint); not auto-rendering
  PNGs (no draw.io renderer in this environment — VB exports); not Canva-generated or Excalidraw
  diagrams (precision matters for architecture).

## Visual system (shared across every page)

- **Palette:** UiPath orange `#FA4616` (accent) · ink/navy `#1A1F36` · neutrals `#F4F5F7` / `#6B7280`
  on white.
- **Governed-agency color code — identical on every page:**
  - **Agent** → orange `#FDE4DB` fill / `#FA4616` stroke (agents wear the brand color — they're the hero).
  - **Deterministic** → steel blue `#DCE6F4` / `#2E5AAC`.
  - **Human** → gold `#FBEFD4` / `#D99A2B`.
  - **SAP** → Fiori blue `#E5F2FB` / `#0A6ED1`. **MCP** → violet `#ECE3F5` / `#7A3FB0`.
  - **Neutral/start-end** → grey `#F4F5F7` / `#9AA0AB`.
- **Form:** rounded rectangles, thin strokes, one sans typeface, bold navy titles.
- **Frame (every page):** a title bar (page title) + a footer strip:
  `Track 2 · Agentic P2P Reconciliation · live SAP S/4HANA via MCP · built with Claude Code`.

## The diagrams (one draw.io page each)

1. **The problem** *(sets up Business Impact).* Left: a supplier-invoice card (2 lines). Right: a PO
   card (2 lines, different price/qty). A bold `≠` between them; a small "£ payment blocked / clock"
   motif. Almost no prose — pure tension.
2. **Governed agency** *(Creativity / the thesis).* Three vertical lanes — **Deterministic · Agent ·
   Human** — each with its role bullets, color-coded. A banner across the top:
   *"Agents read & propose — never write to SAP. A human authorizes; a deterministic step posts."*
3. **Platform architecture** *(Platform Usage).* Layered top→bottom: **Cockpit (React/TS SDK)** →
   **UiPath Maestro BPMN** (orchestration band) → the **3 Coded LangGraph Agents** (matching ·
   variance · posting-prep) → **MCP server (BTP · XSUAA)** → **SAP S/4HANA Cloud** cylinder.
   **Orchestrator** (deployed-on) and **Action Center** (human gate) called out as side tags. Conveys
   "the full platform surface, used for real."
4. **The differentiator** *(Technical Execution / the money slide).* Focused: **Agent → MCP
   (discover · read) → live S/4** cylinder. A callout box: *"Input: only the supplier's numbers →
   Output: the PO side (£25.00, qty 5). It could only come from live SAP."* Small "deployed as an
   Orchestrator job" tag.
5. **End-to-end flow** *(Completeness).* The refined reconciliation sequence (port the existing
   single-page diagram into the shared palette): invoice → matching → tolerance gateway → variance →
   human gate → posting-prep → **held write-back** → close, with read arrows to MCP→SAP and the
   write-back dashed/"armed, not fired." A `deterministic / agent / human` legend.
6. **(optional) Built with Claude Code** *(Coding-Agents bonus).* A loop: spec → **Claude Code** →
   coded agent → `uipath deploy` → **Orchestrator job** → verified commit. Tagline: *"spec-driven,
   small verified commits."*

## Deliverable & file structure

- **`docs/architecture-deck.drawio`** — one `<mxfile>` with one `<diagram>` page per beat, named
  `01-problem`, `02-governed-agency`, `03-platform`, `04-differentiator`, `05-flow`,
  `06-claude-code`.
- **`docs/diagrams/README.md`** — the palette reference, the beat→rubric-criterion map, and the export
  steps (open in diagrams.net → File → Export → PNG, per page).
- The existing `.agent/submission/architecture.drawio` is **superseded**; its content becomes page
  `05-flow` (re-palette'd). Leave the old file in place (no delete); the canonical set is the docs file.

## Honesty constraint

Pages 3 and 5 must not imply the Maestro **instance** runs end-to-end. Label the orchestration as the
**architecture/flow** (built + validated); the agent is what's live (deployed Orchestrator job).
Consistent with `.agent/submission/rubric-map.md` and the submission honesty guardrail.

## Verification

- The `.drawio` opens in diagrams.net with **all pages rendering** (XML well-formed; valid mxGraph —
  no stray tags like the bug fixed in the first draft).
- **Palette consistency:** the five color-code values are byte-identical across pages (grep the file).
- Each page **exports to a clean PNG** with no overlap/clipping (VB confirms visually).
- Self-check in this environment (no renderer): validate XML well-formedness and that every page's
  cells reference valid parents/sources/targets.
