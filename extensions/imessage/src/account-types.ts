import type { TheClawConfig } from "theclaw/plugin-sdk/config-types";

export type IMessageAccountConfig = Omit<
  NonNullable<NonNullable<TheClawConfig["channels"]>["imessage"]>,
  "accounts" | "defaultAccount"
>;
