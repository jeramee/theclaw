import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fileState = vi.hoisted(() => ({
  hasCliDotEnv: false,
}));

const dotenvState = vi.hoisted(() => {
  const state = {
    profileAtDotenvLoad: undefined as string | undefined,
    containerAtDotenvLoad: undefined as string | undefined,
  };
  return {
    state,
    loadDotEnv: vi.fn(() => {
      state.profileAtDotenvLoad = process.env.THECLAW_PROFILE;
      state.containerAtDotenvLoad = process.env.THECLAW_CONTAINER;
    }),
  };
});

const maybeRunCliInContainerMock = vi.hoisted(() =>
  vi.fn((argv: string[]) => ({ handled: false, argv })),
);

vi.mock("node:fs", async () => {
  const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
  type ExistsSyncPath = Parameters<typeof actual.existsSync>[0];
  return {
    ...actual,
    existsSync: vi.fn((target: ExistsSyncPath) => {
      if (typeof target === "string" && target.endsWith(".env")) {
        return fileState.hasCliDotEnv;
      }
      return actual.existsSync(target);
    }),
  };
});

vi.mock("./dotenv.js", () => ({
  loadCliDotEnv: dotenvState.loadDotEnv,
}));

vi.mock("../infra/env.js", () => ({
  isTruthyEnvValue: (value?: string) =>
    typeof value === "string" && ["1", "on", "true", "yes"].includes(value.trim().toLowerCase()),
  normalizeEnv: vi.fn(),
}));

vi.mock("../infra/runtime-guard.js", () => ({
  assertSupportedRuntime: vi.fn(),
}));

vi.mock("../infra/path-env.js", () => ({
  ensureTheClawCliOnPath: vi.fn(),
}));

vi.mock("./route.js", () => ({
  tryRouteCli: vi.fn(async () => true),
}));

vi.mock("./windows-argv.js", () => ({
  normalizeWindowsArgv: (argv: string[]) => argv,
}));

vi.mock("./container-target.js", async () => {
  const actual =
    await vi.importActual<typeof import("./container-target.js")>("./container-target.js");
  return {
    ...actual,
    maybeRunCliInContainer: maybeRunCliInContainerMock,
  };
});

import { runCli } from "./run-main.js";

