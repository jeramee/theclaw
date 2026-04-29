import type { TheClawConfig } from "../../../config/types.theclaw.js";
import { normalizeBaseCompatibilityConfigValues } from "./legacy-config-compatibility-base.js";

export function normalizeRuntimeCompatibilityConfigValues(cfg: TheClawConfig): {
  config: TheClawConfig;
  changes: string[];
} {
  const changes: string[] = [];
  const next = normalizeBaseCompatibilityConfigValues(cfg, changes);
  return { config: next, changes };
}
