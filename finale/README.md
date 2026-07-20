# finale/ — July 23, 2026 finale win package

Grounded prep for the UiPath AgentHack 2026 live finale. Everything here is written against the **verified** state of this repo (four read-only audits + primary git/job evidence + both source decks), not against aspiration. When a claim is an estimate, it says so.

| File | What it is |
|---|---|
| `VERIFIED-STATE.md` | The single source of truth: what is proven-live, what is built-not-run, what is held, what is aspirational. Every other doc defers to this. Read first. |
| `WIN-PROBABILITY.md` | Grounded, cited estimate of the odds — field math, criteria scorecard, judge fit, and the 5 levers that move the number. |
| `DEMO-RUNBOOK.md` | The finale demo prep: lead-live path, pre-flight (re-auth + secret), the one live beat, and the fallback-video protocol. |
| `DECK-STRATEGY.md` | How to fuse the *Workforce-to-Workflow* thesis deck into the official Cinder template, mapped to the 5 judging criteria. |
| `DECK-CONTENT.md` | The 8-slide deck content, paste-ready — the source for the built deck below. |
| `AgentHack-2026-Workforce-to-Workflow.pptx` | **The finale deck** — filled into the official Cinder template, 7 slides, branded. Present from this. |
| `QA-BANK.md` | The 3-minute jury Q&A — answer-first responses for both judges + the honesty/trap answers. |
| `RUBRIC-MATCH.md` | How each of the 5 finale criteria (+ coding bonus) is won — per-criterion evidence, the exact moment, score, and the remaining moves. |
| `RUN-LIVE.md` | Step-by-step to run the agents + cockpit live yourself (validated commands, the per-folder token gotcha). |
| `BACKUPS.md` | Backups-to-backups — layered fallback so the demo cannot fail, plus a capture checklist. |
| `ROADMAP.md` | Where it goes — adoption anchor (anonymized customer), IXP invoice ingestion, two-layer governance (Warden + UiPath). |
| `receipts/` | Live-run proof — all three agents' fresh output against real SAP (2026-07-20). |

## The one-line status
A genuine contender on **Platform Usage (4.5/5)**, **Creativity (4/5)**, and a governance story unusually aligned with the two product-VP judges — currently held back by **no quantified close, no finale deck, and two Q&A gaps**. All three are fixable in the days before July 23 without writing a line of product code.

## The decisions locked (from VB)
- **No new build.** Bundle what exists into one solid, honest story. Reground the demo to the real hero; retire the fictional six-invoice/fraud parade.
- **Lead live.** One genuinely-live beat on stage, recorded run cued as fallback.

## Source decks (in `Downloads/`, rendered to `scratchpad/wtw_slides/`)
- `Submission deck AgentHack 2026.pptx` — the blank official **Cinder** template (Title / Team / Problem+Solution / Benefits+Tech / Architecture / Misc / Closing).
- `Workforce_to_Workflow (1).pptx` — the enterprise AI-discovery **thesis** deck (labor concentration → the 75% repeatable target). The "why" that frames the project.
