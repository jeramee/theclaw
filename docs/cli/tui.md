---
summary: "CLI reference for `theclaw tui` (Gateway-backed or local embedded terminal UI)"
read_when:
  - You want a terminal UI for the Gateway (remote-friendly)
  - You want to pass url/token/session from scripts
  - You want to run the TUI in local embedded mode without a Gateway
  - You want to use theclaw chat or theclaw tui --local
title: "TUI"
---

# `theclaw tui`

Open the terminal UI connected to the Gateway, or run it in local embedded
mode.

Related:

- TUI guide: [TUI](/web/tui)

Notes:

- `chat` and `terminal` are aliases for `theclaw tui --local`.
- `--local` cannot be combined with `--url`, `--token`, or `--password`.
- `tui` resolves configured gateway auth SecretRefs for token/password auth when possible (`env`/`file`/`exec` providers).
- When launched from inside a configured agent workspace directory, TUI auto-selects that agent for the session key default (unless `--session` is explicitly `agent:<id>:...`).
- Local mode uses the embedded agent runtime directly. Most local tools work, but Gateway-only features are unavailable.
- Local mode adds `/auth [provider]` inside the TUI command surface.
- Plugin approval gates still apply in local mode. Tools that require approval prompt for a decision in the terminal; nothing is silently auto-approved because the Gateway is not involved.

## Examples

```bash
theclaw chat
theclaw tui --local
theclaw tui
theclaw tui --url ws://127.0.0.1:18789 --token <token>
theclaw tui --session main --deliver
theclaw chat --message "Compare my config to the docs and tell me what to fix"
# when run inside an agent workspace, infers that agent automatically
theclaw tui --session bugfix
```

## Config repair loop

Use local mode when the current config already validates and you want the
embedded agent to inspect it, compare it against the docs, and help repair it
from the same terminal:

If `theclaw config validate` is already failing, use `theclaw configure` or
`theclaw doctor --fix` first. `theclaw chat` does not bypass the invalid-
config guard.

```bash
theclaw chat
```

Then inside the TUI:

```text
!theclaw config file
!theclaw docs gateway auth token secretref
!theclaw config validate
!theclaw doctor
```

Apply targeted fixes with `theclaw config set` or `theclaw configure`, then
rerun `theclaw config validate`. See [TUI](/web/tui) and [Config](/cli/config).

## Related

- [CLI reference](/cli)
- [TUI](/web/tui)
