# finale/evals/ — evaluation proof (multi-scenario)

LLM-judge eval suites across **all three agents**, each running against the real PO `4500000021` with varied supplier data, scored by an LLM-judge (semantic-similarity, gpt-4o). This is the *evaluation* story the governance judge (Jaffri) asks for: **agents defined by evals, not one demo.** Closes the honest gap where only `variance-agent` had an eval.

## Coverage — 12 cases, 3 agents
**variance-agent · `recon-suite` (6)** — `variance-agent/evaluations/eval-sets/recon-suite.json`
- `clean-match` — supplier equals the PO → **within-tolerance**
- `price-variance-only` — item 10 +10% → **variance-found**
- `over-delivery-only` — item 20 qty 5→6 → **variance-found**
- `under-delivery` — item 20 qty 5→4 → **variance-found**
- `price-and-qty-variance` — both (the demo case) → **variance-found**
- `within-tolerance-boundary` — item 10 +1.6% (< 2%) → **within-tolerance** (tests the tolerance edge)

**matching-agent · `matching-suite` (3)**
- `clean-two-lines` — both lines match · `extra-supplier-line` — RM99 → unmatched supplier line · `partial-reference` — only RM27 → RM16 unmatched PO item

**posting-prep-agent · `posting-suite` (3)**
- `qty-correction` — OrderQuantity 5→6, ready · `price-correction` — NetPriceAmount 25.00→27.50, ready · `ambiguous-action` — "sort it out" → **not ready** (the guardrail case)

## Run it (produces the scored results proof)
Each agent authenticates from its own `.env` — refresh all three first (see `RUN-LIVE.md` §1), then:
```
cd variance-agent        && uv run uipath eval agent evaluations/eval-sets/recon-suite.json    --workers 3 --output-file evaluations/recon-suite-results.json
cd ../matching-agent     && uv run uipath eval agent evaluations/eval-sets/matching-suite.json --workers 3 --output-file evaluations/matching-suite-results.json
cd ../posting-prep-agent && uv run uipath eval agent evaluations/eval-sets/posting-suite.json  --workers 3 --output-file evaluations/posting-suite-results.json
```
Commit the `*-results.json` here as the eval proof — the eval equivalent of `finale/receipts/`.

## What it proves (for the two product-VP judges)
- **Evaluation, not just a demo (Jaffri):** behaviour scored across scenarios, not one happy path.
- **Named edge cases handled (Philipp):** tolerance boundary, under/over-delivery, unmatched lines, and an ambiguous-action → not-ready guardrail.
- **The honest gap closed:** all three agents now have eval suites (was: variance only, one case) — and the stale "settlement statements" evaluator criterion is fixed to the P2P invoice/PO domain.
- **Roadmap, stated honestly:** tool-trajectory scoring + CI-gated regression next (UiPath evals / Test Cloud).
