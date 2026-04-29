import type { TheClawConfig } from "../../config/types.theclaw.js";

export function createPerSenderSessionConfig(
  overrides: Partial<NonNullable<TheClawConfig["session"]>> = {},
): NonNullable<TheClawConfig["session"]> {
  return {
    mainKey: "main",
    scope: "per-sender",
    ...overrides,
  };
}
