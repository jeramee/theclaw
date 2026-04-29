import type { TheClawConfig } from "theclaw/plugin-sdk/config-types";
import { inspectDiscordAccount } from "./src/account-inspect.js";

export function inspectDiscordReadOnlyAccount(cfg: TheClawConfig, accountId?: string | null) {
  return inspectDiscordAccount({ cfg, accountId });
}
