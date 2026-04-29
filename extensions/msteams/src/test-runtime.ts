import os from "node:os";
import path from "node:path";
import type { PluginRuntime } from "../runtime-api.js";

export const msteamsRuntimeStub = {
  state: {
    resolveStateDir: (env: NodeJS.ProcessEnv = process.env, homedir?: () => string) => {
      const override = env.THECLAW_STATE_DIR?.trim() || env.THECLAW_STATE_DIR?.trim();
      if (override) {
        return override;
      }
      const resolvedHome = homedir ? homedir() : os.homedir();
      return path.join(resolvedHome, ".theclaw");
    },
  },
} as unknown as PluginRuntime;
