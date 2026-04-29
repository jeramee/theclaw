import { describe, expect, it } from "vitest";
import type { PluginManifestCommandAliasRegistry } from "../plugins/manifest-command-aliases.js";
import {
  rewriteUpdateFlagArgv,
  resolveMissingPluginCommandMessage,
  shouldEnsureCliPath,
  shouldStartCrestodianForBareRoot,
  shouldStartCrestodianForModernOnboard,
  shouldStartProxyForCli,
  shouldUseBrowserHelpFastPath,
  shouldUseRootHelpFastPath,
} from "./run-main-policy.js";
import { isGatewayRunFastPathArgv } from "./run-main.js";

const memoryWikiCommandAliasRegistry: PluginManifestCommandAliasRegistry = {
  plugins: [
    {
      id: "memory-wiki",
      commandAliases: [{ name: "wiki" }],
    },
  ],
};

const memoryCoreCommandAliasRegistry: PluginManifestCommandAliasRegistry = {
  plugins: [
    {
      id: "memory-core",
      commandAliases: [{ name: "dreaming", kind: "runtime-slash", cliCommand: "memory" }],
    },
  ],
};

describe("isGatewayRunFastPathArgv", () => {
  it("matches only plain gateway foreground starts without root options or help", () => {
    expect(isGatewayRunFastPathArgv(["node", "theclaw", "gateway"])).toBe(true);
    expect(isGatewayRunFastPathArgv(["node", "theclaw", "gateway", "--force"])).toBe(true);
    expect(isGatewayRunFastPathArgv(["node", "theclaw", "gateway", "--port", "18789"])).toBe(true);
    expect(isGatewayRunFastPathArgv(["node", "theclaw", "gateway", "--auth=none"])).toBe(true);
    expect(
      isGatewayRunFastPathArgv(["node", "theclaw", "--no-color", "gateway", "--bind", "loopback"]),
    ).toBe(true);
    expect(isGatewayRunFastPathArgv(["node", "theclaw", "gateway", "run"])).toBe(true);
    expect(
      isGatewayRunFastPathArgv(["node", "theclaw", "gateway", "run", "--raw-stream-path", "x"]),
    ).toBe(true);
    expect(isGatewayRunFastPathArgv(["node", "theclaw", "gateway", "call", "health"])).toBe(false);
    expect(isGatewayRunFastPathArgv(["node", "theclaw", "gateway", "--help"])).toBe(false);
    expect(isGatewayRunFastPathArgv(["node", "theclaw", "gateway", "--port"])).toBe(false);
    expect(isGatewayRunFastPathArgv(["node", "theclaw", "gateway", "--unknown"])).toBe(false);
  });
});

describe("rewriteUpdateFlagArgv", () => {
  it("leaves argv unchanged when --update is absent", () => {
    const argv = ["node", "entry.js", "status"];
    expect(rewriteUpdateFlagArgv(argv)).toBe(argv);
  });

  it("rewrites --update into the update command", () => {
    expect(rewriteUpdateFlagArgv(["node", "entry.js", "--update"])).toEqual([
      "node",
      "entry.js",
      "update",
    ]);
  });

  it("preserves global flags that appear before --update", () => {
    expect(rewriteUpdateFlagArgv(["node", "entry.js", "--profile", "p", "--update"])).toEqual([
      "node",
      "entry.js",
      "--profile",
      "p",
      "update",
    ]);
  });

  it("keeps update options after the rewritten command", () => {
    expect(rewriteUpdateFlagArgv(["node", "entry.js", "--update", "--json"])).toEqual([
      "node",
      "entry.js",
      "update",
      "--json",
    ]);
  });
});

