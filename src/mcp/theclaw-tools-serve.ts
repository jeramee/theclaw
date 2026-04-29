/**
 * Standalone MCP server for selected built-in TheClaw tools.
 *
 * Run via: node --import tsx src/mcp/theclaw-tools-serve.ts
 * Or: bun src/mcp/theclaw-tools-serve.ts
 */
import { pathToFileURL } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { AnyAgentTool } from "../agents/tools/common.js";
import { createCronTool } from "../agents/tools/cron-tool.js";
import { formatErrorMessage } from "../infra/errors.js";
import { connectToolsMcpServerToStdio, createToolsMcpServer } from "./tools-stdio-server.js";

export function resolveTheClawToolsForMcp(): AnyAgentTool[] {
  return [createCronTool()];
}

export function createTheClawToolsMcpServer(
  params: {
    tools?: AnyAgentTool[];
  } = {},
): Server {
  const tools = params.tools ?? resolveTheClawToolsForMcp();
  return createToolsMcpServer({ name: "theclaw-tools", tools });
}

export async function serveTheClawToolsMcp(): Promise<void> {
  const server = createTheClawToolsMcpServer();
  await connectToolsMcpServerToStdio(server);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  serveTheClawToolsMcp().catch((err) => {
    process.stderr.write(`theclaw-tools-serve: ${formatErrorMessage(err)}\n`);
    process.exit(1);
  });
}
