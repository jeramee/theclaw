import { describeAnthropicProviderRuntimeContract } from "theclaw/plugin-sdk/provider-test-contracts";

describeAnthropicProviderRuntimeContract(() => import("./index.js"));
