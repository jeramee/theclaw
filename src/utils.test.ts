import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { withTempDir } from "./test-helpers/temp-dir.js";
import {
  ensureDir,
  resolveConfigDir,
  resolveHomeDir,
  resolveUserPath,
  shortenHomeInString,
  shortenHomePath,
  sleep,
} from "./utils.js";

describe("ensureDir", () => {
  it("creates nested directory", async () => {
    await withTempDir({ prefix: "theclaw-test-" }, async (tmp) => {
      const target = path.join(tmp, "nested", "dir");
      await ensureDir(target);
      expect(fs.existsSync(target)).toBe(true);
    });
  });
});

describe("sleep", () => {
  it("resolves after delay using fake timers", async () => {
    vi.useFakeTimers();
    try {
      const promise = sleep(1000);
      vi.advanceTimersByTime(1000);
      await expect(promise).resolves.toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("resolveConfigDir", () => {
  it("prefers ~/.theclaw when legacy dir is missing", async () => {
    await withTempDir({ prefix: "theclaw-config-dir-" }, async (root) => {
      const newDir = path.join(root, ".theclaw");
      await fs.promises.mkdir(newDir, { recursive: true });
      const resolved = resolveConfigDir({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(newDir);
    });
  });

  it("expands THECLAW_STATE_DIR using the provided env", () => {
    const env = {
      HOME: "/tmp/theclaw-home",
      THECLAW_STATE_DIR: "~/state",
    } as NodeJS.ProcessEnv;

    expect(resolveConfigDir(env)).toBe(path.resolve("/tmp/theclaw-home", "state"));
  });

  it("falls back to the config file directory when only THECLAW_CONFIG_PATH is set", () => {
    const env = {
      HOME: "/tmp/theclaw-home",
      THECLAW_CONFIG_PATH: "~/profiles/dev/theclaw.json",
    } as NodeJS.ProcessEnv;

    expect(resolveConfigDir(env)).toBe(path.resolve("/tmp/theclaw-home", "profiles", "dev"));
  });
});

describe("resolveHomeDir", () => {
  it("prefers THECLAW_HOME over HOME", () => {
    vi.stubEnv("THECLAW_HOME", "/srv/theclaw-home");
    vi.stubEnv("HOME", "/home/other");
    try {
      expect(resolveHomeDir()).toBe(path.resolve("/srv/theclaw-home"));
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("shortenHomePath", () => {
  it("uses $THECLAW_HOME prefix when THECLAW_HOME is set", () => {
    vi.stubEnv("THECLAW_HOME", "/srv/theclaw-home");
    vi.stubEnv("HOME", "/home/other");
    try {
      expect(shortenHomePath(`${path.resolve("/srv/theclaw-home")}/.theclaw/theclaw.json`)).toBe(
        "$THECLAW_HOME/.theclaw/theclaw.json",
      );
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("shortenHomeInString", () => {
  it("uses $THECLAW_HOME replacement when THECLAW_HOME is set", () => {
    vi.stubEnv("THECLAW_HOME", "/srv/theclaw-home");
    vi.stubEnv("HOME", "/home/other");
    try {
      expect(
        shortenHomeInString(
          `config: ${path.resolve("/srv/theclaw-home")}/.theclaw/theclaw.json`,
        ),
      ).toBe("config: $THECLAW_HOME/.theclaw/theclaw.json");
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("resolveUserPath", () => {
  it("expands ~ to home dir", () => {
    expect(resolveUserPath("~", {}, () => "/Users/thoffman")).toBe(path.resolve("/Users/thoffman"));
  });

  it("expands ~/ to home dir", () => {
    expect(resolveUserPath("~/theclaw", {}, () => "/Users/thoffman")).toBe(
      path.resolve("/Users/thoffman", "theclaw"),
    );
  });

  it("resolves relative paths", () => {
    expect(resolveUserPath("tmp/dir")).toBe(path.resolve("tmp/dir"));
  });

  it("prefers THECLAW_HOME for tilde expansion", () => {
    vi.stubEnv("THECLAW_HOME", "/srv/theclaw-home");
    vi.stubEnv("HOME", "/home/other");
    try {
      expect(resolveUserPath("~/theclaw")).toBe(path.resolve("/srv/theclaw-home", "theclaw"));
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("uses the provided env for tilde expansion", () => {
    const env = {
      HOME: "/tmp/theclaw-home",
      THECLAW_HOME: "/srv/theclaw-home",
    } as NodeJS.ProcessEnv;

    expect(resolveUserPath("~/theclaw", env)).toBe(path.resolve("/srv/theclaw-home", "theclaw"));
  });

  it("keeps blank paths blank", () => {
    expect(resolveUserPath("")).toBe("");
    expect(resolveUserPath("   ")).toBe("");
  });

  it("returns empty string for undefined/null input", () => {
    expect(resolveUserPath(undefined as unknown as string)).toBe("");
    expect(resolveUserPath(null as unknown as string)).toBe("");
  });
});
