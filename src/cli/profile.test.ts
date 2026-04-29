import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "theclaw",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "theclaw", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("leaves gateway --dev for subcommands after leading root options", () => {
    const res = parseCliProfileArgs([
      "node",
      "theclaw",
      "--no-color",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual([
      "node",
      "theclaw",
      "--no-color",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "theclaw", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "theclaw", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "theclaw", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "theclaw", "status"]);
  });

  it("parses interleaved --profile after the command token", () => {
    const res = parseCliProfileArgs(["node", "theclaw", "status", "--profile", "work", "--deep"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "theclaw", "status", "--deep"]);
  });

  it("preserves Matrix QA --profile for the command parser", () => {
    const res = parseCliProfileArgs([
      "node",
      "theclaw",
      "qa",
      "matrix",
      "--profile",
      "fast",
      "--fail-fast",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual([
      "node",
      "theclaw",
      "qa",
      "matrix",
      "--profile",
      "fast",
      "--fail-fast",
    ]);
  });

  it("preserves Matrix QA --profile after leading root options", () => {
    const res = parseCliProfileArgs([
      "node",
      "theclaw",
      "--no-color",
      "qa",
      "matrix",
      "--profile=fast",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "theclaw", "--no-color", "qa", "matrix", "--profile=fast"]);
  });

  it("still parses root --profile before Matrix QA", () => {
    const res = parseCliProfileArgs([
      "node",
      "theclaw",
      "--profile",
      "work",
      "qa",
      "matrix",
      "--fail-fast",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "theclaw", "qa", "matrix", "--fail-fast"]);
  });

  it("parses interleaved --dev after the command token", () => {
    const res = parseCliProfileArgs(["node", "theclaw", "status", "--dev"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "theclaw", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "theclaw", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it.each([
    ["--dev first", ["node", "theclaw", "--dev", "--profile", "work", "status"]],
    ["--profile first", ["node", "theclaw", "--profile", "work", "--dev", "status"]],
    ["interleaved after command", ["node", "theclaw", "status", "--profile", "work", "--dev"]],
  ])("rejects combining --dev with --profile (%s)", (_name, argv) => {
    const res = parseCliProfileArgs(argv);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join(path.resolve("/home/peter"), ".theclaw-dev");
    expect(env.THECLAW_PROFILE).toBe("dev");
    expect(env.THECLAW_STATE_DIR).toBe(expectedStateDir);
    expect(env.THECLAW_CONFIG_PATH).toBe(path.join(expectedStateDir, "theclaw.json"));
    expect(env.THECLAW_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      THECLAW_STATE_DIR: "/custom",
      THECLAW_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.THECLAW_STATE_DIR).toBe("/custom");
    expect(env.THECLAW_GATEWAY_PORT).toBe("19099");
    expect(env.THECLAW_CONFIG_PATH).toBe(path.join("/custom", "theclaw.json"));
  });

  it("uses THECLAW_HOME when deriving profile state dir", () => {
    const env: Record<string, string | undefined> = {
      THECLAW_HOME: "/srv/theclaw-home",
      HOME: "/home/other",
    };
    applyCliProfileEnv({
      profile: "work",
      env,
      homedir: () => "/home/fallback",
    });

    const resolvedHome = path.resolve("/srv/theclaw-home");
    expect(env.THECLAW_STATE_DIR).toBe(path.join(resolvedHome, ".theclaw-work"));
    expect(env.THECLAW_CONFIG_PATH).toBe(
      path.join(resolvedHome, ".theclaw-work", "theclaw.json"),
    );
  });
});

describe("formatCliCommand", () => {
  it.each([
    {
      name: "no profile is set",
      cmd: "theclaw doctor --fix",
      env: {},
      expected: "theclaw doctor --fix",
    },
    {
      name: "profile is default",
      cmd: "theclaw doctor --fix",
      env: { THECLAW_PROFILE: "default" },
      expected: "theclaw doctor --fix",
    },
    {
      name: "profile is Default (case-insensitive)",
      cmd: "theclaw doctor --fix",
      env: { THECLAW_PROFILE: "Default" },
      expected: "theclaw doctor --fix",
    },
    {
      name: "profile is invalid",
      cmd: "theclaw doctor --fix",
      env: { THECLAW_PROFILE: "bad profile" },
      expected: "theclaw doctor --fix",
    },
    {
      name: "--profile is already present",
      cmd: "theclaw --profile work doctor --fix",
      env: { THECLAW_PROFILE: "work" },
      expected: "theclaw --profile work doctor --fix",
    },
    {
      name: "--dev is already present",
      cmd: "theclaw --dev doctor",
      env: { THECLAW_PROFILE: "dev" },
      expected: "theclaw --dev doctor",
    },
  ])("returns command unchanged when $name", ({ cmd, env, expected }) => {
    expect(formatCliCommand(cmd, env)).toBe(expected);
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("theclaw doctor --fix", { THECLAW_PROFILE: "work" })).toBe(
      "theclaw --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("theclaw doctor --fix", { THECLAW_PROFILE: "  jbtheclaw  " })).toBe(
      "theclaw --profile jbtheclaw doctor --fix",
    );
  });

  it("handles command with no args after theclaw", () => {
    expect(formatCliCommand("theclaw", { THECLAW_PROFILE: "test" })).toBe(
      "theclaw --profile test",
    );
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm theclaw doctor", { THECLAW_PROFILE: "work" })).toBe(
      "pnpm theclaw --profile work doctor",
    );
  });

  it("inserts --container when a container hint is set", () => {
    expect(
      formatCliCommand("theclaw gateway status --deep", { THECLAW_CONTAINER_HINT: "demo" }),
    ).toBe("theclaw --container demo gateway status --deep");
  });

  it("ignores unsafe container hints", () => {
    expect(
      formatCliCommand("theclaw gateway status --deep", {
        THECLAW_CONTAINER_HINT: "demo; rm -rf /",
      }),
    ).toBe("theclaw gateway status --deep");
  });

  it("preserves both --container and --profile hints", () => {
    expect(
      formatCliCommand("theclaw doctor", {
        THECLAW_CONTAINER_HINT: "demo",
        THECLAW_PROFILE: "work",
      }),
    ).toBe("theclaw --container demo doctor");
  });

  it("does not prepend --container for update commands", () => {
    expect(formatCliCommand("theclaw update", { THECLAW_CONTAINER_HINT: "demo" })).toBe(
      "theclaw update",
    );
    expect(
      formatCliCommand("pnpm theclaw update --channel beta", { THECLAW_CONTAINER_HINT: "demo" }),
    ).toBe("pnpm theclaw update --channel beta");
  });
});
