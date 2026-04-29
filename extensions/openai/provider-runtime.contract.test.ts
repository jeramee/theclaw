import { describeOpenAIProviderRuntimeContract } from "theclaw/plugin-sdk/provider-test-contracts";

describeOpenAIProviderRuntimeContract(() => import("./index.js"));
