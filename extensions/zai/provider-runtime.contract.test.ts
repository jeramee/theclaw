import { describeZAIProviderRuntimeContract } from "theclaw/plugin-sdk/provider-test-contracts";

describeZAIProviderRuntimeContract(() => import("./index.js"));
