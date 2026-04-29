import fs from "node:fs";
import path from "node:path";
import { resolveTheClawPackageRoot } from "../infra/theclaw-root.js";

export const THECLAW_DOCS_URL = "https://docs.theclaw.ai";
export const THECLAW_SOURCE_URL = "https://github.com/theclaw/theclaw";

type ResolveTheClawReferencePathParams = {
  workspaceDir?: string;
  argv1?: string;
  cwd?: string;
  moduleUrl?: string;
};

function isUsableDocsDir(docsDir: string): boolean {
  return fs.existsSync(path.join(docsDir, "docs.json"));
}

function isGitCheckout(rootDir: string): boolean {
  return fs.existsSync(path.join(rootDir, ".git"));
}

export async function resolveTheClawDocsPath(params: {
  workspaceDir?: string;
  argv1?: string;
  cwd?: string;
  moduleUrl?: string;
}): Promise<string | null> {
  const workspaceDir = params.workspaceDir?.trim();
  if (workspaceDir) {
    const workspaceDocs = path.join(workspaceDir, "docs");
    if (isUsableDocsDir(workspaceDocs)) {
      return workspaceDocs;
    }
  }

  const packageRoot = await resolveTheClawPackageRoot({
    cwd: params.cwd,
    argv1: params.argv1,
    moduleUrl: params.moduleUrl,
  });
  if (!packageRoot) {
    return null;
  }

  const packageDocs = path.join(packageRoot, "docs");
  return isUsableDocsDir(packageDocs) ? packageDocs : null;
}

export async function resolveTheClawSourcePath(
  params: ResolveTheClawReferencePathParams,
): Promise<string | null> {
  const packageRoot = await resolveTheClawPackageRoot({
    cwd: params.cwd,
    argv1: params.argv1,
    moduleUrl: params.moduleUrl,
  });
  if (!packageRoot || !isGitCheckout(packageRoot)) {
    return null;
  }
  return packageRoot;
}

export async function resolveTheClawReferencePaths(
  params: ResolveTheClawReferencePathParams,
): Promise<{
  docsPath: string | null;
  sourcePath: string | null;
}> {
  const [docsPath, sourcePath] = await Promise.all([
    resolveTheClawDocsPath(params),
    resolveTheClawSourcePath(params),
  ]);
  return { docsPath, sourcePath };
}
