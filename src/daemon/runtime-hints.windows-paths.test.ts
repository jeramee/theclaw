import { beforeAll, describe, expect, it, vi } from "vitest";

const resolveGatewayLogPathsMock = vi.fn(() => ({
  logDir: "C:\\tmp\\theclaw-state\\logs",
  stdoutPath: "C:\\tmp\\theclaw-state\\logs\\gateway.log",
  stderrPath: "C:\\tmp\\theclaw-state\\logs\\gateway.err.log",
}));
const resolveGatewayRestartLogPathMock = vi.fn(
  () => "C:\\tmp\\theclaw-state\\logs\\gateway-restart.log",
);

vi.mock("./restart-logs.js", () => ({
  resolveGatewayLogPaths: resolveGatewayLogPathsMock,
  resolveGatewayRestartLogPath: resolveGatewayRestartLogPathMock,
}));

let buildPlatformRuntimeLogHints: typeof import("./runtime-hints.js").buildPlatformRuntimeLogHints;

describe("buildPlatformRuntimeLogHints", () => {
  beforeAll(async () => {
    ({ buildPlatformRuntimeLogHints } = await import("./runtime-hints.js"));
  });

  it("strips windows drive prefixes from darwin display paths", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        systemdServiceName: "theclaw-gateway",
        windowsTaskName: "TheClaw Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /tmp/theclaw-state/logs/gateway.log",
      "Launchd stderr (if installed): /tmp/theclaw-state/logs/gateway.err.log",
      "Restart attempts: /tmp/theclaw-state/logs/gateway-restart.log",
    ]);
  });
});
