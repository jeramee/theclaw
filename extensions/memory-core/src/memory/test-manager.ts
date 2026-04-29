import type { TheClawConfig } from "theclaw/plugin-sdk/memory-core-host-engine-foundation";
import { getMemorySearchManager, type MemoryIndexManager } from "./index.js";

export async function createMemoryManagerOrThrow(
  cfg: TheClawConfig,
  agentId = "main",
): Promise<MemoryIndexManager> {
  const result = await getMemorySearchManager({ cfg, agentId });
  if (!result.manager) {
    throw new Error("manager missing");
  }
  return result.manager as unknown as MemoryIndexManager;
}
