import { describe, expect, it } from "vitest";
import {
  parseArgs,
  validateTheClawPackageSpec,
} from "../../scripts/resolve-theclaw-package-candidate.mjs";

describe("resolve-theclaw-package-candidate", () => {
  it("accepts only TheClaw release package specs for npm candidates", () => {
    expect(() => validateTheClawPackageSpec("theclaw@beta")).not.toThrow();
    expect(() => validateTheClawPackageSpec("theclaw@latest")).not.toThrow();
    expect(() => validateTheClawPackageSpec("theclaw@2026.4.27")).not.toThrow();
    expect(() => validateTheClawPackageSpec("theclaw@2026.4.27-1")).not.toThrow();
    expect(() => validateTheClawPackageSpec("theclaw@2026.4.27-beta.2")).not.toThrow();

    expect(() => validateTheClawPackageSpec("@evil/theclaw@1.0.0")).toThrow(
      "package_spec must be theclaw@beta",
    );
    expect(() => validateTheClawPackageSpec("theclaw@canary")).toThrow(
      "package_spec must be theclaw@beta",
    );
    expect(() => validateTheClawPackageSpec("theclaw@2026.04.27")).toThrow(
      "package_spec must be theclaw@beta",
    );
  });

  it("parses optional empty workflow inputs without rejecting the command line", () => {
    expect(
      parseArgs([
        "--source",
        "npm",
        "--package-ref",
        "release/2026.4.27",
        "--package-spec",
        "theclaw@beta",
        "--package-url",
        "",
        "--package-sha256",
        "",
        "--artifact-dir",
        ".",
        "--output-dir",
        ".artifacts/docker-e2e-package",
      ]),
    ).toMatchObject({
      artifactDir: ".",
      outputDir: ".artifacts/docker-e2e-package",
      packageSha256: "",
      packageRef: "release/2026.4.27",
      packageSpec: "theclaw@beta",
      packageUrl: "",
      source: "npm",
    });
  });
});
