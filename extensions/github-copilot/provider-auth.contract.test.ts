import { describeGithubCopilotProviderAuthContract } from "theclaw/plugin-sdk/provider-test-contracts";

describeGithubCopilotProviderAuthContract(() => import("./index.js"));
