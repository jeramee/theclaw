import { buildManifestModelProviderConfig } from "theclaw/plugin-sdk/provider-catalog-shared";
import type { ModelProviderConfig } from "theclaw/plugin-sdk/provider-model-shared";
import manifest from "./theclaw.plugin.json" with { type: "json" };

export function buildTogetherProvider(): ModelProviderConfig {
  return buildManifestModelProviderConfig({
    providerId: "together",
    catalog: manifest.modelCatalog.providers.together,
  });
}
