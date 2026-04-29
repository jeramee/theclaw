import {
  applyAgentDefaultModelPrimary,
  type TheClawConfig,
} from "theclaw/plugin-sdk/provider-onboard";
import { DEEPINFRA_BASE_URL, DEEPINFRA_DEFAULT_MODEL_REF } from "./provider-models.js";

export { DEEPINFRA_BASE_URL, DEEPINFRA_DEFAULT_MODEL_REF };

export function applyDeepInfraProviderConfig(
  cfg: TheClawConfig,
  modelRef: string = DEEPINFRA_DEFAULT_MODEL_REF,
): TheClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[modelRef] = {
    ...models[modelRef],
    alias: models[modelRef]?.alias ?? "DeepInfra",
  };

  return {
    ...cfg,
    agents: {
      ...cfg.agents,
      defaults: {
        ...cfg.agents?.defaults,
        models,
      },
    },
  };
}

export function applyDeepInfraConfig(
  cfg: TheClawConfig,
  modelRef: string = DEEPINFRA_DEFAULT_MODEL_REF,
): TheClawConfig {
  return applyAgentDefaultModelPrimary(applyDeepInfraProviderConfig(cfg, modelRef), modelRef);
}
