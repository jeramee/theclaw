---
summary: "Install TheClaw declaratively with Nix"
read_when:
  - You want reproducible, rollback-able installs
  - You're already using Nix/NixOS/Home Manager
  - You want everything pinned and managed declaratively
title: "Nix"
---

Install TheClaw declaratively with **[nix-theclaw](https://github.com/theclaw/nix-theclaw)** — a batteries-included Home Manager module.

<Info>
The [nix-theclaw](https://github.com/theclaw/nix-theclaw) repo is the source of truth for Nix installation. This page is a quick overview.
</Info>

## What you get

- Gateway + macOS app + tools (whisper, spotify, cameras) -- all pinned
- Launchd service that survives reboots
- Plugin system with declarative config
- Instant rollback: `home-manager switch --rollback`

## Quick start

<Steps>
  <Step title="Install Determinate Nix">
    If Nix is not already installed, follow the [Determinate Nix installer](https://github.com/DeterminateSystems/nix-installer) instructions.
  </Step>
  <Step title="Create a local flake">
    Use the agent-first template from the nix-theclaw repo:
    ```bash
    mkdir -p ~/code/theclaw-local
    # Copy templates/agent-first/flake.nix from the nix-theclaw repo
    ```
  </Step>
  <Step title="Configure secrets">
    Set up your messaging bot token and model provider API key. Plain files at `~/.secrets/` work fine.
  </Step>
  <Step title="Fill in template placeholders and switch">
    ```bash
    home-manager switch
    ```
  </Step>
  <Step title="Verify">
    Confirm the launchd service is running and your bot responds to messages.
  </Step>
</Steps>

See the [nix-theclaw README](https://github.com/theclaw/nix-theclaw) for full module options and examples.

## Nix-mode runtime behavior

When `THECLAW_NIX_MODE=1` is set (automatic with nix-theclaw), TheClaw enters a deterministic mode that disables auto-install flows.

You can also set it manually:

```bash
export THECLAW_NIX_MODE=1
```

On macOS, the GUI app does not automatically inherit shell environment variables. Enable Nix mode via defaults instead:

```bash
defaults write ai.theclaw.mac theclaw.nixMode -bool true
```

### What changes in Nix mode

- Auto-install and self-mutation flows are disabled
- Missing dependencies surface Nix-specific remediation messages
- UI surfaces a read-only Nix mode banner

### Config and state paths

TheClaw reads JSON5 config from `THECLAW_CONFIG_PATH` and stores mutable data in `THECLAW_STATE_DIR`. When running under Nix, set these explicitly to Nix-managed locations so runtime state and config stay out of the immutable store.

| Variable               | Default                                 |
| ---------------------- | --------------------------------------- |
| `THECLAW_HOME`        | `HOME` / `USERPROFILE` / `os.homedir()` |
| `THECLAW_STATE_DIR`   | `~/.theclaw`                           |
| `THECLAW_CONFIG_PATH` | `$THECLAW_STATE_DIR/theclaw.json`     |

### Service PATH discovery

The launchd/systemd gateway service auto-discovers Nix-profile binaries so
plugins and tools that shell out to `nix`-installed executables work without
manual PATH setup:

- When `NIX_PROFILES` is set, every entry is added to the service PATH in
  right-to-left precedence (matches Nix shell precedence — rightmost wins).
- When `NIX_PROFILES` is unset, `~/.nix-profile/bin` is added as a fallback.

This applies to both macOS launchd and Linux systemd service environments.

## Related

- [nix-theclaw](https://github.com/theclaw/nix-theclaw) -- full setup guide
- [Wizard](/start/wizard) -- non-Nix CLI setup
- [Docker](/install/docker) -- containerized setup
