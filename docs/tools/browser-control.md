---
summary: "TheClaw browser control API, CLI reference, and scripting actions"
read_when:
  - Scripting or debugging the agent browser via the local control API
  - Looking for the `theclaw browser` CLI reference
  - Adding custom browser automation with snapshots and refs
title: "Browser control API"
---

For setup, configuration, and troubleshooting, see [Browser](/tools/browser).
This page is the reference for the local control HTTP API, the `theclaw browser`
CLI, and scripting patterns (snapshots, refs, waits, debug flows).

## Control API (optional)

For local integrations only, the Gateway exposes a small loopback HTTP API:

- Status/start/stop: `GET /`, `POST /start`, `POST /stop`
- Tabs: `GET /tabs`, `POST /tabs/open`, `POST /tabs/focus`, `DELETE /tabs/:targetId`
- Snapshot/screenshot: `GET /snapshot`, `POST /screenshot`
- Actions: `POST /navigate`, `POST /act`
- Hooks: `POST /hooks/file-chooser`, `POST /hooks/dialog`
- Downloads: `POST /download`, `POST /wait/download`
- Permissions: `POST /permissions/grant`
- Debugging: `GET /console`, `POST /pdf`
- Debugging: `GET /errors`, `GET /requests`, `POST /trace/start`, `POST /trace/stop`, `POST /highlight`
- Network: `POST /response/body`
- State: `GET /cookies`, `POST /cookies/set`, `POST /cookies/clear`
- State: `GET /storage/:kind`, `POST /storage/:kind/set`, `POST /storage/:kind/clear`
- Settings: `POST /set/offline`, `POST /set/headers`, `POST /set/credentials`, `POST /set/geolocation`, `POST /set/media`, `POST /set/timezone`, `POST /set/locale`, `POST /set/device`

All endpoints accept `?profile=<name>`. `POST /start?headless=true` requests a
one-shot headless launch for local managed profiles without changing persisted
browser config; attach-only, remote CDP, and existing-session profiles reject
that override because TheClaw does not launch those browser processes.

If shared-secret gateway auth is configured, browser HTTP routes require auth too:

- `Authorization: Bearer <gateway token>`
- `x-theclaw-password: <gateway password>` or HTTP Basic auth with that password

Notes:

- This standalone loopback browser API does **not** consume trusted-proxy or
  Tailscale Serve identity headers.
- If `gateway.auth.mode` is `none` or `trusted-proxy`, these loopback browser
  routes do not inherit those identity-bearing modes; keep them loopback-only.

### `/act` error contract

`POST /act` uses a structured error response for route-level validation and
policy failures:

```json
{ "error": "<message>", "code": "ACT_*" }
```

Current `code` values:

- `ACT_KIND_REQUIRED` (HTTP 400): `kind` is missing or unrecognized.
- `ACT_INVALID_REQUEST` (HTTP 400): action payload failed normalization or validation.
- `ACT_SELECTOR_UNSUPPORTED` (HTTP 400): `selector` was used with an unsupported action kind.
- `ACT_EVALUATE_DISABLED` (HTTP 403): `evaluate` (or `wait --fn`) is disabled by config.
- `ACT_TARGET_ID_MISMATCH` (HTTP 403): top-level or batched `targetId` conflicts with request target.
- `ACT_EXISTING_SESSION_UNSUPPORTED` (HTTP 501): action is not supported for existing-session profiles.

Other runtime failures may still return `{ "error": "<message>" }` without a
`code` field.

### Playwright requirement

Some features (navigate/act/AI snapshot/role snapshot, element screenshots,
PDF) require Playwright. If Playwright isn’t installed, those endpoints return
a clear 501 error.

What still works without Playwright:

- ARIA snapshots
- Role-style accessibility snapshots (`--interactive`, `--compact`,
  `--depth`, `--efficient`) when a per-tab CDP WebSocket is available. This is
  a fallback for inspection and ref discovery; Playwright remains the primary
  action engine.
- Page screenshots for the managed `theclaw` browser when a per-tab CDP
  WebSocket is available
- Page screenshots for `existing-session` / Chrome MCP profiles
- `existing-session` ref-based screenshots (`--ref`) from snapshot output

