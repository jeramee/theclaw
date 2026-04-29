import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createTheClawTestState, withTheClawTestState } from "./theclaw-test-state.js";

describe("theclaw test state", () => {
  it("creates an isolated home layout with spawn env and restores process env", async () => {
    const previousHome = process.env.HOME;
    const previousTheClawHome = process.env.THECLAW_HOME;
    const previousStateDir = process.env.THECLAW_STATE_DIR;
    const previousConfigPath = process.env.THECLAW_CONFIG_PATH;

    const state = await createTheClawTestState({
      label: "unit",
      scenario: "minimal",
    });

    try {
      expect(state.home).toBe(path.join(state.root, "home"));
      expect(state.stateDir).toBe(path.join(state.home, ".theclaw"));
      expect(state.configPath).toBe(path.join(state.stateDir, "theclaw.json"));
      expect(state.workspaceDir).toBe(path.join(state.home, "workspace"));
      expect(state.env.HOME).toBe(state.home);
      expect(state.env.THECLAW_HOME).toBe(state.home);
      expect(state.env.THECLAW_STATE_DIR).toBe(state.stateDir);
      expect(state.env.THECLAW_CONFIG_PATH).toBe(state.configPath);
      expect(process.env.HOME).toBe(state.home);
      expect(process.env.THECLAW_HOME).toBe(state.home);
      expect(JSON.parse(await fs.readFile(state.configPath, "utf8"))).toEqual({});
    } finally {
      await state.cleanup();
    }

    expect(process.env.HOME).toBe(previousHome);
    expect(process.env.THECLAW_HOME).toBe(previousTheClawHome);
    expect(process.env.THECLAW_STATE_DIR).toBe(previousStateDir);
    expect(process.env.THECLAW_CONFIG_PATH).toBe(previousConfigPath);
    await expect(fs.stat(state.root)).rejects.toThrow();
  });

  it("supports state-only layout without overriding HOME", async () => {
    const previousHome = process.env.HOME;

    await withTheClawTestState(
      {
        layout: "state-only",
        scenario: "empty",
      },
      async (state) => {
        expect(process.env.HOME).toBe(previousHome);
        expect(process.env.THECLAW_STATE_DIR).toBe(state.stateDir);
        expect(process.env.THECLAW_CONFIG_PATH).toBe(state.configPath);
        expect(state.env.HOME).toBe(previousHome);
        await expect(fs.stat(state.configPath)).rejects.toThrow();
      },
    );
  });

  it("clears inherited agent-dir overrides by default", async () => {
    const previousAgentDir = process.env.THECLAW_AGENT_DIR;
    const previousPiAgentDir = process.env.PI_CODING_AGENT_DIR;
    process.env.THECLAW_AGENT_DIR = "/tmp/outside-theclaw-agent";
    process.env.PI_CODING_AGENT_DIR = "/tmp/outside-pi-agent";

    try {
      const state = await createTheClawTestState({
        layout: "state-only",
      });

      try {
        expect(process.env.THECLAW_AGENT_DIR).toBeUndefined();
        expect(process.env.PI_CODING_AGENT_DIR).toBeUndefined();
        expect(state.env.THECLAW_AGENT_DIR).toBeUndefined();
        expect(state.env.PI_CODING_AGENT_DIR).toBeUndefined();
        expect(state.agentDir()).toBe(path.join(state.stateDir, "agents", "main", "agent"));
      } finally {
        await state.cleanup();
      }

      expect(process.env.THECLAW_AGENT_DIR).toBe("/tmp/outside-theclaw-agent");
      expect(process.env.PI_CODING_AGENT_DIR).toBe("/tmp/outside-pi-agent");
    } finally {
      if (previousAgentDir === undefined) {
        delete process.env.THECLAW_AGENT_DIR;
      } else {
        process.env.THECLAW_AGENT_DIR = previousAgentDir;
      }
      if (previousPiAgentDir === undefined) {
        delete process.env.PI_CODING_AGENT_DIR;
      } else {
        process.env.PI_CODING_AGENT_DIR = previousPiAgentDir;
      }
    }
  });

  it("allows explicit agent-dir overrides when a test needs them", async () => {
    await withTheClawTestState(
      {
        env: {
          THECLAW_AGENT_DIR: "/tmp/explicit-theclaw-agent",
          PI_CODING_AGENT_DIR: "/tmp/explicit-pi-agent",
        },
      },
      async (state) => {
        expect(process.env.THECLAW_AGENT_DIR).toBe("/tmp/explicit-theclaw-agent");
        expect(process.env.PI_CODING_AGENT_DIR).toBe("/tmp/explicit-pi-agent");
        expect(state.env.THECLAW_AGENT_DIR).toBe("/tmp/explicit-theclaw-agent");
        expect(state.env.PI_CODING_AGENT_DIR).toBe("/tmp/explicit-pi-agent");
      },
    );
  });

  it("can route agent-dir env vars to the isolated main agent store", async () => {
    await withTheClawTestState(
      {
        agentEnv: "main",
      },
      async (state) => {
        expect(process.env.THECLAW_AGENT_DIR).toBe(state.agentDir());
        expect(process.env.PI_CODING_AGENT_DIR).toBe(state.agentDir());
        expect(state.env.THECLAW_AGENT_DIR).toBe(state.agentDir());
        expect(state.env.PI_CODING_AGENT_DIR).toBe(state.agentDir());
      },
    );
  });

  it("writes scenario configs and auth profile stores", async () => {
    await withTheClawTestState(
      {
        scenario: "update-stable",
      },
      async (state) => {
        expect(JSON.parse(await fs.readFile(state.configPath, "utf8"))).toEqual({
          update: {
            channel: "stable",
          },
          plugins: {},
        });

        const profilePath = await state.writeAuthProfiles({
          version: 1,
          profiles: {
            "openai:test": {
              type: "api_key",
              provider: "openai",
              key: "sk-test",
            },
          },
        });

        expect(profilePath).toBe(path.join(state.agentDir(), "auth-profiles.json"));
        expect(JSON.parse(await fs.readFile(profilePath, "utf8"))).toMatchObject({
          version: 1,
          profiles: {
            "openai:test": {
              provider: "openai",
            },
          },
        });
      },
    );
  });

  it("keeps external-service env scoped to the fixture", async () => {
    const previousPolicy = process.env.THECLAW_SERVICE_REPAIR_POLICY;

    await withTheClawTestState(
      {
        scenario: "external-service",
      },
      async (state) => {
        expect(process.env.THECLAW_SERVICE_REPAIR_POLICY).toBe("external");
        expect(state.env.THECLAW_SERVICE_REPAIR_POLICY).toBe("external");
      },
    );

    expect(process.env.THECLAW_SERVICE_REPAIR_POLICY).toBe(previousPolicy);
  });
});
