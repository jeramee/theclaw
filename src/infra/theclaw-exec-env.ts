export const THECLAW_CLI_ENV_VAR = "THECLAW_CLI";
export const THECLAW_CLI_ENV_VALUE = "1";

export function markTheClawExecEnv<T extends Record<string, string | undefined>>(env: T): T {
  return {
    ...env,
    [THECLAW_CLI_ENV_VAR]: THECLAW_CLI_ENV_VALUE,
  };
}

export function ensureTheClawExecMarkerOnProcess(
  env: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  env[THECLAW_CLI_ENV_VAR] = THECLAW_CLI_ENV_VALUE;
  return env;
}