What still needs Playwright:

- `navigate`
- `act`
- AI snapshots that depend on Playwright's native AI snapshot format
- CSS-selector element screenshots (`--element`)
- full browser PDF export

Element screenshots also reject `--full-page`; the route returns `fullPage is
not supported for element screenshots`.

If you see `Playwright is not available in this gateway build`, repair the
bundled browser plugin runtime dependencies so `playwright-core` is installed,
then restart the gateway. For packaged installs, run `theclaw doctor --fix`.
For Docker, also install the Chromium browser binaries as shown below.

#### Docker Playwright install

If your Gateway runs in Docker, avoid `npx playwright` (npm override conflicts).
Use the bundled CLI instead:

```bash
docker compose run --rm theclaw-cli \
  node /app/node_modules/playwright-core/cli.js install chromium
```

To persist browser downloads, set `PLAYWRIGHT_BROWSERS_PATH` (for example,
`/home/node/.cache/ms-playwright`) and make sure `/home/node` is persisted via
`THECLAW_HOME_VOLUME` or a bind mount. See [Docker](/install/docker).

## How it works (internal)

A small loopback control server accepts HTTP requests and connects to Chromium-based browsers via CDP. Advanced actions (click/type/snapshot/PDF) go through Playwright on top of CDP; when Playwright is missing, only non-Playwright operations are available. The agent sees one stable interface while local/remote browsers and profiles swap freely underneath.

## CLI quick reference

All commands accept `--browser-profile <name>` to target a specific profile, and `--json` for machine-readable output.

<AccordionGroup>

<Accordion title="Basics: status, tabs, open/focus/close">

```bash
theclaw browser status
theclaw browser start
theclaw browser start --headless # one-shot local managed headless launch
theclaw browser stop            # also clears emulation on attach-only/remote CDP
theclaw browser tabs
theclaw browser tab             # shortcut for current tab
theclaw browser tab new
theclaw browser tab select 2
theclaw browser tab close 2
theclaw browser open https://example.com
theclaw browser focus abcd1234
theclaw browser close abcd1234
```

</Accordion>

<Accordion title="Inspection: screenshot, snapshot, console, errors, requests">

```bash
theclaw browser screenshot
theclaw browser screenshot --full-page
theclaw browser screenshot --ref 12        # or --ref e12
theclaw browser screenshot --labels
theclaw browser snapshot
theclaw browser snapshot --format aria --limit 200
theclaw browser snapshot --interactive --compact --depth 6
theclaw browser snapshot --efficient
theclaw browser snapshot --labels
theclaw browser snapshot --urls
theclaw browser snapshot --selector "#main" --interactive
theclaw browser snapshot --frame "iframe#main" --interactive
theclaw browser console --level error
theclaw browser errors --clear
theclaw browser requests --filter api --clear
theclaw browser pdf
theclaw browser responsebody "**/api" --max-chars 5000
```

</Accordion>

<Accordion title="Actions: navigate, click, type, drag, wait, evaluate">

```bash
theclaw browser navigate https://example.com
theclaw browser resize 1280 720
theclaw browser click 12 --double           # or e12 for role refs
theclaw browser click-coords 120 340        # viewport coordinates
theclaw browser type 23 "hello" --submit
theclaw browser press Enter
theclaw browser hover 44
theclaw browser scrollintoview e12
theclaw browser drag 10 11
theclaw browser select 9 OptionA OptionB
theclaw browser download e12 report.pdf
theclaw browser waitfordownload report.pdf
theclaw browser upload /tmp/theclaw/uploads/file.pdf
theclaw browser fill --fields '[{"ref":"1","type":"text","value":"Ada"}]'
theclaw browser dialog --accept
theclaw browser wait --text "Done"
theclaw browser wait "#main" --url "**/dash" --load networkidle --fn "window.ready===true"
theclaw browser evaluate --fn '(el) => el.textContent' --ref 7
theclaw browser highlight e12
theclaw browser trace start
theclaw browser trace stop
```

</Accordion>

<Accordion title="State: cookies, storage, offline, headers, geo, device">

