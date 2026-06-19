#!/usr/bin/env bash
# Flip the submission repo public and confirm the judge-facing essentials.
# Run from anywhere inside the repo. Requires: gh (authenticated), git.
#
#   bash scripts/go-public.sh
#
# Does NOT record the video, bind the agent in the designer, or submit on
# Devpost — those are yours. This just makes the repo public and prints the
# remaining human steps so nothing is forgotten on deadline day.
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

echo "==> Pre-flight checks"
git diff --quiet || { echo "  ! uncommitted changes — commit or stash first"; exit 1; }
git status -sb | head -1

# Refuse to publish if anything sensitive is tracked.
echo "==> Secret / client-data scan (must be empty)"
bad="$(git ls-files | grep -iE '\.docx$|\.pdf$|\.xlsx$|^\.env$|\.nupkg$' || true)"
if [ -n "$bad" ]; then echo "  ! tracked sensitive files:"; echo "$bad"; exit 1; fi
git grep -IlE 'Employer|ClientName|InternalProduct' -- . ':!scripts/go-public.sh' && {
  echo "  ! employer/client term found in tracked files — clean before publishing"; exit 1; } || true
echo "  ok — nothing sensitive tracked"

echo "==> Build gate"
npm run build >/dev/null 2>&1 && echo "  ok — build green" || { echo "  ! build failed"; exit 1; }

echo "==> Flipping repo public"
gh repo edit --visibility public --accept-visibility-change-consequences
gh repo edit --description "Governed-agency exchange settlement reconciliation on UiPath Maestro BPMN — variance agent + human-in-the-loop cockpit. AgentHack." >/dev/null 2>&1 || true

url="$(gh repo view --json url -q .url)"
echo ""
echo "==> Public: $url"
echo ""
echo "Still yours (the platform/Devpost can't be scripted):"
echo "  1. Designer: bind variance-agent in the agent task; attach an Action Center"
echo "     app to the human gate.  (.agent/submission/e2e-runbook.md)"
echo "  2. Record the <=5-min video — show Claude Code building it (bonus)."
echo "  3. Devpost: paste the description (.agent/submission/devpost-description.md),"
echo "     attach the deck (.agent/submission/deck-content.md), add the video link."
echo "  4. Optional: fill the Best Product Feedback form (\$1,500)."
