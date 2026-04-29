import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { syncPluginVersions } from "../../scripts/sync-plugin-versions.js";
import { cleanupTempDirs, makeTempDir } from "../../test/helpers/temp-dir.js";

const tempDirs: string[] = [];

function writeJson(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

describe("syncPluginVersions", () => {
  afterEach(() => {
    cleanupTempDirs(tempDirs);
  });

  it("preserves workspace theclaw devDependencies and plugin host floors", () => {
    const rootDir = makeTempDir(tempDirs, "theclaw-sync-plugin-versions-");

    writeJson(path.join(rootDir, "package.json"), {
      name: "theclaw",
      version: "2026.4.1",
    });
    writeJson(path.join(rootDir, "extensions/bluebubbles/package.json"), {
      name: "@theclaw/bluebubbles",
      version: "2026.3.30",
      devDependencies: {
        theclaw: "workspace:*",
      },
      peerDependencies: {
        theclaw: ">=2026.3.30",
      },
      theclaw: {
        install: {
          minHostVersion: ">=2026.3.30",
        },
        compat: {
          pluginApi: ">=2026.3.30",
        },
        build: {
          theclawVersion: "2026.3.30",
        },
      },
    });

    const summary = syncPluginVersions(rootDir);
    const updatedPackage = JSON.parse(
      fs.readFileSync(path.join(rootDir, "extensions/bluebubbles/package.json"), "utf8"),
    ) as {
      version?: string;
      devDependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
      theclaw?: {
        install?: {
          minHostVersion?: string;
        };
        compat?: {
          pluginApi?: string;
        };
        build?: {
          theclawVersion?: string;
        };
      };
    };

    expect(summary.updated).toContain("@theclaw/bluebubbles");
    expect(updatedPackage.version).toBe("2026.4.1");
    expect(updatedPackage.devDependencies?.theclaw).toBe("workspace:*");
    expect(updatedPackage.peerDependencies?.theclaw).toBe(">=2026.4.1");
    expect(updatedPackage.theclaw?.install?.minHostVersion).toBe(">=2026.3.30");
    expect(updatedPackage.theclaw?.compat?.pluginApi).toBe(">=2026.4.1");
    expect(updatedPackage.theclaw?.build?.theclawVersion).toBe("2026.4.1");
  });
});