```bash
theclaw browser cookies
theclaw browser cookies set session abc123 --url "https://example.com"
theclaw browser cookies clear
theclaw browser storage local get
theclaw browser storage local set theme dark
theclaw browser storage session clear
theclaw browser set offline on
theclaw browser set headers --headers-json '{"X-Debug":"1"}'
theclaw browser set credentials user pass            # --clear to remove
theclaw browser set geo 37.7749 -122.4194 --origin "https://example.com"
theclaw browser set media dark
theclaw browser set timezone America/New_York
theclaw browser set locale en-US
theclaw browser set device "iPhone 14"
```

</Accordion>

</AccordionGroup>

Notes:

- `upload` and `dialog` are **arming** calls; run them before the click/press that triggers the chooser/dialog.
- `click`/`type`/etc require a `ref` from `snapshot` (numeric `12`, role ref `e12`, or actionable ARIA ref `ax12`). CSS selectors are intentionally not supported for actions. Use `click-coords` when the visible viewport position is the only reliable target.
- Download, trace, and upload paths are constrained to TheClaw temp roots: `/tmp/theclaw{,/downloads,/uploads}` (fallback: `${os.tmpdir()}/theclaw/...`).
- `upload` can also set file inputs directly via `--input-ref` or `--element`.

Stable tab ids and labels survive Chromium raw-target replacement when TheClaw
can prove the replacement tab, such as same URL or a single old tab becoming a
single new tab after form submission. Raw target ids are still volatile; prefer
`suggestedTargetId` from `tabs` in scripts.

Snapshot flags at a glance:

