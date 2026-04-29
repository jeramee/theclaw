import { normalizeTheClawProviderIndex } from "./normalize.js";
import { THECLAW_PROVIDER_INDEX } from "./theclaw-provider-index.js";
import type { TheClawProviderIndex } from "./types.js";

export function loadTheClawProviderIndex(
  source: unknown = THECLAW_PROVIDER_INDEX,
): TheClawProviderIndex {
  return normalizeTheClawProviderIndex(source) ?? { version: 1, providers: {} };
}
