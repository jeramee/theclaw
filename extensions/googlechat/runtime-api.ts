// Private runtime barrel for the bundled Google Chat extension.
// Keep this barrel thin and avoid broad plugin-sdk surfaces during bootstrap.

export { DEFAULT_ACCOUNT_ID } from "theclaw/plugin-sdk/account-id";
export {
  createActionGate,
  jsonResult,
  readNumberParam,
  readReactionParams,
  readStringParam,
} from "theclaw/plugin-sdk/channel-actions";
export { buildChannelConfigSchema } from "theclaw/plugin-sdk/channel-config-primitives";
export type {
  ChannelMessageActionAdapter,
  ChannelMessageActionName,
  ChannelStatusIssue,
} from "theclaw/plugin-sdk/channel-contract";
export { missingTargetError } from "theclaw/plugin-sdk/channel-feedback";
export {
  createAccountStatusSink,
  runPassiveAccountLifecycle,
} from "theclaw/plugin-sdk/channel-lifecycle";
export { createChannelPairingController } from "theclaw/plugin-sdk/channel-pairing";
export { createChannelReplyPipeline } from "theclaw/plugin-sdk/channel-reply-pipeline";
export {
  evaluateGroupRouteAccessForPolicy,
  resolveDmGroupAccessWithLists,
  resolveSenderScopedGroupPolicy,
} from "theclaw/plugin-sdk/channel-policy";
export { PAIRING_APPROVED_MESSAGE } from "theclaw/plugin-sdk/channel-status";
export { chunkTextForOutbound } from "theclaw/plugin-sdk/text-chunking";
export type { TheClawConfig } from "theclaw/plugin-sdk/config-types";
export { GoogleChatConfigSchema } from "theclaw/plugin-sdk/bundled-channel-config-schema";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "theclaw/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "theclaw/plugin-sdk/dangerous-name-runtime";
export { fetchRemoteMedia, resolveChannelMediaMaxBytes } from "theclaw/plugin-sdk/media-runtime";
export { loadOutboundMediaFromUrl } from "theclaw/plugin-sdk/outbound-media";
export type { PluginRuntime } from "theclaw/plugin-sdk/runtime-store";
export { fetchWithSsrFGuard } from "theclaw/plugin-sdk/ssrf-runtime";
export type { GoogleChatAccountConfig, GoogleChatConfig } from "theclaw/plugin-sdk/config-types";
export { extractToolSend } from "theclaw/plugin-sdk/tool-send";
export { resolveInboundMentionDecision } from "theclaw/plugin-sdk/channel-inbound";
export { resolveInboundRouteEnvelopeBuilderWithRuntime } from "theclaw/plugin-sdk/inbound-envelope";
export { resolveWebhookPath } from "theclaw/plugin-sdk/webhook-path";
export {
  registerWebhookTargetWithPluginRoute,
  resolveWebhookTargetWithAuthOrReject,
  withResolvedWebhookRequestPipeline,
} from "theclaw/plugin-sdk/webhook-targets";
export {
  createWebhookInFlightLimiter,
  readJsonWebhookBodyOrReject,
  type WebhookInFlightLimiter,
} from "theclaw/plugin-sdk/webhook-request-guards";
export { setGoogleChatRuntime } from "./src/runtime.js";
