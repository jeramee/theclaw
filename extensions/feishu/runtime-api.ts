// Private runtime barrel for the bundled Feishu extension.
// Keep this barrel thin and generic-only.

export type {
  AllowlistMatch,
  AnyAgentTool,
  BaseProbeResult,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelMeta,
  ChannelOutboundAdapter,
  ChannelPlugin,
  HistoryEntry,
  TheClawConfig,
  TheClawPluginApi,
  OutboundIdentity,
  PluginRuntime,
  ReplyPayload,
} from "theclaw/plugin-sdk/core";
export type { TheClawConfig as ClawdbotConfig } from "theclaw/plugin-sdk/core";
export type { RuntimeEnv } from "theclaw/plugin-sdk/runtime";
export type { GroupToolPolicyConfig } from "theclaw/plugin-sdk/config-types";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createActionGate,
  createDedupeCache,
} from "theclaw/plugin-sdk/core";
export {
  PAIRING_APPROVED_MESSAGE,
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "theclaw/plugin-sdk/channel-status";
export { buildAgentMediaPayload } from "theclaw/plugin-sdk/agent-media-payload";
export { createChannelPairingController } from "theclaw/plugin-sdk/channel-pairing";
export { createReplyPrefixContext } from "theclaw/plugin-sdk/channel-reply-pipeline";
export {
  evaluateSupplementalContextVisibility,
  filterSupplementalContextItems,
  resolveChannelContextVisibilityMode,
} from "theclaw/plugin-sdk/context-visibility-runtime";
export {
  loadSessionStore,
  resolveSessionStoreEntry,
} from "theclaw/plugin-sdk/session-store-runtime";
export { readJsonFileWithFallback } from "theclaw/plugin-sdk/json-store";
export { createPersistentDedupe } from "theclaw/plugin-sdk/persistent-dedupe";
export { normalizeAgentId } from "theclaw/plugin-sdk/routing";
export { chunkTextForOutbound } from "theclaw/plugin-sdk/text-chunking";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
  requestBodyErrorToText,
} from "theclaw/plugin-sdk/webhook-ingress";
export { setFeishuRuntime } from "./src/runtime.js";
