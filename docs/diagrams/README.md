# Architecture diagrams

`../architecture-deck.drawio` — one multi-page draw.io file, **one page per narrative beat**, in a
shared UiPath-branded visual system. Built to the spec at
`docs/superpowers/specs/2026-06-22-architecture-diagrams-design.md`.

## Export to PNG (for the deck / Devpost / video)
1. Open `architecture-deck.drawio` at [diagrams.net](https://app.diagrams.net) (File → Open).
2. Switch pages via the tabs at the bottom (`01-problem` … `06-claude-code`).
3. Per page: **File → Export as → PNG** (transparent off, border ~10, scale 2× for crisp slides).

## Pages → rubric beat
| Page | Beat | Scores |
| --- | --- | --- |
| `01-problem` | invoice ≠ PO, payment blocked | Business Impact |
| `02-governed-agency` | deterministic / agent / human lanes | Creativity (the thesis) |
| `03-platform` | the full UiPath stack → SAP | Platform Usage |
| `04-differentiator` | agent → MCP → live S/4 + the proof callout | Technical Execution (money slide) |
| `05-flow` | end-to-end reconciliation sequence | Completeness |
| `06-claude-code` | spec → Claude Code → deployed job loop | Coding-Agents bonus |

## Palette (keep consistent if you edit)
- Accent: UiPath orange `#FA4616` · ink/navy `#1A1F36` · neutrals `#F4F5F7` / `#6B7280`.
- **Color code:** Agent `#FDE4DB`/`#FA4616` · Deterministic `#DCE6F4`/`#2E5AAC` ·
  Human `#FBEFD4`/`#D99A2B` · SAP `#E5F2FB`/`#0A6ED1` · MCP `#ECE3F5`/`#7A3FB0`.

## Honesty note
Pages 3 and 5 show the Maestro orchestration as **architecture/flow** (built + validated). What's
**live** is the agent (deployed Orchestrator job). Don't caption them as "the instance ran
end-to-end." See `.agent/submission/rubric-map.md`.
