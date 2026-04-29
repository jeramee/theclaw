import { describe, expect, it } from "vitest";
import { resolveTheClawToolsForMcp } from "./theclaw-tools-serve.js";
import { createPluginToolsMcpHandlers } from "./plugin-tools-handlers.js";

describe("TheClaw tools MCP server", () => {
  it("does not expose owner-only cron", async () => {
    const handlers = createPluginToolsMcpHandlers(resolveTheClawToolsForMcp());

    const listed = await handlers.listTools();
    expect(listed.tools.map((tool) => tool.name)).not.toContain("cron");
  });

  it("blocks owner-only cron invocation", async () => {
    const handlers = createPluginToolsMcpHandlers(resolveTheClawToolsForMcp());

    const result = await handlers.callTool({ name: "cron", arguments: { action: "status" } });
    expect(result).toEqual({
      content: [{ type: "text", text: "Unknown tool: cron" }],
      isError: true,
    });
  });
});
