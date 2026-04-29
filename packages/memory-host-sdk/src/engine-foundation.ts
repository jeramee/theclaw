// Real workspace contract for memory engine foundation concerns.

export {
  resolveAgentContextLimits,
  resolveAgentDir,
  resolveAgentWorkspaceDir,
  resolveDefaultAgentId,
  resolveSessionAgentId,
} from "./host/theclaw-runtime-agent.js";
export {
  resolveMemorySearchConfig,
  resolveMemorySearchSyncConfig,
  type ResolvedMemorySearchConfig,
  type ResolvedMemorySearchSyncConfig,
} from "./host/theclaw-runtime-agent.js";
export { parseDurationMs } from "./host/theclaw-runtime-config.js";
export { loadConfig } from "./host/theclaw-runtime-config.js";
export { resolveStateDir } from "./host/theclaw-runtime-config.js";
export { resolveSessionTranscriptsDirForAgent } from "./host/theclaw-runtime-config.js";
export {
  hasConfiguredSecretInput,
  normalizeResolvedSecretInputString,
} from "./host/theclaw-runtime-config.js";
export { writeFileWithinRoot } from "./host/theclaw-runtime-io.js";
export { createSubsystemLogger } from "./host/theclaw-runtime-io.js";
export { detectMime } from "./host/theclaw-runtime-io.js";
export { resolveGlobalSingleton } from "./host/theclaw-runtime-io.js";
export { onSessionTranscriptUpdate } from "./host/theclaw-runtime-session.js";
export { splitShellArgs } from "./host/theclaw-runtime-io.js";
export { runTasksWithConcurrency } from "./host/theclaw-runtime-io.js";
export {
  shortenHomeInString,
  shortenHomePath,
  resolveUserPath,
  truncateUtf16Safe,
} from "./host/theclaw-runtime-io.js";
export type { TheClawConfig } from "./host/theclaw-runtime-config.js";
export type { SessionSendPolicyConfig } from "./host/theclaw-runtime-config.js";
export type { SecretInput } from "./host/theclaw-runtime-config.js";
export type {
  MemoryBackend,
  MemoryCitationsMode,
  MemoryQmdConfig,
  MemoryQmdIndexPath,
  MemoryQmdMcporterConfig,
  MemoryQmdSearchMode,
} from "./host/theclaw-runtime-config.js";
export type { MemorySearchConfig } from "./host/theclaw-runtime-config.js";
