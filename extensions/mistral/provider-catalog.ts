import { buildManifestModelProviderConfig } from "theclaw/plugin-sdk/provider-catalog-shared";
import type { ModelProviderConfig } from "theclaw/plugin-sdk/provider-model-shared";
import manifest from "./theclaw.plugin.json" with { type: "json" };

export function buildMistralProvider(): ModelProviderConfig {
  return buildManifestModelProviderConfig({
    providerId: "mistral",
    catalog: manifest.modelCatalog.providers.mistral,
  });
}
