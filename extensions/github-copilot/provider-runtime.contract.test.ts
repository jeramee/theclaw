import { describeGithubCopilotProviderRuntimeContract } from "theclaw/plugin-sdk/provider-test-contracts";

describeGithubCopilotProviderRuntimeContract(() => import("./index.js"));
