// Private runtime barrel for the bundled Mattermost extension.
// Keep this barrel thin and generic-only.

export type {
  BaseProbeResult,
  ChannelAccountSnapshot,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelPlugin,
  ChatType,
  HistoryEntry,
  TheClawConfig,
  TheClawPluginApi,
  PluginRuntime,
} from "theclaw/plugin-sdk/core";
export type { RuntimeEnv } from "theclaw/plugin-sdk/runtime";
export type { ReplyPayload } from "theclaw/plugin-sdk/reply-runtime";
export type { ModelsProviderData } from "theclaw/plugin-sdk/command-auth";
export type {
  BlockStreamingCoalesceConfig,
  DmPolicy,
  GroupPolicy,
} from "theclaw/plugin-sdk/config-types";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createDedupeCache,
  parseStrictPositiveInteger,
  resolveClientIp,
  isTrustedProxyAddress,
} from "theclaw/plugin-sdk/core";
export { buildComputedAccountStatusSnapshot } from "theclaw/plugin-sdk/channel-status";
export { createAccountStatusSink } from "theclaw/plugin-sdk/channel-lifecycle";
export { buildAgentMediaPayload } from "theclaw/plugin-sdk/agent-media-payload";
export {
  buildModelsProviderData,
  listSkillCommandsForAgents,
  resolveControlCommandGate,
  resolveStoredModelOverride,
} from "theclaw/plugin-sdk/command-auth";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "theclaw/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "theclaw/plugin-sdk/dangerous-name-runtime";
export { loadSessionStore, resolveStorePath } from "theclaw/plugin-sdk/session-store-runtime";
export { formatInboundFromLabel } from "theclaw/plugin-sdk/channel-inbound";
export { logInboundDrop } from "theclaw/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "theclaw/plugin-sdk/channel-pairing";
export {
  DM_GROUP_ACCESS_REASON,
  readStoreAllowFromForDmPolicy,
  resolveDmGroupAccessWithLists,
  resolveEffectiveAllowFromLists,
} from "theclaw/plugin-sdk/channel-policy";
export { evaluateSenderGroupAccessForPolicy } from "theclaw/plugin-sdk/group-access";
export { createChannelReplyPipeline } from "theclaw/plugin-sdk/channel-reply-pipeline";
export { logTypingFailure } from "theclaw/plugin-sdk/channel-feedback";
export { loadOutboundMediaFromUrl } from "theclaw/plugin-sdk/outbound-media";
export { rawDataToString } from "theclaw/plugin-sdk/webhook-ingress";
export { chunkTextForOutbound } from "theclaw/plugin-sdk/text-chunking";
export {
  DEFAULT_GROUP_HISTORY_LIMIT,
  buildPendingHistoryContextFromMap,
  clearHistoryEntriesIfEnabled,
  recordPendingHistoryEntryIfEnabled,
} from "theclaw/plugin-sdk/reply-history";
export { normalizeAccountId, resolveThreadSessionKeys } from "theclaw/plugin-sdk/routing";
export { resolveAllowlistMatchSimple } from "theclaw/plugin-sdk/allow-from";
export { registerPluginHttpRoute } from "theclaw/plugin-sdk/webhook-targets";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
} from "theclaw/plugin-sdk/webhook-ingress";
export {
  applyAccountNameToChannelSection,
  applySetupAccountConfigPatch,
  migrateBaseNameToDefaultAccount,
} from "theclaw/plugin-sdk/setup";
export {
  getAgentScopedMediaLocalRoots,
  resolveChannelMediaMaxBytes,
} from "theclaw/plugin-sdk/media-runtime";
export { normalizeProviderId } from "theclaw/plugin-sdk/provider-model-shared";
export { setMattermostRuntime } from "./src/runtime.js";
