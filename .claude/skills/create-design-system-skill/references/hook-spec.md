# Hook Specification — PostToolUse Design Token Enforcement

A `PostToolUse` hook that deterministically blocks file writes containing forbidden patterns. Uses exit code `2` + JSON `{"decision":"block","reason":"..."}` to halt the agent write.

The hook is **not generated automatically** — it is only created when the user requests it or `.github/hooks/` already exists in the project. The patterns to check are determined by the detected stacks.

---

## Hook Config: `design-token-check.json`

**Location:** `.github/hooks/design-token-check.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "create_file|replace_string_in_file|multi_replace_string_in_file",
        "hooks": [
          {
            "type": "command",
            "osx": "bash .github/hooks/scripts/design-token-check.sh",
            "linux": "bash .github/hooks/scripts/design-token-check.sh",
            "windows": "pwsh -NonInteractive -File .github/hooks/scripts/design-token-check.ps1",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

---

## Bash Script: `design-token-check.sh`

**Location:** `.github/hooks/scripts/design-token-check.sh`
**After creating:** `chmod +x .github/hooks/scripts/design-token-check.sh`

The script is **modular**: each stack section is a standalone block. Only include the blocks for the stacks present in the project.

```bash
#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
FILE=$(echo "$INPUT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(d.get('filePath') or d.get('path') or '')
" 2>/dev/null || echo "")

[[ -z "$FILE" ]] && exit 0

VIOLATIONS=""

# ────────────────────────────────────────────────────────────────────────────
# DART / FLUTTER  (skip app_theme.dart — raw hex is permitted there)
# ────────────────────────────────────────────────────────────────────────────
if [[ "$FILE" == *.dart ]] && [[ "$FILE" != */app_theme.dart ]]; then
  if grep -qP 'Color\(0xFF[0-9A-Fa-f]{6}\)' "$FILE" 2>/dev/null; then
    VIOLATIONS="${VIOLATIONS}- Raw Color(0xFF…) literal — use AppColors.* constants instead.\n"
  fi
  if grep -qP '\bTextStyle\s*\(' "$FILE" 2>/dev/null; then
    VIOLATIONS="${VIOLATIONS}- Raw TextStyle(…) construction — use AppTextStyles.* with .copyWith(color:).\n"
  fi
fi

# ────────────────────────────────────────────────────────────────────────────
# CSS / SCSS / WEB  (skip token-definition files)
# ────────────────────────────────────────────────────────────────────────────
if [[ "$FILE" =~ \.(css|scss|ts|tsx|js|jsx|vue|svelte)$ ]] \
   && [[ "$FILE" != */tokens.css ]] \
   && [[ "$FILE" != */variables.css ]] \
   && [[ "$FILE" != */theme.css ]]; then
  if grep -vP '^\s*(--|/\*|\*|:root|\/\/)' "$FILE" 2>/dev/null \
       | grep -qP '#[0-9A-Fa-f]{3,6}\b'; then
    VIOLATIONS="${VIOLATIONS}- Raw hex color found — use CSS custom property vars instead.\n"
  fi
fi

# ────────────────────────────────────────────────────────────────────────────
# SWIFT / SWIFTUI  (skip Color.swift / Colors.swift / AppTheme.swift)
# ────────────────────────────────────────────────────────────────────────────
if [[ "$FILE" == *.swift ]] \
   && [[ "$FILE" != */Color.swift ]] \
   && [[ "$FILE" != */Colors.swift ]] \
   && [[ "$FILE" != */AppTheme.swift ]]; then
  if grep -qP 'Color\(hex:|Color\(red:\s*[0-9]' "$FILE" 2>/dev/null; then
    VIOLATIONS="${VIOLATIONS}- Raw Color initializer found — use Color extension constants instead.\n"
  fi
  if grep -qP '\.font\(\.system\(size:' "$FILE" 2>/dev/null; then
    VIOLATIONS="${VIOLATIONS}- Inline .font(.system(size:)) found — use Font extension constants instead.\n"
  fi
fi

# ────────────────────────────────────────────────────────────────────────────
# KOTLIN / COMPOSE  (skip Color.kt / Colors.kt / Theme.kt)
# ────────────────────────────────────────────────────────────────────────────
if [[ "$FILE" == *.kt ]] \
   && [[ "$FILE" != */Color.kt ]] \
   && [[ "$FILE" != */Colors.kt ]] \
   && [[ "$FILE" != */Theme.kt ]]; then
  if grep -qP 'Color\(0x[Ff][Ff][0-9A-Fa-f]{6}\)' "$FILE" 2>/dev/null; then
    VIOLATIONS="${VIOLATIONS}- Raw Color(0xFF…) literal in Kotlin — use color constants from Color.kt.\n"
  fi
  if grep -qP '\bTextStyle\s*\(' "$FILE" 2>/dev/null; then
    VIOLATIONS="${VIOLATIONS}- Raw TextStyle(…) in composable — use MaterialTheme.typography.* or Type.kt constants.\n"
  fi
fi

# ────────────────────────────────────────────────────────────────────────────
# REPORT
# ────────────────────────────────────────────────────────────────────────────
if [[ -n "$VIOLATIONS" ]]; then
  printf '{"decision":"block","reason":"Design token violation in %s:\n%s"}' \
    "$FILE" "$VIOLATIONS"
  exit 2
fi

exit 0
```

---

## PowerShell Script: `design-token-check.ps1`

**Location:** `.github/hooks/scripts/design-token-check.ps1`

```powershell
$inputJson = $input | Out-String
try {
    $data = $inputJson | ConvertFrom-Json
    $file = if ($data.filePath) { $data.filePath } `
            elseif ($data.path) { $data.path } `
            else { "" }
} catch { exit 0 }

if (-not $file) { exit 0 }

$violations = [System.Collections.Generic.List[string]]::new()

# Dart / Flutter
if ($file -match '\.dart$' -and $file -notmatch 'app_theme\.dart$') {
    if (Select-String -Path $file -Pattern 'Color\(0xFF[0-9A-Fa-f]{6}\)' -Quiet) {
        $violations.Add("Raw Color(0xFF…) literal — use AppColors.* constants instead.")
    }
    if (Select-String -Path $file -Pattern '\bTextStyle\s*\(' -Quiet) {
        $violations.Add("Raw TextStyle(…) construction — use AppTextStyles.* with .copyWith(color:).")
    }
}

# CSS / Web
if ($file -match '\.(css|scss|ts|tsx|js|jsx|vue|svelte)$' `
    -and $file -notmatch 'tokens\.css$|variables\.css$|theme\.css$') {
    $lines = Get-Content $file | Where-Object { $_ -notmatch '^\s*(--|/\*|\*|:root|//)' }
    if ($lines | Select-String -Pattern '#[0-9A-Fa-f]{3,6}\b' -Quiet) {
        $violations.Add("Raw hex color found — use CSS custom property vars instead.")
    }
}

# Swift / SwiftUI
if ($file -match '\.swift$' -and $file -notmatch 'Colors?\.swift$|AppTheme\.swift$') {
    if (Select-String -Path $file -Pattern 'Color\(hex:|Color\(red:\s*[0-9]' -Quiet) {
        $violations.Add("Raw Color initializer found — use Color extension constants instead.")
    }
    if (Select-String -Path $file -Pattern '\.font\(\.system\(size:' -Quiet) {
        $violations.Add("Inline .font(.system(size:)) found — use Font extension constants instead.")
    }
}

# Kotlin / Compose
if ($file -match '\.kt$' -and $file -notmatch 'Colors?\.kt$|Theme\.kt$') {
    if (Select-String -Path $file -Pattern 'Color\(0x[Ff][Ff][0-9A-Fa-f]{6}\)' -Quiet) {
        $violations.Add("Raw Color(0xFF…) literal in Kotlin — use color constants from Color.kt.")
    }
    if (Select-String -Path $file -Pattern '\bTextStyle\s*\(' -Quiet) {
        $violations.Add("Raw TextStyle(…) in composable — use MaterialTheme.typography.* or Type.kt constants.")
    }
}

if ($violations.Count -gt 0) {
    $reason = "Design token violation in ${file}:`n" + ($violations -join "`n")
    Write-Output "{`"decision`":`"block`",`"reason`":`"$($reason -replace '"','\"')`"}"
    exit 2
}
exit 0
```

---

## What the Hook Catches vs. Misses

### Caught (exit 2 — write blocked)

| Pattern | Stack |
|---------|-------|
| `Color(0xFF...)` literals | Dart, Kotlin |
| `TextStyle(...)` raw construction | Dart, Kotlin |
| Raw hex (`#RRGGBB`) outside CSS var declarations | CSS / web |
| `Color(hex:)` or `Color(red:green:blue:)` calls | Swift |
| `.font(.system(size:))` inline calls | SwiftUI |

