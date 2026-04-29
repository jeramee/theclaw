import type { TheClawConfig } from "../../config/types.js";

export type DirectoryConfigParams = {
  cfg: TheClawConfig;
  accountId?: string | null;
  query?: string | null;
  limit?: number | null;
};