describe("shouldEnsureCliPath", () => {
  it("skips path bootstrap for help/version invocations", () => {
    expect(shouldEnsureCliPath(["node", "theclaw", "--help"])).toBe(false);
    expect(shouldEnsureCliPath(["node", "theclaw", "-V"])).toBe(false);
    expect(shouldEnsureCliPath(["node", "theclaw", "-v"])).toBe(false);
  });

  it("skips path bootstrap for read-only fast paths", () => {
    expect(shouldEnsureCliPath(["node", "theclaw"])).toBe(false);
    expect(shouldEnsureCliPath(["node", "theclaw", "--profile", "work"])).toBe(false);
    expect(shouldEnsureCliPath(["node", "theclaw", "status"])).toBe(false);
    expect(shouldEnsureCliPath(["node", "theclaw", "--log-level", "debug", "status"])).toBe(false);
    expect(shouldEnsureCliPath(["node", "theclaw", "sessions", "--json"])).toBe(false);
    expect(shouldEnsureCliPath(["node", "theclaw", "config", "get", "update"])).toBe(false);
    expect(shouldEnsureCliPath(["node", "theclaw", "models", "status", "--json"])).toBe(false);
  });

  it("keeps path bootstrap for mutating or unknown commands", () => {
    expect(shouldEnsureCliPath(["node", "theclaw", "message", "send"])).toBe(true);
    expect(shouldEnsureCliPath(["node", "theclaw", "voicecall", "status"])).toBe(true);
    expect(shouldEnsureCliPath(["node", "theclaw", "acp", "-v"])).toBe(true);
  });
});

describe("shouldStartCrestodianForBareRoot", () => {
  it("starts Crestodian for bare root invocations", () => {
    expect(shouldStartCrestodianForBareRoot(["node", "theclaw"])).toBe(true);
    expect(shouldStartCrestodianForBareRoot(["node", "theclaw", "--profile", "work"])).toBe(true);
    expect(shouldStartCrestodianForBareRoot(["node", "theclaw", "--dev"])).toBe(true);
  });

  it("does not start Crestodian for help, version, or commands", () => {
    expect(shouldStartCrestodianForBareRoot(["node", "theclaw", "--help"])).toBe(false);
    expect(shouldStartCrestodianForBareRoot(["node", "theclaw", "-V"])).toBe(false);
    expect(shouldStartCrestodianForBareRoot(["node", "theclaw", "status"])).toBe(false);
  });
});

describe("shouldStartCrestodianForModernOnboard", () => {
  it("starts Crestodian before heavy command registration for modern onboard", () => {
    expect(
      shouldStartCrestodianForModernOnboard([
        "node",
        "theclaw",
        "onboard",
        "--modern",
        "--non-interactive",
        "--json",
      ]),
    ).toBe(true);
  });

  it("keeps classic onboard and help on the normal command path", () => {
    expect(shouldStartCrestodianForModernOnboard(["node", "theclaw", "onboard"])).toBe(false);
    expect(
      shouldStartCrestodianForModernOnboard(["node", "theclaw", "onboard", "--modern", "--help"]),
    ).toBe(false);
  });
});

describe("shouldStartProxyForCli", () => {
  it("starts managed proxy routing for the --update shorthand", () => {
    expect(shouldStartProxyForCli(["node", "theclaw", "--update"])).toBe(true);
    expect(shouldStartProxyForCli(["node", "theclaw", "--profile", "p", "--update"])).toBe(true);
  });
});

describe("shouldUseRootHelpFastPath", () => {
  it("uses the fast path for root help only", () => {
    expect(shouldUseRootHelpFastPath(["node", "theclaw", "--help"])).toBe(true);
    expect(shouldUseRootHelpFastPath(["node", "theclaw", "--profile", "work", "-h"])).toBe(true);
    expect(shouldUseRootHelpFastPath(["node", "theclaw", "help", "--help"])).toBe(true);
    expect(shouldUseRootHelpFastPath(["node", "theclaw", "status", "--help"])).toBe(false);
    expect(shouldUseRootHelpFastPath(["node", "theclaw", "--help", "status"])).toBe(false);
    expect(shouldUseRootHelpFastPath(["node", "theclaw", "help", "gateway"])).toBe(false);
  });
});

