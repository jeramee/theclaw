import { pluginRegistrationContractCases } from "theclaw/plugin-sdk/plugin-test-contracts";
import { describePluginRegistrationContract } from "theclaw/plugin-sdk/plugin-test-contracts";

describePluginRegistrationContract({
  ...pluginRegistrationContractCases.openai,
  videoGenerationProviderIds: ["openai"],
  requireGenerateImage: true,
  requireGenerateVideo: true,
});
