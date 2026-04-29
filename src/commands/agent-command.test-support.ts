import path from "node:path";
import { withTempHome as withTempHomeBase } from "theclaw/plugin-sdk/test-env";
import type { TheClawConfig } from "../config/types.theclaw.js";

type AgentDefaultConfig = NonNullable<NonNullable<TheClawConfig["agents"]>["defaults"]>;
type LoadConfigMock = {
  mockReturnValue(value: TheClawConfig): unknown;
};

export async function withAgentCommandTempHome<T>(
  prefix: string,
  fn: (home: string) => Promise<T>,
): Promise<T> {
  return withTempHomeBase(fn, { prefix });
}

export function mockAgentCommandConfig(
  configSpy: LoadConfigMock,
  home: string,
  storePath: string,
  agentOverrides?: Partial<AgentDefaultConfig>,
): TheClawConfig {
  const cfg = {
    agents: {
      defaults: {
        model: { primary: "anthropic/claude-opus-4-6" },
        models: { "anthropic/claude-opus-4-6": {} },
        workspace: path.join(home, "theclaw"),
        ...agentOverrides,
      },
    },
    session: { store: storePath, mainKey: "main" },
  } as TheClawConfig;
  configSpy.mockReturnValue(cfg);
  return cfg;
}

export function createDefaultAgentCommandResult() {
  return {
    payloads: [{ text: "ok" }],
    meta: {
      durationMs: 5,
      agentMeta: { sessionId: "s", provider: "p", model: "m" },
    },
  };
}