### Not caught (handled by skill instructions + code review)

| Pattern | Why |
|---------|-----|
| Wrong token name (right pattern, wrong value) | Requires semantic analysis |
| Inline widget/component style overrides | Requires AST analysis |
| Off-scale spacing values | Requires context |
| Non-token font weights in `.copyWith()` | Not regex-detectable |

The hook is a **fast first line of defense**. The skill instructions handle the rest.

---

## Adding a New Stack's Checks

To add a stack not listed above, add a block to both scripts following this pattern:

```bash
# STACK NAME  (skip: token-definition file pattern)
if [[ "$FILE" == *.[ext] ]] && [[ "$FILE" != */[token-def-file] ]]; then
  if grep -qP '[forbidden pattern]' "$FILE" 2>/dev/null; then
    VIOLATIONS="${VIOLATIONS}- [Human-readable violation message]\n"
  fi
fi
```

Choose a pattern that:
- Matches **only** the forbidden usage (not the token-definition file)
- Produces a clear human-readable message referencing the correct fix
- Exits `0` quickly for unrelated file types

---

## Dark-First Design Variant

For dark-dominant designs, the web check direction reverses — light hex is the violation:

```bash
# Additional check: flag any pure white or near-white hex outside token definitions
if [[ "$FILE" =~ \.(css|scss|ts|tsx|js|jsx|vue|svelte)$ ]]; then
  if grep -vP '^\s*(--|/\*|\*|:root|\/\/)' "$FILE" 2>/dev/null \
       | grep -qP '#[Ff]{6}|#[Ff]{3}\b'; then
    VIOLATIONS="${VIOLATIONS}- Pure white hex found — use dark-palette token vars only.\n"
  fi
fi
```

Customize the hex pattern to the specific forbidden values from `tokens.md`.
