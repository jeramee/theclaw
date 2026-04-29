import { getRuntimeConfig, type TheClawConfig } from "../config/config.js";

export function loadBrowserConfigForRuntimeRefresh(): TheClawConfig {
  return getRuntimeConfig();
}
