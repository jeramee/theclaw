import type { TheClawConfig } from "theclaw/plugin-sdk/config-types";

export type SignalAccountConfig = Omit<
  Exclude<NonNullable<TheClawConfig["channels"]>["signal"], undefined>,
  "accounts"
>;
