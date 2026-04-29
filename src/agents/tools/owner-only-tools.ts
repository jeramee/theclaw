export const THECLAW_OWNER_ONLY_CORE_TOOL_NAMES = ["cron", "gateway", "nodes"] as const;

const THECLAW_OWNER_ONLY_CORE_TOOL_NAME_SET: ReadonlySet<string> = new Set(
  THECLAW_OWNER_ONLY_CORE_TOOL_NAMES,
);

export function isTheClawOwnerOnlyCoreToolName(toolName: string): boolean {
  return THECLAW_OWNER_ONLY_CORE_TOOL_NAME_SET.has(toolName);
}
