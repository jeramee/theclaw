import { normalizeOptionalString } from "../shared/string-coerce.js";

export const DEFAULT_PLUGIN_DISCOVERY_CACHE_MS = 1000;
export const DEFAULT_PLUGIN_MANIFEST_CACHE_MS = 1000;

export function shouldUsePluginSnapshotCache(env: NodeJS.ProcessEnv): boolean {
  if (normalizeOptionalString(env.THECLAW_DISABLE_PLUGIN_DISCOVERY_CACHE)) {
    return false;
  }
  if (normalizeOptionalString(env.THECLAW_DISABLE_PLUGIN_MANIFEST_CACHE)) {
    return false;
  }
  const discoveryCacheMs = normalizeOptionalString(env.THECLAW_PLUGIN_DISCOVERY_CACHE_MS);
  if (discoveryCacheMs === "0") {
    return false;
  }
  const manifestCacheMs = normalizeOptionalString(env.THECLAW_PLUGIN_MANIFEST_CACHE_MS);
  if (manifestCacheMs === "0") {
    return false;
  }
  return true;
}

export function resolvePluginCacheMs(rawValue: string | undefined, defaultMs: number): number {
  const raw = normalizeOptionalString(rawValue);
  if (raw === "" || raw === "0") {
    return 0;
  }
  if (!raw) {
    return defaultMs;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) {
    return defaultMs;
  }
  return Math.max(0, parsed);
}

export function resolvePluginSnapshotCacheTtlMs(env: NodeJS.ProcessEnv): number {
  const discoveryCacheMs = resolvePluginCacheMs(
    env.THECLAW_PLUGIN_DISCOVERY_CACHE_MS,
    DEFAULT_PLUGIN_DISCOVERY_CACHE_MS,
  );
  const manifestCacheMs = resolvePluginCacheMs(
    env.THECLAW_PLUGIN_MANIFEST_CACHE_MS,
    DEFAULT_PLUGIN_MANIFEST_CACHE_MS,
  );
  return Math.min(discoveryCacheMs, manifestCacheMs);
}

export function buildPluginSnapshotCacheEnvKey(env: NodeJS.ProcessEnv): string {
  return JSON.stringify({
    THECLAW_BUNDLED_PLUGINS_DIR: env.THECLAW_BUNDLED_PLUGINS_DIR ?? "",
    THECLAW_DISABLE_PLUGIN_DISCOVERY_CACHE: env.THECLAW_DISABLE_PLUGIN_DISCOVERY_CACHE ?? "",
    THECLAW_DISABLE_PLUGIN_MANIFEST_CACHE: env.THECLAW_DISABLE_PLUGIN_MANIFEST_CACHE ?? "",
    THECLAW_PLUGIN_DISCOVERY_CACHE_MS: env.THECLAW_PLUGIN_DISCOVERY_CACHE_MS ?? "",
    THECLAW_PLUGIN_MANIFEST_CACHE_MS: env.THECLAW_PLUGIN_MANIFEST_CACHE_MS ?? "",
    THECLAW_HOME: env.THECLAW_HOME ?? "",
    THECLAW_STATE_DIR: env.THECLAW_STATE_DIR ?? "",
    THECLAW_CONFIG_PATH: env.THECLAW_CONFIG_PATH ?? "",
    HOME: env.HOME ?? "",
    USERPROFILE: env.USERPROFILE ?? "",
    VITEST: env.VITEST ?? "",
  });
}
