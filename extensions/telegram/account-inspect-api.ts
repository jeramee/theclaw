import type { TheClawConfig } from "./runtime-api.js";
import { inspectTelegramAccount } from "./src/account-inspect.js";

export function inspectTelegramReadOnlyAccount(cfg: TheClawConfig, accountId?: string | null) {
  return inspectTelegramAccount({ cfg, accountId });
}