- `--format ai` (default with Playwright): AI snapshot with numeric refs (`aria-ref="<n>"`).
- `--format aria`: accessibility tree with `axN` refs. When Playwright is available, TheClaw binds refs with backend DOM ids to the live page so follow-up actions can use them; otherwise treat the output as inspection-only.
- `--efficient` (or `--mode efficient`): compact role snapshot preset. Set `browser.snapshotDefaults.mode: "efficient"` to make this the default (see [Gateway configuration](/gateway/configuration-reference#browser)).
- `--interactive`, `--compact`, `--depth`, `--selector` force a role snapshot with `ref=e12` refs. `--frame "<iframe>"` scopes role snapshots to an iframe.
- `--labels` adds a viewport-only screenshot with overlayed ref labels (prints `MEDIA:<path>`).
- `--urls` appends discovered link destinations to AI snapshots.

## Snapshots and refs

TheClaw supports two “snapshot” styles:

- **AI snapshot (numeric refs)**: `theclaw browser snapshot` (default; `--format ai`)
  - Output: a text snapshot that includes numeric refs.
  - Actions: `theclaw browser click 12`, `theclaw browser type 23 "hello"`.
  - Internally, the ref is resolved via Playwright’s `aria-ref`.

- **Role snapshot (role refs like `e12`)**: `theclaw browser snapshot --interactive` (or `--compact`, `--depth`, `--selector`, `--frame`)
  - Output: a role-based list/tree with `[ref=e12]` (and optional `[nth=1]`).
  - Actions: `theclaw browser click e12`, `theclaw browser highlight e12`.
  - Internally, the ref is resolved via `getByRole(...)` (plus `nth()` for duplicates).
  - Add `--labels` to include a viewport screenshot with overlayed `e12` labels.
  - Add `--urls` when link text is ambiguous and the agent needs concrete
    navigation targets.

- **ARIA snapshot (ARIA refs like `ax12`)**: `theclaw browser snapshot --format aria`
  - Output: the accessibility tree as structured nodes.
  - Actions: `theclaw browser click ax12` works when the snapshot path can bind
    the ref through Playwright and Chrome backend DOM ids.
- If Playwright is unavailable, ARIA snapshots can still be useful for
  inspection, but refs may not be actionable. Re-snapshot with `--format ai`
  or `--interactive` when you need action refs.
- Docker proof for the raw-CDP fallback path: `pnpm test:docker:browser-cdp-snapshot`
  starts Chromium with CDP, runs `browser doctor --deep`, and verifies role
  snapshots include link URLs, cursor-promoted clickables, and iframe metadata.

Ref behavior:

- Refs are **not stable across navigations**; if something fails, re-run `snapshot` and use a fresh ref.
- `/act` returns the current raw `targetId` after action-triggered replacement
  when it can prove the replacement tab. Keep using stable tab ids/labels for
  follow-up commands.
- If the role snapshot was taken with `--frame`, role refs are scoped to that iframe until the next role snapshot.
- Unknown or stale `axN` refs fail fast instead of falling through to
  Playwright's `aria-ref` selector. Run a fresh snapshot on the same tab when
  that happens.

## Wait power-ups

You can wait on more than just time/text:

- Wait for URL (globs supported by Playwright):
  - `theclaw browser wait --url "**/dash"`
- Wait for load state:
  - `theclaw browser wait --load networkidle`
- Wait for a JS predicate:
  - `theclaw browser wait --fn "window.ready===true"`
- Wait for a selector to become visible:
  - `theclaw browser wait "#main"`

These can be combined:

```bash
theclaw browser wait "#main" \
  --url "**/dash" \
  --load networkidle \
  --fn "window.ready===true" \
  --timeout-ms 15000
```

## Debug workflows

When an action fails (e.g. “not visible”, “strict mode violation”, “covered”):

1. `theclaw browser snapshot --interactive`
2. Use `click <ref>` / `type <ref>` (prefer role refs in interactive mode)
3. If it still fails: `theclaw browser highlight <ref>` to see what Playwright is targeting
4. If the page behaves oddly:
   - `theclaw browser errors --clear`
   - `theclaw browser requests --filter api --clear`
5. For deep debugging: record a trace:
   - `theclaw browser trace start`
   - reproduce the issue
   - `theclaw browser trace stop` (prints `TRACE:<path>`)

## JSON output

`--json` is for scripting and structured tooling.

Examples:

```bash
theclaw browser status --json
theclaw browser snapshot --interactive --json
theclaw browser requests --filter api --json
theclaw browser cookies --json
```

Role snapshots in JSON include `refs` plus a small `stats` block (lines/chars/refs/interactive) so tools can reason about payload size and density.

## State and environment knobs

These are useful for “make the site behave like X” workflows:

- Cookies: `cookies`, `cookies set`, `cookies clear`
- Storage: `storage local|session get|set|clear`
- Offline: `set offline on|off`
- Headers: `set headers --headers-json '{"X-Debug":"1"}'` (legacy `set headers --json '{"X-Debug":"1"}'` remains supported)
- HTTP basic auth: `set credentials user pass` (or `--clear`)
- Geolocation: `set geo <lat> <lon> --origin "https://example.com"` (or `--clear`)
- Media: `set media dark|light|no-preference|none`
- Timezone / locale: `set timezone ...`, `set locale ...`
- Device / viewport:
  - `set device "iPhone 14"` (Playwright device presets)
  - `set viewport 1280 720`

## Security and privacy

- The theclaw browser profile may contain logged-in sessions; treat it as sensitive.
- `browser act kind=evaluate` / `theclaw browser evaluate` and `wait --fn`
  execute arbitrary JavaScript in the page context. Prompt injection can steer
  this. Disable it with `browser.evaluateEnabled=false` if you do not need it.
- For logins and anti-bot notes (X/Twitter, etc.), see [Browser login + X/Twitter posting](/tools/browser-login).
- Keep the Gateway/node host private (loopback or tailnet-only).
- Remote CDP endpoints are powerful; tunnel and protect them.

Strict-mode example (block private/internal destinations by default):

```json5
{
  browser: {
    ssrfPolicy: {
      dangerouslyAllowPrivateNetwork: false,
      hostnameAllowlist: ["*.example.com", "example.com"],
      allowedHostnames: ["localhost"], // optional exact allow
    },
  },
}
```

## Related

- [Browser](/tools/browser) — overview, configuration, profiles, security
- [Browser login](/tools/browser-login) — signing in to sites
- [Browser Linux troubleshooting](/tools/browser-linux-troubleshooting)
- [Browser WSL2 troubleshooting](/tools/browser-wsl2-windows-remote-cdp-troubleshooting)
