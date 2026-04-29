import type { TheClawConfig } from "theclaw/plugin-sdk/config-types";

export type WhatsAppAccountConfig = NonNullable<
  NonNullable<NonNullable<TheClawConfig["channels"]>["whatsapp"]>["accounts"]
>[string];
