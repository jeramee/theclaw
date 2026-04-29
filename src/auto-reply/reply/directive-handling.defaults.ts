import {
  buildModelAliasIndex,
  type ModelAliasIndex,
  resolveDefaultModelForAgent,
} from "../../agents/model-selection.js";
import type { TheClawConfig } from "../../config/types.theclaw.js";

export function resolveDefaultModel(params: { cfg: TheClawConfig; agentId?: string }): {
  defaultProvider: string;
  defaultModel: string;
  aliasIndex: ModelAliasIndex;
} {
  const mainModel = resolveDefaultModelForAgent({
    cfg: params.cfg,
    agentId: params.agentId,
  });
  const defaultProvider = mainModel.provider;
  const defaultModel = mainModel.model;
  const aliasIndex = buildModelAliasIndex({
    cfg: params.cfg,
    defaultProvider,
  });
  return { defaultProvider, defaultModel, aliasIndex };
}
