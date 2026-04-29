import { normalizeOptionalString } from "../shared/string-coerce.js";

export function resolveDaemonContainerContext(
  env: Record<string, string | undefined> = process.env,
): string | null {
  return (
    normalizeOptionalString(env.THECLAW_CONTAINER_HINT) ||
    normalizeOptionalString(env.THECLAW_CONTAINER) ||
    null
  );
}
