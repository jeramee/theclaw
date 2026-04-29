import type { TheClawConfig } from "../../config/types.theclaw.js";

export function makeModelFallbackCfg(overrides: Partial<TheClawConfig> = {}): TheClawConfig {
  return {
    agents: {
      defaults: {
        model: {
          primary: "openai/gpt-4.1-mini",
          fallbacks: ["anthropic/claude-haiku-3-5"],
        },
      },
    },
    ...overrides,
  } as TheClawConfig;
}
