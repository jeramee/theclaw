import type { TheClawConfig } from "../../../config/types.theclaw.js";

export type DoctorConfigMutationState = {
  cfg: TheClawConfig;
  candidate: TheClawConfig;
  pendingChanges: boolean;
  fixHints: string[];
};

export type DoctorConfigMutationResult = {
  config: TheClawConfig;
  changes: string[];
};

export function applyDoctorConfigMutation(params: {
  state: DoctorConfigMutationState;
  mutation: DoctorConfigMutationResult;
  shouldRepair: boolean;
  fixHint?: string;
}): DoctorConfigMutationState {
  if (params.mutation.changes.length === 0) {
    return params.state;
  }

  return {
    cfg: params.shouldRepair ? params.mutation.config : params.state.cfg,
    candidate: params.mutation.config,
    pendingChanges: true,
    fixHints:
      !params.shouldRepair && params.fixHint
        ? [...params.state.fixHints, params.fixHint]
        : params.state.fixHints,
  };
}
