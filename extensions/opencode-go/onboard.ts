import {
  applyAgentDefaultModelPrimary,
  type TheClawConfig,
} from "theclaw/plugin-sdk/provider-onboard";

export const OPENCODE_GO_DEFAULT_MODEL_REF = "opencode-go/kimi-k2.6";

export function applyOpencodeGoProviderConfig(cfg: TheClawConfig): TheClawConfig {
  return cfg;
}

export function applyOpencodeGoConfig(cfg: TheClawConfig): TheClawConfig {
  return applyAgentDefaultModelPrimary(
    applyOpencodeGoProviderConfig(cfg),
    OPENCODE_GO_DEFAULT_MODEL_REF,
  );
}
