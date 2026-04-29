---
summary: "Uninstall TheClaw completely (CLI, service, state, workspace)"
read_when:
  - You want to remove TheClaw from a machine
  - The gateway service is still running after uninstall
title: "Uninstall"
---

Two paths:

- **Easy path** if `theclaw` is still installed.
- **Manual service removal** if the CLI is gone but the service is still running.

## Easy path (CLI still installed)

Recommended: use the built-in uninstaller:

```bash
theclaw uninstall
```

Non-interactive (automation / npx):

```bash
theclaw uninstall --all --yes --non-interactive
npx -y theclaw uninstall --all --yes --non-interactive
```

Manual steps (same result):

1. Stop the gateway service:

```bash
theclaw gateway stop
```

2. Uninstall the gateway service (launchd/systemd/schtasks):

```bash
theclaw gateway uninstall
```

3. Delete state + config:

```bash
rm -rf "${THECLAW_STATE_DIR:-$HOME/.theclaw}"
```

If you set `THECLAW_CONFIG_PATH` to a custom location outside the state dir, delete that file too.

4. Delete your workspace (optional, removes agent files):

```bash
rm -rf ~/.theclaw/workspace
```

5. Remove the CLI install (pick the one you used):

```bash
npm rm -g theclaw
pnpm remove -g theclaw
bun remove -g theclaw
```

6. If you installed the macOS app:

```bash
rm -rf /Applications/TheClaw.app
```

Notes:

- If you used profiles (`--profile` / `THECLAW_PROFILE`), repeat step 3 for each state dir (defaults are `~/.theclaw-<profile>`).
- In remote mode, the state dir lives on the **gateway host**, so run steps 1-4 there too.

## Manual service removal (CLI not installed)

Use this if the gateway service keeps running but `theclaw` is missing.

### macOS (launchd)

Default label is `ai.theclaw.gateway` (or `ai.theclaw.<profile>`; legacy `com.theclaw.*` may still exist):

```bash
launchctl bootout gui/$UID/ai.theclaw.gateway
rm -f ~/Library/LaunchAgents/ai.theclaw.gateway.plist
```

If you used a profile, replace the label and plist name with `ai.theclaw.<profile>`. Remove any legacy `com.theclaw.*` plists if present.

### Linux (systemd user unit)

Default unit name is `theclaw-gateway.service` (or `theclaw-gateway-<profile>.service`):

```bash
systemctl --user disable --now theclaw-gateway.service
rm -f ~/.config/systemd/user/theclaw-gateway.service
systemctl --user daemon-reload
```

### Windows (Scheduled Task)

Default task name is `TheClaw Gateway` (or `TheClaw Gateway (<profile>)`).
The task script lives under your state dir.

```powershell
schtasks /Delete /F /TN "TheClaw Gateway"
Remove-Item -Force "$env:USERPROFILE\.theclaw\gateway.cmd"
```

If you used a profile, delete the matching task name and `~\.theclaw-<profile>\gateway.cmd`.

## Normal install vs source checkout

### Normal install (install.sh / npm / pnpm / bun)

If you used `https://theclaw.ai/install.sh` or `install.ps1`, the CLI was installed with `npm install -g theclaw@latest`.
Remove it with `npm rm -g theclaw` (or `pnpm remove -g` / `bun remove -g` if you installed that way).

### Source checkout (git clone)

If you run from a repo checkout (`git clone` + `theclaw ...` / `bun run theclaw ...`):

1. Uninstall the gateway service **before** deleting the repo (use the easy path above or manual service removal).
2. Delete the repo directory.
3. Remove state + workspace as shown above.

## Related

- [Install overview](/install)
- [Migration guide](/install/migrating)
