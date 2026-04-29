// Private runtime barrel for the bundled Microsoft Teams extension.
// Keep this barrel thin and aligned with the local extension surface.

export { DEFAULT_ACCOUNT_ID } from "theclaw/plugin-sdk/account-id";
export type { AllowlistMatch } from "theclaw/plugin-sdk/allow-from";
export {
  mergeAllowlist,
  resolveAllowlistMatchSimple,
  summarizeMapping,
} from "theclaw/plugin-sdk/allow-from";
export type {
  BaseProbeResult,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelOutboundAdapter,
} from "theclaw/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "theclaw/plugin-sdk/channel-core";
export { logTypingFailure } from "theclaw/plugin-sdk/channel-logging";
export { createChannelPairingController } from "theclaw/plugin-sdk/channel-pairing";
export {
  evaluateSenderGroupAccessForPolicy,
  readStoreAllowFromForDmPolicy,
  resolveDmGroupAccessWithLists,
  resolveEffectiveAllowFromLists,
  resolveSenderScopedGroupPolicy,
  resolveToolsBySender,
} from "theclaw/plugin-sdk/channel-policy";
export { createChannelReplyPipeline } from "theclaw/plugin-sdk/channel-reply-pipeline";
export {
  PAIRING_APPROVED_MESSAGE,
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "theclaw/plugin-sdk/channel-status";
export {
  buildChannelKeyCandidates,
  normalizeChannelSlug,
  resolveChannelEntryMatchWithFallback,
  resolveNestedAllowlistDecision,
} from "theclaw/plugin-sdk/channel-targets";
export type {
  GroupPolicy,
  GroupToolPolicyConfig,
  MSTeamsChannelConfig,
  MSTeamsConfig,
  MSTeamsReplyStyle,
  MSTeamsTeamConfig,
  MarkdownTableMode,
  TheClawConfig,
} from "theclaw/plugin-sdk/config-types";
export { isDangerousNameMatchingEnabled } from "theclaw/plugin-sdk/dangerous-name-runtime";
export { resolveDefaultGroupPolicy } from "theclaw/plugin-sdk/runtime-group-policy";
export { withFileLock } from "theclaw/plugin-sdk/file-lock";
export { keepHttpServerTaskAlive } from "theclaw/plugin-sdk/channel-lifecycle";
export {
  detectMime,
  extensionForMime,
  extractOriginalFilename,
  getFileExtension,
  resolveChannelMediaMaxBytes,
} from "theclaw/plugin-sdk/media-runtime";
export { dispatchReplyFromConfigWithSettledDispatcher } from "theclaw/plugin-sdk/inbound-reply-dispatch";
export { loadOutboundMediaFromUrl } from "theclaw/plugin-sdk/outbound-media";
export { buildMediaPayload } from "theclaw/plugin-sdk/reply-payload";
export type { ReplyPayload } from "theclaw/plugin-sdk/reply-payload";
export type { PluginRuntime } from "theclaw/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "theclaw/plugin-sdk/runtime";
export type { SsrFPolicy } from "theclaw/plugin-sdk/ssrf-runtime";
export { fetchWithSsrFGuard } from "theclaw/plugin-sdk/ssrf-runtime";
export { normalizeStringEntries } from "theclaw/plugin-sdk/string-normalization-runtime";
export { chunkTextForOutbound } from "theclaw/plugin-sdk/text-chunking";
export { DEFAULT_WEBHOOK_MAX_BODY_BYTES } from "theclaw/plugin-sdk/webhook-ingress";
export { setMSTeamsRuntime } from "./src/runtime.js";
