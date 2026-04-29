import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { cleanupTempDirs, makeTempDir } from "../test/helpers/temp-dir.js";
import {
  buildTheClawCompileCacheRespawnPlan,
  isSourceCheckoutInstallRoot,
  resolveEntryInstallRoot,
  shouldEnableTheClawCompileCache,
} from "./entry.compile-cache.js";

describe("entry compile cache", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    cleanupTempDirs(tempDirs);
  });

  it("resolves install roots from source and dist entry paths", () => {
    expect(resolveEntryInstallRoot("/repo/theclaw/src/entry.ts")).toBe("/repo/theclaw");
    expect(resolveEntryInstallRoot("/repo/theclaw/dist/entry.js")).toBe("/repo/theclaw");
    expect(resolveEntryInstallRoot("/pkg/theclaw/entry.js")).toBe("/pkg/theclaw");
  });

  it("treats git and source entry markers as source checkouts", async () => {
    const root = makeTempDir(tempDirs, "theclaw-compile-cache-source-");
    await fs.writeFile(path.join(root, ".git"), "gitdir: .git/worktrees/theclaw\n", "utf8");

    expect(isSourceCheckoutInstallRoot(root)).toBe(true);
  });

  it("disables compile cache for source-checkout installs", async () => {
    const root = makeTempDir(tempDirs, "theclaw-compile-cache-src-entry-");
    await fs.mkdir(path.join(root, "src"), { recursive: true });
    await fs.writeFile(path.join(root, "src", "entry.ts"), "export {};\n", "utf8");

    expect(
      shouldEnableTheClawCompileCache({
        env: {},
        installRoot: root,
      }),
    ).toBe(false);
  });

  it("keeps compile cache enabled for packaged installs unless disabled by env", () => {
    const root = makeTempDir(tempDirs, "theclaw-compile-cache-package-");

    expect(shouldEnableTheClawCompileCache({ env: {}, installRoot: root })).toBe(true);
    expect(
      shouldEnableTheClawCompileCache({
        env: { NODE_DISABLE_COMPILE_CACHE: "1" },
        installRoot: root,
      }),
    ).toBe(false);
  });

  it("builds a one-shot no-cache respawn plan when source checkout inherits NODE_COMPILE_CACHE", async () => {
    const root = makeTempDir(tempDirs, "theclaw-compile-cache-respawn-");
    await fs.mkdir(path.join(root, "src"), { recursive: true });
    await fs.writeFile(path.join(root, "src", "entry.ts"), "export {};\n", "utf8");

    const plan = buildTheClawCompileCacheRespawnPlan({
      currentFile: path.join(root, "dist", "entry.js"),
      env: { NODE_COMPILE_CACHE: "/tmp/theclaw-cache" },
      execArgv: ["--no-warnings"],
      execPath: "/usr/bin/node",
      installRoot: root,
      argv: ["/usr/bin/node", path.join(root, "dist", "entry.js"), "status", "--json"],
    });

    expect(plan).toEqual({
      command: "/usr/bin/node",
      args: ["--no-warnings", path.join(root, "dist", "entry.js"), "status", "--json"],
      env: {
        NODE_DISABLE_COMPILE_CACHE: "1",
        THECLAW_SOURCE_COMPILE_CACHE_RESPAWNED: "1",
      },
    });
  });

  it("does not respawn packaged installs when NODE_COMPILE_CACHE is configured", () => {
    const root = makeTempDir(tempDirs, "theclaw-compile-cache-package-respawn-");

    expect(
      buildTheClawCompileCacheRespawnPlan({
        currentFile: path.join(root, "dist", "entry.js"),
        env: { NODE_COMPILE_CACHE: "/tmp/theclaw-cache" },
        installRoot: root,
      }),
    ).toBeUndefined();
  });

  it("does not respawn source checkouts twice", async () => {
    const root = makeTempDir(tempDirs, "theclaw-compile-cache-respawn-once-");
    await fs.mkdir(path.join(root, "src"), { recursive: true });
    await fs.writeFile(path.join(root, "src", "entry.ts"), "export {};\n", "utf8");

    expect(
      buildTheClawCompileCacheRespawnPlan({
        currentFile: path.join(root, "dist", "entry.js"),
        env: {
          NODE_COMPILE_CACHE: "/tmp/theclaw-cache",
          THECLAW_SOURCE_COMPILE_CACHE_RESPAWNED: "1",
        },
        installRoot: root,
      }),
    ).toBeUndefined();
  });
});
