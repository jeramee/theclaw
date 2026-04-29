import { describe, expect, it } from "vitest";
import {
  ensureTheClawExecMarkerOnProcess,
  markTheClawExecEnv,
  THECLAW_CLI_ENV_VALUE,
  THECLAW_CLI_ENV_VAR,
} from "./theclaw-exec-env.js";

describe("markTheClawExecEnv", () => {
  it("returns a cloned env object with the exec marker set", () => {
    const env = { PATH: "/usr/bin", THECLAW_CLI: "0" };
    const marked = markTheClawExecEnv(env);

    expect(marked).toEqual({
      PATH: "/usr/bin",
      THECLAW_CLI: THECLAW_CLI_ENV_VALUE,
    });
    expect(marked).not.toBe(env);
    expect(env.THECLAW_CLI).toBe("0");
  });
});

describe("ensureTheClawExecMarkerOnProcess", () => {
  it.each([
    {
      name: "mutates and returns the provided process env",
      env: { PATH: "/usr/bin" } as NodeJS.ProcessEnv,
    },
    {
      name: "overwrites an existing marker on the provided process env",
      env: { PATH: "/usr/bin", [THECLAW_CLI_ENV_VAR]: "0" } as NodeJS.ProcessEnv,
    },
  ])("$name", ({ env }) => {
    expect(ensureTheClawExecMarkerOnProcess(env)).toBe(env);
    expect(env[THECLAW_CLI_ENV_VAR]).toBe(THECLAW_CLI_ENV_VALUE);
  });

  it("defaults to mutating process.env when no env object is provided", () => {
    const previous = process.env[THECLAW_CLI_ENV_VAR];
    delete process.env[THECLAW_CLI_ENV_VAR];

    try {
      expect(ensureTheClawExecMarkerOnProcess()).toBe(process.env);
      expect(process.env[THECLAW_CLI_ENV_VAR]).toBe(THECLAW_CLI_ENV_VALUE);
    } finally {
      if (previous === undefined) {
        delete process.env[THECLAW_CLI_ENV_VAR];
      } else {
        process.env[THECLAW_CLI_ENV_VAR] = previous;
      }
    }
  });
});
