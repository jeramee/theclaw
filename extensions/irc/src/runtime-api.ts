// Private runtime barrel for the bundled IRC extension.
// Keep this barrel thin and generic-only.

export type { BaseProbeResult } from "theclaw/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "theclaw/plugin-sdk/channel-core";
export type { TheClawConfig } from "theclaw/plugin-sdk/config-types";
export type { PluginRuntime } from "theclaw/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "theclaw/plugin-sdk/runtime";
export type {
  BlockStreamingCoalesceConfig,
  DmConfig,
  DmPolicy,
  GroupPolicy,
  GroupToolPolicyBySenderConfig,
  GroupToolPolicyConfig,
  MarkdownConfig,
} from "theclaw/plugin-sdk/config-types";
export type { OutboundReplyPayload } from "theclaw/plugin-sdk/reply-payload";
export { DEFAULT_ACCOUNT_ID } from "theclaw/plugin-sdk/account-id";
export { buildChannelConfigSchema } from "theclaw/plugin-sdk/channel-config-primitives";
export {
  PAIRING_APPROVED_MESSAGE,
  buildBaseChannelStatusSummary,
} from "theclaw/plugin-sdk/channel-status";
export { createChannelPairingController } from "theclaw/plugin-sdk/channel-pairing";
export { createAccountStatusSink } from "theclaw/plugin-sdk/channel-lifecycle";
export {
  readStoreAllowFromForDmPolicy,
  resolveEffectiveAllowFromLists,
} from "theclaw/plugin-sdk/channel-policy";
export { resolveControlCommandGate } from "theclaw/plugin-sdk/command-auth";
export { dispatchInboundReplyWithBase } from "theclaw/plugin-sdk/inbound-reply-dispatch";
export { chunkTextForOutbound } from "theclaw/plugin-sdk/text-chunking";
export {
  deliverFormattedTextWithAttachments,
  formatTextWithAttachmentLinks,
  resolveOutboundMediaUrls,
} from "theclaw/plugin-sdk/reply-payload";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "theclaw/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "theclaw/plugin-sdk/dangerous-name-runtime";
export { logInboundDrop } from "theclaw/plugin-sdk/channel-inbound";
