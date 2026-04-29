// Private runtime barrel for the bundled Twitch extension.
// Keep this barrel thin and aligned with the local extension surface.

export type {
  ChannelAccountSnapshot,
  ChannelCapabilities,
  ChannelGatewayContext,
  ChannelLogSink,
  ChannelMessageActionAdapter,
  ChannelMessageActionContext,
  ChannelMeta,
  ChannelOutboundAdapter,
  ChannelOutboundContext,
  ChannelResolveKind,
  ChannelResolveResult,
  ChannelStatusAdapter,
} from "theclaw/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "theclaw/plugin-sdk/channel-core";
export type { OutboundDeliveryResult } from "theclaw/plugin-sdk/channel-send-result";
export type { TheClawConfig } from "theclaw/plugin-sdk/config-types";
export type { RuntimeEnv } from "theclaw/plugin-sdk/runtime";
export type { WizardPrompter } from "theclaw/plugin-sdk/setup";
