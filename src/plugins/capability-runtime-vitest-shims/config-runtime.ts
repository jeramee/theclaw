import { resolveActiveTalkProviderConfig } from "../../config/talk.js";
import type { TheClawConfig } from "../../config/types.js";

export { resolveActiveTalkProviderConfig };

export function getRuntimeConfigSnapshot(): TheClawConfig | null {
  return null;
}
