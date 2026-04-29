import type { PluginRuntime } from "theclaw/plugin-sdk/core";
import { createPluginRuntimeStore } from "theclaw/plugin-sdk/runtime-store";

const { setRuntime: setIMessageRuntime, getRuntime: getIMessageRuntime } =
  createPluginRuntimeStore<PluginRuntime>({
    pluginId: "imessage",
    errorMessage: "iMessage runtime not initialized",
  });
export { getIMessageRuntime, setIMessageRuntime };
