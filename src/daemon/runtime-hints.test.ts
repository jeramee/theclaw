import { describe, expect, it } from "vitest";
import { buildPlatformRuntimeLogHints, buildPlatformServiceStartHints } from "./runtime-hints.js";

describe("buildPlatformRuntimeLogHints", () => {
  it("renders launchd log hints on darwin", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        env: {
          THECLAW_STATE_DIR: "/tmp/theclaw-state",
          THECLAW_LOG_PREFIX: "gateway",
        },
        systemdServiceName: "theclaw-gateway",
        windowsTaskName: "TheClaw Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /tmp/theclaw-state/logs/gateway.log",
      "Launchd stderr (if installed): /tmp/theclaw-state/logs/gateway.err.log",
      "Restart attempts: /tmp/theclaw-state/logs/gateway-restart.log",
    ]);
  });

  it("renders systemd and windows hints by platform", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "linux",
        env: {
          THECLAW_STATE_DIR: "/tmp/theclaw-state",
        },
        systemdServiceName: "theclaw-gateway",
        windowsTaskName: "TheClaw Gateway",
      }),
    ).toEqual([
      "Logs: journalctl --user -u theclaw-gateway.service -n 200 --no-pager",
      "Restart attempts: /tmp/theclaw-state/logs/gateway-restart.log",
    ]);
    expect(
      buildPlatformRuntimeLogHints({
        platform: "win32",
        env: {
          THECLAW_STATE_DIR: "/tmp/theclaw-state",
        },
        systemdServiceName: "theclaw-gateway",
        windowsTaskName: "TheClaw Gateway",
      }),
    ).toEqual([
      'Logs: schtasks /Query /TN "TheClaw Gateway" /V /FO LIST',
      "Restart attempts: /tmp/theclaw-state/logs/gateway-restart.log",
    ]);
  });
});

describe("buildPlatformServiceStartHints", () => {
  it("builds platform-specific service start hints", () => {
    expect(
      buildPlatformServiceStartHints({
        platform: "darwin",
        installCommand: "theclaw gateway install",
        startCommand: "theclaw gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.theclaw.gateway.plist",
        systemdServiceName: "theclaw-gateway",
        windowsTaskName: "TheClaw Gateway",
      }),
    ).toEqual([
      "theclaw gateway install",
      "theclaw gateway",
      "launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.theclaw.gateway.plist",
    ]);
    expect(
      buildPlatformServiceStartHints({
        platform: "linux",
        installCommand: "theclaw gateway install",
        startCommand: "theclaw gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.theclaw.gateway.plist",
        systemdServiceName: "theclaw-gateway",
        windowsTaskName: "TheClaw Gateway",
      }),
    ).toEqual([
      "theclaw gateway install",
      "theclaw gateway",
      "systemctl --user start theclaw-gateway.service",
    ]);
  });
});
