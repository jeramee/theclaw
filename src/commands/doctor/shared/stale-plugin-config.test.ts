import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TheClawConfig } from "../../../config/config.js";
import type { PluginInstallRecord } from "../../../config/types.plugins.js";
import type { PluginManifestRecord } from "../../../plugins/manifest-registry.js";
import * as manifestRegistry from "../../../plugins/manifest-registry.js";
import {
  collectStalePluginConfigWarnings,
  maybeRepairStalePluginConfig,
  scanStalePluginConfig,
} from "./stale-plugin-config.js";

const installedPluginIndexMocks = vi.hoisted(() => ({
  loadInstalledPluginIndexInstallRecordsSync: vi.fn<() => Record<string, PluginInstallRecord>>(
    () => ({}),
  ),
}));

vi.mock("../../../plugins/installed-plugin-index-records.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../plugins/installed-plugin-index-records.js")>()),
  loadInstalledPluginIndexInstallRecordsSync:
    installedPluginIndexMocks.loadInstalledPluginIndexInstallRecordsSync,
}));

function manifest(id: string): PluginManifestRecord {
  return {
    id,
    channels: [],
    providers: [],
    cliBackends: [],
    skills: [],
    hooks: [],
    origin: "bundled",
    rootDir: `/plugins/${id}`,
    source: `/plugins/${id}`,
    manifestPath: `/plugins/${id}/theclaw.plugin.json`,
  };
}

