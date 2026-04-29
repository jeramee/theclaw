import { buildManifestModelProviderConfig } from "theclaw/plugin-sdk/provider-catalog-shared";
import type { ModelProviderConfig } from "theclaw/plugin-sdk/provider-model-shared";
import manifest from "./theclaw.plugin.json" with { type: "json" };

export function buildNvidiaProvider(): ModelProviderConfig {
  return {
    ...buildManifestModelProviderConfig({
      providerId: "nvidia",
      catalog: manifest.modelCatalog.providers.nvidia,
    }),
    apiKey: "NVIDIA_API_KEY",
  };
}
