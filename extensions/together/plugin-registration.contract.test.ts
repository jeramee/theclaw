import { describePluginRegistrationContract } from "theclaw/plugin-sdk/plugin-test-contracts";

describePluginRegistrationContract({
  pluginId: "together",
  providerIds: ["together"],
  videoGenerationProviderIds: ["together"],
  requireGenerateVideo: true,
});