describe("runCli profile env bootstrap", () => {
  const originalProfile = process.env.THECLAW_PROFILE;
  const originalStateDir = process.env.THECLAW_STATE_DIR;
  const originalConfigPath = process.env.THECLAW_CONFIG_PATH;
  const originalContainer = process.env.THECLAW_CONTAINER;
  const originalGatewayPort = process.env.THECLAW_GATEWAY_PORT;
  const originalGatewayUrl = process.env.THECLAW_GATEWAY_URL;
  const originalGatewayToken = process.env.THECLAW_GATEWAY_TOKEN;
  const originalGatewayPassword = process.env.THECLAW_GATEWAY_PASSWORD;

  beforeEach(() => {
    delete process.env.THECLAW_PROFILE;
    delete process.env.THECLAW_STATE_DIR;
    delete process.env.THECLAW_CONFIG_PATH;
    delete process.env.THECLAW_CONTAINER;
    delete process.env.THECLAW_GATEWAY_PORT;
    delete process.env.THECLAW_GATEWAY_URL;
    delete process.env.THECLAW_GATEWAY_TOKEN;
    delete process.env.THECLAW_GATEWAY_PASSWORD;
    dotenvState.state.profileAtDotenvLoad = undefined;
    dotenvState.state.containerAtDotenvLoad = undefined;
    dotenvState.loadDotEnv.mockClear();
    maybeRunCliInContainerMock.mockClear();
    fileState.hasCliDotEnv = false;
  });

  afterEach(() => {
    if (originalProfile === undefined) {
      delete process.env.THECLAW_PROFILE;
    } else {
      process.env.THECLAW_PROFILE = originalProfile;
    }
    if (originalContainer === undefined) {
      delete process.env.THECLAW_CONTAINER;
    } else {
      process.env.THECLAW_CONTAINER = originalContainer;
    }
    if (originalStateDir === undefined) {
      delete process.env.THECLAW_STATE_DIR;
    } else {
      process.env.THECLAW_STATE_DIR = originalStateDir;
    }
    if (originalConfigPath === undefined) {
      delete process.env.THECLAW_CONFIG_PATH;
    } else {
      process.env.THECLAW_CONFIG_PATH = originalConfigPath;
    }
    if (originalGatewayPort === undefined) {
      delete process.env.THECLAW_GATEWAY_PORT;
    } else {
      process.env.THECLAW_GATEWAY_PORT = originalGatewayPort;
    }
    if (originalGatewayUrl === undefined) {
      delete process.env.THECLAW_GATEWAY_URL;
    } else {
      process.env.THECLAW_GATEWAY_URL = originalGatewayUrl;
    }
    if (originalGatewayToken === undefined) {
      delete process.env.THECLAW_GATEWAY_TOKEN;
    } else {
      process.env.THECLAW_GATEWAY_TOKEN = originalGatewayToken;
    }
    if (originalGatewayPassword === undefined) {
      delete process.env.THECLAW_GATEWAY_PASSWORD;
    } else {
      process.env.THECLAW_GATEWAY_PASSWORD = originalGatewayPassword;
    }
  });

  it("applies --profile before dotenv loading", async () => {
    fileState.hasCliDotEnv = true;
    await runCli(["node", "theclaw", "--profile", "rawdog", "status"]);

    expect(dotenvState.loadDotEnv).toHaveBeenCalledOnce();
    expect(dotenvState.state.profileAtDotenvLoad).toBe("rawdog");
    expect(process.env.THECLAW_PROFILE).toBe("rawdog");
  });

  it("rejects --container combined with --profile", async () => {
    await expect(
      runCli(["node", "theclaw", "--container", "demo", "--profile", "rawdog", "status"]),
    ).rejects.toThrow("--container cannot be combined with --profile/--dev");

    expect(dotenvState.loadDotEnv).not.toHaveBeenCalled();
    expect(process.env.THECLAW_PROFILE).toBe("rawdog");
  });

  it("rejects --container combined with interleaved --profile", async () => {
    await expect(
      runCli(["node", "theclaw", "status", "--container", "demo", "--profile", "rawdog"]),
    ).rejects.toThrow("--container cannot be combined with --profile/--dev");
  });

  it("rejects --container combined with interleaved --dev", async () => {
    await expect(
      runCli(["node", "theclaw", "status", "--container", "demo", "--dev"]),
    ).rejects.toThrow("--container cannot be combined with --profile/--dev");
  });

  it("does not let dotenv change container target resolution", async () => {
    fileState.hasCliDotEnv = true;
    dotenvState.loadDotEnv.mockImplementationOnce(() => {
      process.env.THECLAW_CONTAINER = "demo";
      dotenvState.state.profileAtDotenvLoad = process.env.THECLAW_PROFILE;
      dotenvState.state.containerAtDotenvLoad = process.env.THECLAW_CONTAINER;
    });

    await runCli(["node", "theclaw", "status"]);

    expect(dotenvState.loadDotEnv).toHaveBeenCalledOnce();
    expect(process.env.THECLAW_CONTAINER).toBe("demo");
    expect(dotenvState.state.containerAtDotenvLoad).toBe("demo");
    expect(maybeRunCliInContainerMock).toHaveBeenCalledWith(["node", "theclaw", "status"]);
    expect(maybeRunCliInContainerMock).toHaveReturnedWith({
      handled: false,
      argv: ["node", "theclaw", "status"],
    });
  });

  it("allows container mode when THECLAW_PROFILE is already set in env", async () => {
    process.env.THECLAW_PROFILE = "work";

    await expect(
      runCli(["node", "theclaw", "--container", "demo", "status"]),
    ).resolves.toBeUndefined();
  });

  it.each([
    ["THECLAW_GATEWAY_PORT", "19001"],
    ["THECLAW_GATEWAY_URL", "ws://127.0.0.1:18789"],
    ["THECLAW_GATEWAY_TOKEN", "demo-token"],
    ["THECLAW_GATEWAY_PASSWORD", "demo-password"],
  ])("allows container mode when %s is set in env", async (key, value) => {
    process.env[key] = value;

    await expect(
      runCli(["node", "theclaw", "--container", "demo", "status"]),
    ).resolves.toBeUndefined();
  });

  it("allows container mode when only THECLAW_STATE_DIR is set in env", async () => {
    process.env.THECLAW_STATE_DIR = "/tmp/theclaw-host-state";

    await expect(
      runCli(["node", "theclaw", "--container", "demo", "status"]),
    ).resolves.toBeUndefined();
  });

  it("allows container mode when only THECLAW_CONFIG_PATH is set in env", async () => {
    process.env.THECLAW_CONFIG_PATH = "/tmp/theclaw-host-state/theclaw.json";

    await expect(
      runCli(["node", "theclaw", "--container", "demo", "status"]),
    ).resolves.toBeUndefined();
  });
});
