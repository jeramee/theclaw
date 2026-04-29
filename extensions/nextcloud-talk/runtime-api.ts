// Private runtime barrel for the bundled Nextcloud Talk extension.
// Keep this barrel thin and aligned with the local extension surface.

export type { AllowlistMatch } from "theclaw/plugin-sdk/allow-from";
export type { ChannelGroupContext } from "theclaw/plugin-sdk/channel-contract";
export { logInboundDrop } from "theclaw/plugin-sdk/channel-logging";
export { createChannelPairingController } from "theclaw/plugin-sdk/channel-pairing";
export {
  readStoreAllowFromForDmPolicy,
  resolveDmGroupAccessWithCommandGate,
} from "theclaw/plugin-sdk/channel-policy";
export type {
  BlockStreamingCoalesceConfig,
  DmConfig,
  DmPolicy,
  GroupPolicy,
  GroupToolPolicyConfig,
  TheClawConfig,
} from "theclaw/plugin-sdk/config-types";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "theclaw/plugin-sdk/runtime-group-policy";
export { dispatchInboundReplyWithBase } from "theclaw/plugin-sdk/inbound-reply-dispatch";
export type { OutboundReplyPayload } from "theclaw/plugin-sdk/reply-payload";
export { deliverFormattedTextWithAttachments } from "theclaw/plugin-sdk/reply-payload";
export type { PluginRuntime } from "theclaw/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "theclaw/plugin-sdk/runtime";
export type { SecretInput } from "theclaw/plugin-sdk/secret-input";
export { fetchWithSsrFGuard } from "theclaw/plugin-sdk/ssrf-runtime";
export { setNextcloudTalkRuntime } from "./src/runtime.js";
