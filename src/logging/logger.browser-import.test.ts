import { importFreshModule } from "theclaw/plugin-sdk/test-fixtures";
import { afterEach, describe, expect, it, vi } from "vitest";

type LoggerModule = typeof import("./logger.js");

const originalGetBuiltinModule = (
  process as NodeJS.Process & { getBuiltinModule?: (id: string) => unknown }
).getBuiltinModule;

async function importBrowserSafeLogger(params?: {
  resolvePreferredTheClawTmpDir?: ReturnType<typeof vi.fn>;
}): Promise<{
  module: LoggerModule;
  resolvePreferredTheClawTmpDir: ReturnType<typeof vi.fn>;
}> {
  const resolvePreferredTheClawTmpDir =
    params?.resolvePreferredTheClawTmpDir ??
    vi.fn(() => {
      throw new Error("resolvePreferredTheClawTmpDir should not run during browser-safe import");
    });

  vi.doMock("../infra/tmp-theclaw-dir.js", async () => {
    const actual = await vi.importActual<typeof import("../infra/tmp-theclaw-dir.js")>(
      "../infra/tmp-theclaw-dir.js",
    );
    return {
      ...actual,
      resolvePreferredTheClawTmpDir,
    };
  });

  Object.defineProperty(process, "getBuiltinModule", {
    configurable: true,
    value: undefined,
  });

  const module = await importFreshModule<LoggerModule>(
    import.meta.url,
    "./logger.js?scope=browser-safe",
  );
  return { module, resolvePreferredTheClawTmpDir };
}

describe("logging/logger browser-safe import", () => {
  afterEach(() => {
    vi.doUnmock("../infra/tmp-theclaw-dir.js");
    Object.defineProperty(process, "getBuiltinModule", {
      configurable: true,
      value: originalGetBuiltinModule,
    });
  });

  it("does not resolve the preferred temp dir at import time when node fs is unavailable", async () => {
    const { module, resolvePreferredTheClawTmpDir } = await importBrowserSafeLogger();

    expect(resolvePreferredTheClawTmpDir).not.toHaveBeenCalled();
    expect(module.DEFAULT_LOG_DIR).toBe("/tmp/theclaw");
    expect(module.DEFAULT_LOG_FILE).toBe("/tmp/theclaw/theclaw.log");
  });

  it("disables file logging when imported in a browser-like environment", async () => {
    const { module, resolvePreferredTheClawTmpDir } = await importBrowserSafeLogger();

    expect(module.getResolvedLoggerSettings()).toMatchObject({
      level: "silent",
      file: "/tmp/theclaw/theclaw.log",
    });
    expect(module.isFileLogLevelEnabled("info")).toBe(false);
    expect(() => module.getLogger().info("browser-safe")).not.toThrow();
    expect(resolvePreferredTheClawTmpDir).not.toHaveBeenCalled();
  });
});
