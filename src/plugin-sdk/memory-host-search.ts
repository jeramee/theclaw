import type { TheClawConfig } from "../config/types.theclaw.js";
import type { RegisteredMemorySearchManager } from "../plugins/memory-state.js";

type ActiveMemorySearchPurpose = "default" | "status";

export type ActiveMemorySearchManagerResult = {
  manager: RegisteredMemorySearchManager | null;
  error?: string;
};

type MemoryHostSearchRuntimeModule = typeof import("./memory-host-search.runtime.js");

async function loadMemoryHostSearchRuntime(): Promise<MemoryHostSearchRuntimeModule> {
  return await import("./memory-host-search.runtime.js");
}

export async function getActiveMemorySearchManager(params: {
  cfg: TheClawConfig;
  agentId: string;
  purpose?: ActiveMemorySearchPurpose;
}): Promise<ActiveMemorySearchManagerResult> {
  const runtime = await loadMemoryHostSearchRuntime();
  return await runtime.getActiveMemorySearchManager(params);
}

export async function closeActiveMemorySearchManagers(cfg?: TheClawConfig): Promise<void> {
  const runtime = await loadMemoryHostSearchRuntime();
  await runtime.closeActiveMemorySearchManagers(cfg);
}
