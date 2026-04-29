import type { TheClawConfig } from "theclaw/plugin-sdk/config-types";
import { inspectSlackAccount } from "./src/account-inspect.js";

export function inspectSlackReadOnlyAccount(cfg: TheClawConfig, accountId?: string | null) {
  return inspectSlackAccount({ cfg, accountId });
}
