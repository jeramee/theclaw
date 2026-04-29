---
summary: "CLI reference for `theclaw voicecall` (voice-call plugin command surface)"
read_when:
  - You use the voice-call plugin and want the CLI entry points
  - You want quick examples for `voicecall setup|smoke|call|continue|dtmf|status|tail|expose`
title: "Voicecall"
---

# `theclaw voicecall`

`voicecall` is a plugin-provided command. It only appears if the voice-call plugin is installed and enabled.

Primary doc:

- Voice-call plugin: [Voice Call](/plugins/voice-call)

## Common commands

```bash
theclaw voicecall setup
theclaw voicecall smoke
theclaw voicecall status --call-id <id>
theclaw voicecall call --to "+15555550123" --message "Hello" --mode notify
theclaw voicecall continue --call-id <id> --message "Any questions?"
theclaw voicecall dtmf --call-id <id> --digits "ww123456#"
theclaw voicecall end --call-id <id>
```

`setup` prints human-readable readiness checks by default. Use `--json` for
scripts:

```bash
theclaw voicecall setup --json
```

For external providers (`twilio`, `telnyx`, `plivo`), setup must resolve a public
webhook URL from `publicUrl`, a tunnel, or Tailscale exposure. A loopback/private
serve fallback is rejected because carriers cannot reach it.

`smoke` runs the same readiness checks. It will not place a real phone call
unless both `--to` and `--yes` are present:

```bash
theclaw voicecall smoke --to "+15555550123"        # dry run
theclaw voicecall smoke --to "+15555550123" --yes  # live notify call
```

## Exposing webhooks (Tailscale)

```bash
theclaw voicecall expose --mode serve
theclaw voicecall expose --mode funnel
theclaw voicecall expose --mode off
```

Security note: only expose the webhook endpoint to networks you trust. Prefer Tailscale Serve over Funnel when possible.

## Related

- [CLI reference](/cli)
- [Voice call plugin](/plugins/voice-call)
