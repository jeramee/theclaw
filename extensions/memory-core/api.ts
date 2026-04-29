export type { TheClawConfig } from "theclaw/plugin-sdk/config-types";
export type {
  MemoryEmbeddingProbeResult,
  MemoryProviderStatus,
  MemorySyncProgressUpdate,
} from "theclaw/plugin-sdk/memory-core-host-engine-storage";
export {
  dedupeDreamDiaryEntries,
  removeBackfillDiaryEntries,
  writeBackfillDiaryEntries,
} from "./src/dreaming-narrative.js";
export { previewGroundedRemMarkdown } from "./src/rem-evidence.js";
