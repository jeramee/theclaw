---
summary: "CLI reference for `theclaw setup` (initialize config + workspace)"
read_when:
  - You’re doing first-run setup without full CLI onboarding
  - You want to set the default workspace path
title: "Setup"
---

# `theclaw setup`

Initialize `~/.theclaw/theclaw.json` and the agent workspace.

Related:

- Getting started: [Getting started](/start/getting-started)
- CLI onboarding: [Onboarding (CLI)](/start/wizard)

## Examples

```bash
theclaw setup
theclaw setup --workspace ~/.theclaw/workspace
theclaw setup --wizard
theclaw setup --wizard --import-from hermes --import-source ~/.hermes
theclaw setup --non-interactive --mode remote --remote-url wss://gateway-host:18789 --remote-token <token>
```

## Options

- `--workspace <dir>`: agent workspace directory (stored as `agents.defaults.workspace`)
- `--wizard`: run onboarding
- `--non-interactive`: run onboarding without prompts
- `--mode <local|remote>`: onboarding mode
- `--import-from <provider>`: migration provider to run during onboarding
- `--import-source <path>`: source agent home for `--import-from`
- `--import-secrets`: import supported secrets during onboarding migration
- `--remote-url <url>`: remote Gateway WebSocket URL
- `--remote-token <token>`: remote Gateway token

To run onboarding via setup:

```bash
theclaw setup --wizard
```

Notes:

- Plain `theclaw setup` initializes config + workspace without the full onboarding flow.
- Onboarding auto-runs when any onboarding flags are present (`--wizard`, `--non-interactive`, `--mode`, `--import-from`, `--import-source`, `--import-secrets`, `--remote-url`, `--remote-token`).
- If Hermes state is detected, interactive onboarding can offer migration automatically. Import onboarding requires a fresh setup; use [Migrate](/cli/migrate) for dry-run plans, backups, and overwrite mode outside onboarding.

## Related

- [CLI reference](/cli)
- [Install overview](/install)
