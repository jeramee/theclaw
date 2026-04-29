import type { MarkdownTableMode } from "./types.base.js";
import type { TheClawConfig } from "./types.theclaw.js";

export type ResolveMarkdownTableModeParams = {
  cfg?: Partial<TheClawConfig>;
  channel?: string | null;
  accountId?: string | null;
};

export type ResolveMarkdownTableMode = (
  params: ResolveMarkdownTableModeParams,
) => MarkdownTableMode;
