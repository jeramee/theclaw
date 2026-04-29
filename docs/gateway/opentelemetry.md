---
summary: "Export TheClaw diagnostics to any OpenTelemetry collector via the diagnostics-otel plugin (OTLP/HTTP)"
title: "OpenTelemetry export"
read_when:
  - You want to send TheClaw model usage, message flow, or session metrics to an OpenTelemetry collector
  - You are wiring traces, metrics, or logs into Grafana, Datadog, Honeycomb, New Relic, Tempo, or another OTLP backend
  - You need the exact metric names, span names, or attribute shapes to build dashboards or alerts
---

TheClaw exports diagnostics through the bundled `diagnostics-otel` plugin
using **OTLP/HTTP (protobuf)**. Any collector or backend that accepts OTLP/HTTP
works without code changes. For local file logs and how to read them, see
[Logging](/logging).

## How it fits together

- **Diagnostics events** are structured, in-process records emitted by the
  Gateway and bundled plugins for model runs, message flow, sessions, queues,
  and exec.
- **`diagnostics-otel` plugin** subscribes to those events and exports them as
  OpenTelemetry **metrics**, **traces**, and **logs** over OTLP/HTTP.
- **Provider calls** receive a W3C `traceparent` header from TheClaw's
  trusted model-call span context when the provider transport accepts custom
  headers. Plugin-emitted trace context is not propagated.
- Exporters only attach when both the diagnostics surface and the plugin are
  enabled, so the in-process cost stays near zero by default.

## Quick start

```json5
{
  plugins: {
    allow: ["diagnostics-otel"],
    entries: {
      "diagnostics-otel": { enabled: true },
    },
  },
  diagnostics: {
    enabled: true,
    otel: {
      enabled: true,
      endpoint: "http://otel-collector:4318",
      protocol: "http/protobuf",
      serviceName: "theclaw-gateway",
      traces: true,
      metrics: true,
      logs: true,
      sampleRate: 0.2,
      flushIntervalMs: 60000,
    },
  },
}
```

You can also enable the plugin from the CLI:

```bash
theclaw plugins enable diagnostics-otel
```

<Note>
`protocol` currently supports `http/protobuf` only. `grpc` is ignored.
</Note>

## Signals exported

| Signal      | What goes in it                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Metrics** | Counters and histograms for token usage, cost, run duration, message flow, queue lanes, session state, exec, and memory pressure.          |
| **Traces**  | Spans for model usage, model calls, harness lifecycle, tool execution, exec, webhook/message processing, context assembly, and tool loops. |
| **Logs**    | Structured `logging.file` records exported over OTLP when `diagnostics.otel.logs` is enabled.                                              |

Toggle `traces`, `metrics`, and `logs` independently. All three default to on
when `diagnostics.otel.enabled` is true.

## Configuration reference

```json5
{
  diagnostics: {
    enabled: true,
    otel: {
      enabled: true,
      endpoint: "http://otel-collector:4318",
      tracesEndpoint: "http://otel-collector:4318/v1/traces",
      metricsEndpoint: "http://otel-collector:4318/v1/metrics",
      logsEndpoint: "http://otel-collector:4318/v1/logs",
      protocol: "http/protobuf", // grpc is ignored
      serviceName: "theclaw-gateway",
      headers: { "x-collector-token": "..." },
      traces: true,
      metrics: true,
      logs: true,
      sampleRate: 0.2, // root-span sampler, 0.0..1.0
      flushIntervalMs: 60000, // metric export interval (min 1000ms)
      captureContent: {
        enabled: false,
        inputMessages: false,
        outputMessages: false,
        toolInputs: false,
        toolOutputs: false,
        systemPrompt: false,
      },
    },
  },
}
```

### Environment variables

