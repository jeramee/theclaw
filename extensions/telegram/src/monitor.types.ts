import type {
  ChannelAccountSnapshot,
  ChannelRuntimeSurface,
} from "theclaw/plugin-sdk/channel-contract";
import type { TheClawConfig } from "theclaw/plugin-sdk/config-types";
import type { RuntimeEnv } from "theclaw/plugin-sdk/runtime-env";

export type MonitorTelegramOpts = {
  token?: string;
  accountId?: string;
  config?: TheClawConfig;
  runtime?: RuntimeEnv;
  channelRuntime?: ChannelRuntimeSurface;
  abortSignal?: AbortSignal;
  useWebhook?: boolean;
  webhookPath?: string;
  webhookPort?: number;
  webhookSecret?: string;
  webhookHost?: string;
  proxyFetch?: typeof fetch;
  webhookUrl?: string;
  webhookCertPath?: string;
  setStatus?: (patch: Omit<ChannelAccountSnapshot, "accountId">) => void;
};

export type TelegramMonitorFn = (opts?: MonitorTelegramOpts) => Promise<void>;
