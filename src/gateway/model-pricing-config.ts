import type { TheClawConfig } from "../config/types.theclaw.js";

export function isGatewayModelPricingEnabled(config: TheClawConfig): boolean {
  return config.models?.pricing?.enabled !== false;
}
