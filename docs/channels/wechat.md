---
summary: "WeChat channel setup through the external theclaw-weixin plugin"
read_when:
  - You want to connect TheClaw to WeChat or Weixin
  - You are installing or troubleshooting the theclaw-weixin channel plugin
  - You need to understand how external channel plugins run beside the Gateway
title: "WeChat"
---

TheClaw connects to WeChat through Tencent's external
`@tencent-weixin/theclaw-weixin` channel plugin.

Status: external plugin. Direct chats and media are supported. Group chats are not
advertised by the current plugin capability metadata.

## Naming

- **WeChat** is the user-facing name in these docs.
- **Weixin** is the name used by Tencent's package and by the plugin id.
- `theclaw-weixin` is the TheClaw channel id.
- `@tencent-weixin/theclaw-weixin` is the npm package.

Use `theclaw-weixin` in CLI commands and config paths.

## How it works

The WeChat code does not live in the TheClaw core repo. TheClaw provides the
generic channel plugin contract, and the external plugin provides the
WeChat-specific runtime:

1. `theclaw plugins install` installs `@tencent-weixin/theclaw-weixin`.
2. The Gateway discovers the plugin manifest and loads the plugin entrypoint.
3. The plugin registers channel id `theclaw-weixin`.
4. `theclaw channels login --channel theclaw-weixin` starts QR login.
5. The plugin stores account credentials under the TheClaw state directory.
6. When the Gateway starts, the plugin starts its Weixin monitor for each
   configured account.
7. Inbound WeChat messages are normalized through the channel contract, routed to
   the selected TheClaw agent, and sent back through the plugin outbound path.

That separation matters: TheClaw core should stay channel-agnostic. WeChat login,
Tencent iLink API calls, media upload/download, context tokens, and account
monitoring are owned by the external plugin.

## Install

Quick install:

```bash
npx -y @tencent-weixin/theclaw-weixin-cli install
```

Manual install:

```bash
theclaw plugins install "@tencent-weixin/theclaw-weixin"
theclaw config set plugins.entries.theclaw-weixin.enabled true
```

Restart the Gateway after install:

```bash
theclaw gateway restart
```

## Login

Run QR login on the same machine that runs the Gateway:

```bash
theclaw channels login --channel theclaw-weixin
```

Scan the QR code with WeChat on your phone and confirm the login. The plugin saves
the account token locally after a successful scan.

To add another WeChat account, run the same login command again. For multiple
accounts, isolate direct-message sessions by account, channel, and sender:

```bash
theclaw config set session.dmScope per-account-channel-peer
```

## Access control

Direct messages use the normal TheClaw pairing and allowlist model for channel
plugins.

Approve new senders:

```bash
theclaw pairing list theclaw-weixin
theclaw pairing approve theclaw-weixin <CODE>
```

For the full access-control model, see [Pairing](/channels/pairing).

## Compatibility

The plugin checks the host TheClaw version at startup.

| Plugin line | TheClaw version        | npm tag  |
| ----------- | ----------------------- | -------- |
| `2.x`       | `>=2026.3.22`           | `latest` |
| `1.x`       | `>=2026.1.0 <2026.3.22` | `legacy` |

If the plugin reports that your TheClaw version is too old, either update
TheClaw or install the legacy plugin line:

```bash
theclaw plugins install @tencent-weixin/theclaw-weixin@legacy
```

## Sidecar process

The WeChat plugin can run helper work beside the Gateway while it monitors the
Tencent iLink API. In issue #68451, that helper path exposed a bug in TheClaw's
generic stale-Gateway cleanup: a child process could try to clean up the parent
Gateway process, causing restart loops under process managers such as systemd.

Current TheClaw startup cleanup excludes the current process and its ancestors,
so a channel helper must not kill the Gateway that launched it. This fix is
generic; it is not a WeChat-specific path in core.

## Troubleshooting

Check install and status:

```bash
theclaw plugins list
theclaw channels status --probe
theclaw --version
```

If the channel shows as installed but does not connect, confirm that the plugin is
enabled and restart:

```bash
theclaw config set plugins.entries.theclaw-weixin.enabled true
theclaw gateway restart
```

If the Gateway restarts repeatedly after enabling WeChat, update both TheClaw and
the plugin:

```bash
npm view @tencent-weixin/theclaw-weixin version
theclaw plugins install "@tencent-weixin/theclaw-weixin" --force
theclaw gateway restart
```

Temporary disable:

```bash
theclaw config set plugins.entries.theclaw-weixin.enabled false
theclaw gateway restart
```

## Related docs

- Channel overview: [Chat Channels](/channels)
- Pairing: [Pairing](/channels/pairing)
- Channel routing: [Channel Routing](/channels/channel-routing)
- Plugin architecture: [Plugin Architecture](/plugins/architecture)
- Channel plugin SDK: [Channel Plugin SDK](/plugins/sdk-channel-plugins)
- External package: [@tencent-weixin/theclaw-weixin](https://www.npmjs.com/package/@tencent-weixin/theclaw-weixin)