| Variable                                                                                                          | Purpose                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `OTEL_EXPORTER_OTLP_ENDPOINT`                                                                                     | Override `diagnostics.otel.endpoint`. If the value already contains `/v1/traces`, `/v1/metrics`, or `/v1/logs`, it is used as-is.                                                                                                          |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` / `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT` / `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT` | Signal-specific endpoint overrides used when the matching `diagnostics.otel.*Endpoint` config key is unset. Signal-specific config wins over signal-specific env, which wins over the shared endpoint.                                     |
| `OTEL_SERVICE_NAME`                                                                                               | Override `diagnostics.otel.serviceName`.                                                                                                                                                                                                   |
| `OTEL_EXPORTER_OTLP_PROTOCOL`                                                                                     | Override the wire protocol (only `http/protobuf` is honored today).                                                                                                                                                                        |
| `OTEL_SEMCONV_STABILITY_OPT_IN`                                                                                   | Set to `gen_ai_latest_experimental` to emit the latest experimental GenAI span attribute (`gen_ai.provider.name`) instead of the legacy `gen_ai.system`. GenAI metrics always use bounded, low-cardinality semantic attributes regardless. |
| `THECLAW_OTEL_PRELOADED`                                                                                         | Set to `1` when another preload or host process already registered the global OpenTelemetry SDK. The plugin then skips its own NodeSDK lifecycle but still wires diagnostic listeners and honors `traces`/`metrics`/`logs`.                |

## Privacy and content capture

Raw model/tool content is **not** exported by default. Spans carry bounded
identifiers (channel, provider, model, error category, hash-only request ids)
and never include prompt text, response text, tool inputs, tool outputs, or
session keys.

Outbound model requests may include a W3C `traceparent` header. That header is
generated only from TheClaw-owned diagnostic trace context for the active model
call. Existing caller-supplied `traceparent` headers are replaced, so plugins or
custom provider options cannot spoof cross-service trace ancestry.

Set `diagnostics.otel.captureContent.*` to `true` only when your collector and
retention policy are approved for prompt, response, tool, or system-prompt
text. Each subkey is opt-in independently:

- `inputMessages` — user prompt content.
- `outputMessages` — model response content.
- `toolInputs` — tool argument payloads.
- `toolOutputs` — tool result payloads.
- `systemPrompt` — assembled system/developer prompt.

When any subkey is enabled, model and tool spans get bounded, redacted
`theclaw.content.*` attributes for that class only.

## Sampling and flushing

- **Traces:** `diagnostics.otel.sampleRate` (root-span only, `0.0` drops all,
  `1.0` keeps all).
- **Metrics:** `diagnostics.otel.flushIntervalMs` (minimum `1000`).
- **Logs:** OTLP logs respect `logging.level` (file log level). They use the
  diagnostic log-record redaction path, not console formatting. High-volume
  installs should prefer OTLP collector sampling/filtering over local sampling.
- **File-log correlation:** JSONL file logs include top-level `traceId`,
  `spanId`, `parentSpanId`, and `traceFlags` when the log call carries a valid
  diagnostic trace context, which lets log processors join local log lines with
  exported spans.
- **Request correlation:** Gateway HTTP requests and WebSocket frames create an
  internal request trace scope. Logs and diagnostic events inside that scope
  inherit the request trace by default, while agent run and model-call spans are
  created as children so provider `traceparent` headers stay on the same trace.

## Exported metrics

### Model usage

- `theclaw.tokens` (counter, attrs: `theclaw.token`, `theclaw.channel`, `theclaw.provider`, `theclaw.model`, `theclaw.agent`)
- `theclaw.cost.usd` (counter, attrs: `theclaw.channel`, `theclaw.provider`, `theclaw.model`)
- `theclaw.run.duration_ms` (histogram, attrs: `theclaw.channel`, `theclaw.provider`, `theclaw.model`)
- `theclaw.context.tokens` (histogram, attrs: `theclaw.context`, `theclaw.channel`, `theclaw.provider`, `theclaw.model`)
- `gen_ai.client.token.usage` (histogram, GenAI semantic-conventions metric, attrs: `gen_ai.token.type` = `input`/`output`, `gen_ai.provider.name`, `gen_ai.operation.name`, `gen_ai.request.model`)
- `gen_ai.client.operation.duration` (histogram, seconds, GenAI semantic-conventions metric, attrs: `gen_ai.provider.name`, `gen_ai.operation.name`, `gen_ai.request.model`, optional `error.type`)
- `theclaw.model_call.duration_ms` (histogram, attrs: `theclaw.provider`, `theclaw.model`, `theclaw.api`, `theclaw.transport`, plus `theclaw.errorCategory` and `theclaw.failureKind` on classified errors)
- `theclaw.model_call.request_bytes` (histogram, UTF-8 byte size of the final model request payload; no raw payload content)
- `theclaw.model_call.response_bytes` (histogram, UTF-8 byte size of streamed model response events; no raw response content)
- `theclaw.model_call.time_to_first_byte_ms` (histogram, elapsed time before the first streamed response event)

### Message flow

- `theclaw.webhook.received` (counter, attrs: `theclaw.channel`, `theclaw.webhook`)
- `theclaw.webhook.error` (counter, attrs: `theclaw.channel`, `theclaw.webhook`)
- `theclaw.webhook.duration_ms` (histogram, attrs: `theclaw.channel`, `theclaw.webhook`)
- `theclaw.message.queued` (counter, attrs: `theclaw.channel`, `theclaw.source`)
- `theclaw.message.processed` (counter, attrs: `theclaw.channel`, `theclaw.outcome`)
- `theclaw.message.duration_ms` (histogram, attrs: `theclaw.channel`, `theclaw.outcome`)
- `theclaw.message.delivery.started` (counter, attrs: `theclaw.channel`, `theclaw.delivery.kind`)
- `theclaw.message.delivery.duration_ms` (histogram, attrs: `theclaw.channel`, `theclaw.delivery.kind`, `theclaw.outcome`, `theclaw.errorCategory`)

### Queues and sessions

- `theclaw.queue.lane.enqueue` (counter, attrs: `theclaw.lane`)
- `theclaw.queue.lane.dequeue` (counter, attrs: `theclaw.lane`)
- `theclaw.queue.depth` (histogram, attrs: `theclaw.lane` or `theclaw.channel=heartbeat`)
- `theclaw.queue.wait_ms` (histogram, attrs: `theclaw.lane`)
- `theclaw.session.state` (counter, attrs: `theclaw.state`, `theclaw.reason`)
- `theclaw.session.stuck` (counter, attrs: `theclaw.state`)
- `theclaw.session.stuck_age_ms` (histogram, attrs: `theclaw.state`)
- `theclaw.run.attempt` (counter, attrs: `theclaw.attempt`)

### Harness lifecycle

- `theclaw.harness.duration_ms` (histogram, attrs: `theclaw.harness.id`, `theclaw.harness.plugin`, `theclaw.outcome`, `theclaw.harness.phase` on errors)

### Exec

- `theclaw.exec.duration_ms` (histogram, attrs: `theclaw.exec.target`, `theclaw.exec.mode`, `theclaw.outcome`, `theclaw.failureKind`)

### Diagnostics internals (memory and tool loop)

- `theclaw.memory.heap_used_bytes` (histogram, attrs: `theclaw.memory.kind`)
- `theclaw.memory.rss_bytes` (histogram)
- `theclaw.memory.pressure` (counter, attrs: `theclaw.memory.level`)
- `theclaw.tool.loop.iterations` (counter, attrs: `theclaw.toolName`, `theclaw.outcome`)
- `theclaw.tool.loop.duration_ms` (histogram, attrs: `theclaw.toolName`, `theclaw.outcome`)

## Exported spans

- `theclaw.model.usage`
  - `theclaw.channel`, `theclaw.provider`, `theclaw.model`
  - `theclaw.tokens.*` (input/output/cache_read/cache_write/total)
  - `gen_ai.system` by default, or `gen_ai.provider.name` when the latest GenAI semantic conventions are opted in
  - `gen_ai.request.model`, `gen_ai.operation.name`, `gen_ai.usage.*`
- `theclaw.run`
  - `theclaw.outcome`, `theclaw.channel`, `theclaw.provider`, `theclaw.model`, `theclaw.errorCategory`
- `theclaw.model.call`
  - `gen_ai.system` by default, or `gen_ai.provider.name` when the latest GenAI semantic conventions are opted in
  - `gen_ai.request.model`, `gen_ai.operation.name`, `theclaw.provider`, `theclaw.model`, `theclaw.api`, `theclaw.transport`
  - `theclaw.errorCategory` and optional `theclaw.failureKind` on errors
  - `theclaw.model_call.request_bytes`, `theclaw.model_call.response_bytes`, `theclaw.model_call.time_to_first_byte_ms`
  - `theclaw.provider.request_id_hash` (bounded SHA-based hash of the upstream provider request id; raw ids are not exported)
- `theclaw.harness.run`
  - `theclaw.harness.id`, `theclaw.harness.plugin`, `theclaw.outcome`, `theclaw.provider`, `theclaw.model`, `theclaw.channel`
  - On completion: `theclaw.harness.result_classification`, `theclaw.harness.yield_detected`, `theclaw.harness.items.started`, `theclaw.harness.items.completed`, `theclaw.harness.items.active`
  - On error: `theclaw.harness.phase`, `theclaw.errorCategory`, optional `theclaw.harness.cleanup_failed`
- `theclaw.tool.execution`
  - `gen_ai.tool.name`, `theclaw.toolName`, `theclaw.errorCategory`, `theclaw.tool.params.*`
- `theclaw.exec`
  - `theclaw.exec.target`, `theclaw.exec.mode`, `theclaw.outcome`, `theclaw.failureKind`, `theclaw.exec.command_length`, `theclaw.exec.exit_code`, `theclaw.exec.timed_out`
- `theclaw.webhook.processed`
  - `theclaw.channel`, `theclaw.webhook`, `theclaw.chatId`
- `theclaw.webhook.error`
  - `theclaw.channel`, `theclaw.webhook`, `theclaw.chatId`, `theclaw.error`
- `theclaw.message.processed`
  - `theclaw.channel`, `theclaw.outcome`, `theclaw.chatId`, `theclaw.messageId`, `theclaw.reason`
- `theclaw.message.delivery`
  - `theclaw.channel`, `theclaw.delivery.kind`, `theclaw.outcome`, `theclaw.errorCategory`, `theclaw.delivery.result_count`
- `theclaw.session.stuck`
  - `theclaw.state`, `theclaw.ageMs`, `theclaw.queueDepth`
- `theclaw.context.assembled`
  - `theclaw.prompt.size`, `theclaw.history.size`, `theclaw.context.tokens`, `theclaw.errorCategory` (no prompt, history, response, or session-key content)
- `theclaw.tool.loop`
  - `theclaw.toolName`, `theclaw.outcome`, `theclaw.iterations`, `theclaw.errorCategory` (no loop messages, params, or tool output)
- `theclaw.memory.pressure`
  - `theclaw.memory.level`, `theclaw.memory.heap_used_bytes`, `theclaw.memory.rss_bytes`

When content capture is explicitly enabled, model and tool spans can also
include bounded, redacted `theclaw.content.*` attributes for the specific
content classes you opted into.

## Diagnostic event catalog

The events below back the metrics and spans above. Plugins can also subscribe
to them directly without OTLP export.

**Model usage**

- `model.usage` — tokens, cost, duration, context, provider/model/channel,
  session ids. `usage` is provider/turn accounting for cost and telemetry;
  `context.used` is the current prompt/context snapshot and can be lower than
  provider `usage.total` when cached input or tool-loop calls are involved.

**Message flow**

- `webhook.received` / `webhook.processed` / `webhook.error`
- `message.queued` / `message.processed`
- `message.delivery.started` / `message.delivery.completed` / `message.delivery.error`

**Queue and session**

- `queue.lane.enqueue` / `queue.lane.dequeue`
- `session.state` / `session.stuck`
- `run.attempt`
- `diagnostic.heartbeat` (aggregate counters: webhooks/queue/session)

**Harness lifecycle**

- `harness.run.started` / `harness.run.completed` / `harness.run.error` —
  per-run lifecycle for the agent harness. Includes `harnessId`, optional
  `pluginId`, provider/model/channel, and run id. Completion adds
  `durationMs`, `outcome`, optional `resultClassification`, `yieldDetected`,
  and `itemLifecycle` counts. Errors add `phase`
  (`prepare`/`start`/`send`/`resolve`/`cleanup`), `errorCategory`, and
  optional `cleanupFailed`.

**Exec**

- `exec.process.completed` — terminal outcome, duration, target, mode, exit
  code, and failure kind. Command text and working directories are not
  included.

## Without an exporter

You can keep diagnostics events available to plugins or custom sinks without
running `diagnostics-otel`:

```json5
{
  diagnostics: { enabled: true },
}
```

For targeted debug output without raising `logging.level`, use diagnostics
flags. Flags are case-insensitive and support wildcards (e.g. `telegram.*` or
`*`):

```json5
{
  diagnostics: { flags: ["telegram.http"] },
}
```

Or as a one-off env override:

```bash
THECLAW_DIAGNOSTICS=telegram.http,telegram.payload theclaw gateway
```

Flag output goes to the standard log file (`logging.file`) and is still
redacted by `logging.redactSensitive`. Full guide:
[Diagnostics flags](/diagnostics/flags).

## Disable

```json5
{
  diagnostics: { otel: { enabled: false } },
}
```

You can also leave `diagnostics-otel` out of `plugins.allow`, or run
`theclaw plugins disable diagnostics-otel`.

## Related

- [Logging](/logging) — file logs, console output, CLI tailing, and the Control UI Logs tab
- [Gateway logging internals](/gateway/logging) — WS log styles, subsystem prefixes, and console capture
- [Diagnostics flags](/diagnostics/flags) — targeted debug-log flags
- [Diagnostics export](/gateway/diagnostics) — operator support-bundle tool (separate from OTEL export)
- [Configuration reference](/gateway/configuration-reference#diagnostics) — full `diagnostics.*` field reference
