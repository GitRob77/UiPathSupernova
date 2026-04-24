#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')
CWD=$(echo "$INPUT" | jq -r '.cwd')
BRANCH=$(git -C "$CWD" branch --show-current 2>/dev/null)

# Only guard main/master
if [[ "$BRANCH" != "main" && "$BRANCH" != "master" ]]; then
  exit 0
fi

# Check if user is a maintainer
if [[ -f "$CWD/CLAUDE.local.md" ]] && grep -qi "maintainer" "$CWD/CLAUDE.local.md"; then
  exit 0
fi

# Block non-maintainers on main
echo "Blocked: you're on '$BRANCH' and not listed as a maintainer in CLAUDE.local.md. Create a feature branch first." >&2
exit 2