describe("doctor stale plugin config helpers", () => {
  beforeEach(() => {
    installedPluginIndexMocks.loadInstalledPluginIndexInstallRecordsSync.mockReset();
    installedPluginIndexMocks.loadInstalledPluginIndexInstallRecordsSync.mockReturnValue({});
    vi.spyOn(manifestRegistry, "loadPluginManifestRegistry").mockReturnValue({
      plugins: [manifest("discord"), manifest("voice-call"), manifest("openai")],
      diagnostics: [],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("finds stale plugins.allow and plugins.entries refs", () => {
    const hits = scanStalePluginConfig({
      plugins: {
        allow: ["discord", "acpx"],
        entries: {
          "voice-call": { enabled: true },
          acpx: { enabled: true },
        },
      },
    } as TheClawConfig);

    expect(hits).toEqual([
      {
        pluginId: "acpx",
        pathLabel: "plugins.allow",
        surface: "allow",
      },
      {
        pluginId: "acpx",
        pathLabel: "plugins.entries.acpx",
        surface: "entries",
      },
    ]);
  });

  it("removes stale plugin ids from allow and entries without changing valid refs", () => {
    const result = maybeRepairStalePluginConfig({
      plugins: {
        allow: ["discord", "acpx", "voice-call"],
        entries: {
          "voice-call": { enabled: true },
          acpx: { enabled: true },
        },
      },
    } as TheClawConfig);

    expect(result.changes).toEqual([
      "- plugins.allow: removed 1 stale plugin id (acpx)",
      "- plugins.entries: removed 1 stale plugin entry (acpx)",
    ]);
    expect(result.config.plugins?.allow).toEqual(["discord", "voice-call"]);
    expect(result.config.plugins?.entries).toEqual({
      "voice-call": { enabled: true },
    });
  });

  it("formats stale plugin warnings with a doctor hint", () => {
    const warnings = collectStalePluginConfigWarnings({
      hits: [
        {
          pluginId: "acpx",
          pathLabel: "plugins.allow",
          surface: "allow",
        },
      ],
      doctorFixCommand: "theclaw doctor --fix",
    });

    expect(warnings).toEqual([
      expect.stringContaining('plugins.allow: stale plugin reference "acpx"'),
      expect.stringContaining('Run "theclaw doctor --fix"'),
    ]);
  });

  it("removes stale third-party channel config and dependent channel refs", () => {
    const result = maybeRepairStalePluginConfig({
      plugins: {
        allow: ["discord", "theclaw-weixin"],
        entries: {
          discord: { enabled: true },
          "theclaw-weixin": { enabled: true },
        },
      },
      channels: {
        "theclaw-weixin": {
          enabled: true,
          token: "stale",
        },
        telegram: {
          botToken: "keep",
        },
        modelByChannel: {
          openai: {
            "theclaw-weixin": "openai/gpt-5.4",
            telegram: "openai/gpt-5.4",
          },
        },
      },
      agents: {
        defaults: {
          heartbeat: {
            target: "theclaw-weixin",
            every: "30m",
          },
        },
        list: [
          {
            id: "pi",
            heartbeat: {
              target: "theclaw-weixin",
            },
          },
          {
            id: "ops",
            heartbeat: {
              target: "telegram",
            },
          },
        ],
      },
    } as TheClawConfig);

    expect(result.changes).toEqual([
      "- plugins.allow: removed 1 stale plugin id (theclaw-weixin)",
      "- plugins.entries: removed 1 stale plugin entry (theclaw-weixin)",
      "- channels: removed 1 stale channel config (theclaw-weixin)",
      "- agents heartbeat: removed 2 stale heartbeat targets (theclaw-weixin)",
      "- channels.modelByChannel: removed 1 stale channel model override (theclaw-weixin)",
    ]);
    expect(result.config.plugins?.allow).toEqual(["discord"]);
    expect(result.config.plugins?.entries).toEqual({
      discord: { enabled: true },
    });
    expect(result.config.channels?.["theclaw-weixin"]).toBeUndefined();
    expect(result.config.channels?.telegram).toEqual({ botToken: "keep" });
    expect(result.config.channels?.modelByChannel).toEqual({
      openai: {
        telegram: "openai/gpt-5.4",
      },
    });
    expect(result.config.agents?.defaults?.heartbeat).toEqual({ every: "30m" });
    expect(result.config.agents?.list?.[0]?.heartbeat).toEqual({});
    expect(result.config.agents?.list?.[1]?.heartbeat).toEqual({ target: "telegram" });
  });

  it("does not remove unknown channel config without stale plugin evidence", () => {
    const cfg = {
      channels: {
        telegrm: {
          botToken: "typo",
        },
      },
    } as TheClawConfig;

    expect(scanStalePluginConfig(cfg)).toEqual([]);
    expect(maybeRepairStalePluginConfig(cfg)).toEqual({ config: cfg, changes: [] });
  });

  it("treats stale plugin refs as inert while plugins are globally disabled", () => {
    const cfg = {
      plugins: {
        enabled: false,
        allow: ["acpx"],
        entries: {
          acpx: { enabled: true },
        },
      },
      channels: {
        "theclaw-weixin": {
          enabled: true,
        },
      },
    } as TheClawConfig;

    expect(scanStalePluginConfig(cfg)).toEqual([]);
    expect(maybeRepairStalePluginConfig(cfg)).toEqual({ config: cfg, changes: [] });
    expect(manifestRegistry.loadPluginManifestRegistry).not.toHaveBeenCalled();
  });

  it("uses missing persisted install records as stale channel evidence", () => {
    installedPluginIndexMocks.loadInstalledPluginIndexInstallRecordsSync.mockReturnValue({
      "theclaw-weixin": {
        source: "npm",
        resolvedName: "@tencent-weixin/theclaw-weixin",
        installedAt: "2026-04-12T00:00:00.000Z",
      },
    });

    const result = maybeRepairStalePluginConfig({
      channels: {
        "theclaw-weixin": {
          enabled: true,
        },
      },
    } as TheClawConfig);

    expect(result.changes).toEqual([
      "- channels: removed 1 stale channel config (theclaw-weixin)",
    ]);
    expect(result.config.channels?.["theclaw-weixin"]).toBeUndefined();
  });

  it("does not auto-repair stale refs while plugin discovery has errors", () => {
    vi.spyOn(manifestRegistry, "loadPluginManifestRegistry").mockReturnValue({
      plugins: [],
      diagnostics: [
        { level: "error", message: "plugin path not found: /missing", source: "/missing" },
      ],
    });

    const cfg = {
      plugins: {
        allow: ["acpx"],
        entries: {
          acpx: { enabled: true },
        },
      },
    } as TheClawConfig;

    const hits = scanStalePluginConfig(cfg);
    expect(hits).toEqual([
      {
        pluginId: "acpx",
        pathLabel: "plugins.allow",
        surface: "allow",
      },
      {
        pluginId: "acpx",
        pathLabel: "plugins.entries.acpx",
        surface: "entries",
      },
    ]);

    const result = maybeRepairStalePluginConfig(cfg);
    expect(result.changes).toEqual([]);
    expect(result.config).toEqual(cfg);

    const warnings = collectStalePluginConfigWarnings({
      hits,
      doctorFixCommand: "theclaw doctor --fix",
      autoRepairBlocked: true,
    });
    expect(warnings[2]).toContain("Auto-removal is paused");
  });

  it("treats legacy plugin aliases as valid ids during scan and repair", () => {
    const cfg = {
      plugins: {
        allow: ["openai-codex", "acpx"],
        entries: {
          "openai-codex": { enabled: true },
          acpx: { enabled: true },
        },
      },
    } as TheClawConfig;

    expect(scanStalePluginConfig(cfg)).toEqual([
      {
        pluginId: "acpx",
        pathLabel: "plugins.allow",
        surface: "allow",
      },
      {
        pluginId: "acpx",
        pathLabel: "plugins.entries.acpx",
        surface: "entries",
      },
    ]);

    const result = maybeRepairStalePluginConfig(cfg);
    expect(result.config.plugins?.allow).toEqual(["openai-codex"]);
    expect(result.config.plugins?.entries).toEqual({
      "openai-codex": { enabled: true },
    });
  });
});
