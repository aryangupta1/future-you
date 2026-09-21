#!/usr/bin/env bash
# SessionStart hook: injects docs/next-prompt.md (the previous session's
# handoff) into Claude's context. Skip it with FUTURE_YOU_SKIP_HANDOFF=1, or
# tell Claude in your first message to ignore it.
set -euo pipefail

root="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
file="$root/docs/next-prompt.md"

[ "${FUTURE_YOU_SKIP_HANDOFF:-}" = "1" ] && exit 0
[ -s "$file" ] || exit 0

{
  echo "Handoff from the previous session (docs/next-prompt.md), injected by the SessionStart hook."
  echo "Treat it as the starting brief. If the user's first message says to ignore the handoff or start fresh, disregard it."
  echo
  cat "$file"
} | jq -Rs '{hookSpecificOutput: {hookEventName: "SessionStart", additionalContext: .}}'
