// Narrow Matrix monitor helper seam.
// Keep monitor internals off the broad package runtime-api barrel so monitor
// tests and shared workers do not pull unrelated Matrix helper surfaces.

export type { NormalizedLocation } from "theclaw/plugin-sdk/channel-location";
export type { PluginRuntime, RuntimeLogger } from "theclaw/plugin-sdk/plugin-runtime";
export type { BlockReplyContext, ReplyPayload } from "theclaw/plugin-sdk/reply-runtime";
export type { MarkdownTableMode, TheClawConfig } from "theclaw/plugin-sdk/config-types";
export type { RuntimeEnv } from "theclaw/plugin-sdk/runtime";
export {
  addAllowlistUserEntriesFromConfigEntry,
  buildAllowlistResolutionSummary,
  canonicalizeAllowlistWithResolvedIds,
  formatAllowlistMatchMeta,
  patchAllowlistUsersInConfigEntries,
  summarizeMapping,
} from "theclaw/plugin-sdk/allow-from";
export {
  createReplyPrefixOptions,
  createTypingCallbacks,
} from "theclaw/plugin-sdk/channel-reply-options-runtime";
export { formatLocationText, toLocationContext } from "theclaw/plugin-sdk/channel-location";
export { getAgentScopedMediaLocalRoots } from "theclaw/plugin-sdk/agent-media-payload";
export { logInboundDrop, logTypingFailure } from "theclaw/plugin-sdk/channel-logging";
export { resolveAckReaction } from "theclaw/plugin-sdk/channel-feedback";
export {
  buildChannelKeyCandidates,
  resolveChannelEntryMatch,
} from "theclaw/plugin-sdk/channel-targets";
