import type { ChannelDoctorConfigMutation } from "theclaw/plugin-sdk/channel-contract";
import type { TheClawConfig } from "theclaw/plugin-sdk/config-types";
import { normalizeCompatibilityConfig as normalizeCompatibilityConfigImpl } from "./doctor.js";

export function normalizeCompatibilityConfig({
  cfg,
}: {
  cfg: TheClawConfig;
}): ChannelDoctorConfigMutation {
  return normalizeCompatibilityConfigImpl({ cfg });
}