describe("shouldUseBrowserHelpFastPath", () => {
  it("uses the fast path for browser command help only", () => {
    expect(shouldUseBrowserHelpFastPath(["node", "theclaw", "browser", "--help"])).toBe(true);
    expect(shouldUseBrowserHelpFastPath(["node", "theclaw", "browser", "-h"])).toBe(true);
    expect(
      shouldUseBrowserHelpFastPath(["node", "theclaw", "--profile", "work", "browser", "-h"]),
    ).toBe(true);
    expect(shouldUseBrowserHelpFastPath(["node", "theclaw", "browser", "status", "--help"])).toBe(
      false,
    );
    expect(shouldUseBrowserHelpFastPath(["node", "theclaw", "status", "--help"])).toBe(false);
  });
});

describe("resolveMissingPluginCommandMessage", () => {
  it("explains plugins.allow misses for a bundled plugin command", () => {
    expect(
      resolveMissingPluginCommandMessage("browser", {
        plugins: {
          allow: ["quietchat"],
        },
      }),
    ).toContain('`plugins.allow` excludes "browser"');
  });

  it("explains explicit bundled plugin disablement", () => {
    expect(
      resolveMissingPluginCommandMessage("browser", {
        plugins: {
          entries: {
            browser: {
              enabled: false,
            },
          },
        },
      }),
    ).toContain("plugins.entries.browser.enabled=false");
  });

  it("returns null when the bundled plugin command is already allowed", () => {
    expect(
      resolveMissingPluginCommandMessage("browser", {
        plugins: {
          allow: ["browser"],
        },
      }),
    ).toBeNull();
  });

  it("explains that dreaming is a runtime slash command, not a CLI command", () => {
    const message = resolveMissingPluginCommandMessage(
      "dreaming",
      {},
      {
        registry: memoryCoreCommandAliasRegistry,
      },
    );
    expect(message).toContain("runtime slash command");
    expect(message).toContain("/dreaming");
    expect(message).toContain("memory-core");
    expect(message).toContain("theclaw memory");
  });

  it("returns the runtime command message even when plugins.allow is set", () => {
    const message = resolveMissingPluginCommandMessage(
      "dreaming",
      {
        plugins: {
          allow: ["memory-core"],
        },
      },
      {
        registry: memoryCoreCommandAliasRegistry,
      },
    );
    expect(message).toContain("runtime slash command");
    expect(message).not.toContain("plugins.allow");
  });

  it("points command names in plugins.allow at their parent plugin", () => {
    const message = resolveMissingPluginCommandMessage(
      "dreaming",
      {
        plugins: {
          allow: ["dreaming"],
        },
      },
      {
        registry: memoryCoreCommandAliasRegistry,
      },
    );
    expect(message).toContain('"dreaming" is not a plugin');
    expect(message).toContain('"memory-core"');
    expect(message).toContain("plugins.allow");
  });

  it("explains parent plugin disablement for runtime command aliases", () => {
    const message = resolveMissingPluginCommandMessage(
      "dreaming",
      {
        plugins: {
          entries: {
            "memory-core": {
              enabled: false,
            },
          },
        },
      },
      {
        registry: memoryCoreCommandAliasRegistry,
      },
    );
    expect(message).toContain("plugins.entries.memory-core.enabled=false");
    expect(message).not.toContain("runtime slash command");
  });

  it("allows CLI commands when their parent plugin is in plugins.allow", () => {
    const message = resolveMissingPluginCommandMessage(
      "wiki",
      {
        plugins: {
          allow: ["memory-wiki"],
        },
      },
      { registry: memoryWikiCommandAliasRegistry },
    );
    expect(message).toBeNull();
  });

  it("blocks CLI commands when parent plugin is NOT in plugins.allow", () => {
    const message = resolveMissingPluginCommandMessage(
      "wiki",
      {
        plugins: {
          allow: ["quietchat"],
        },
      },
      { registry: memoryWikiCommandAliasRegistry },
    );
    expect(message).not.toBeNull();
    expect(message).toContain('"memory-wiki"');
    expect(message).toContain("plugins.allow");
  });
});
