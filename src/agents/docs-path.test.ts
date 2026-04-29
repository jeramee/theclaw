import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  resolveTheClawDocsPath,
  resolveTheClawReferencePaths,
  resolveTheClawSourcePath,
} from "./docs-path.js";

async function makePackageRoot(prefix: string): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  await fs.writeFile(path.join(root, "package.json"), '{"name":"theclaw"}\n');
  return root;
}

async function writeDocsJson(root: string): Promise<void> {
  await fs.mkdir(path.join(root, "docs"), { recursive: true });
  await fs.writeFile(path.join(root, "docs", "docs.json"), "{}\n");
}

describe("resolveTheClawDocsPath", () => {
  it("uses the workspace docs directory when it has canonical docs metadata", async () => {
    const root = await makePackageRoot("theclaw-docs-workspace-");
    await writeDocsJson(root);

    await expect(resolveTheClawDocsPath({ workspaceDir: root })).resolves.toBe(
      path.join(root, "docs"),
    );
  });

  it("finds bundled package docs from a nested package path", async () => {
    const root = await makePackageRoot("theclaw-docs-package-");
    await writeDocsJson(root);
    const nested = path.join(root, "dist", "agents");
    await fs.mkdir(nested, { recursive: true });

    await expect(resolveTheClawDocsPath({ cwd: nested })).resolves.toBe(path.join(root, "docs"));
  });

  it("does not accept incomplete template-only docs directories", async () => {
    const root = await makePackageRoot("theclaw-docs-incomplete-");
    await fs.mkdir(path.join(root, "docs", "reference", "templates"), { recursive: true });

    await expect(resolveTheClawDocsPath({ cwd: root })).resolves.toBeNull();
  });
});

describe("resolveTheClawSourcePath", () => {
  it("returns the package root only for git checkouts", async () => {
    const root = await makePackageRoot("theclaw-source-git-");
    await fs.mkdir(path.join(root, ".git"));

    await expect(resolveTheClawSourcePath({ cwd: root })).resolves.toBe(root);
  });

  it("omits source path for npm-style package installs", async () => {
    const root = await makePackageRoot("theclaw-source-npm-");

    await expect(resolveTheClawSourcePath({ cwd: root })).resolves.toBeNull();
  });
});

describe("resolveTheClawReferencePaths", () => {
  it("returns docs and local source together for git checkouts", async () => {
    const root = await makePackageRoot("theclaw-reference-git-");
    await writeDocsJson(root);
    await fs.mkdir(path.join(root, ".git"));

    await expect(resolveTheClawReferencePaths({ cwd: root })).resolves.toEqual({
      docsPath: path.join(root, "docs"),
      sourcePath: root,
    });
  });
});
