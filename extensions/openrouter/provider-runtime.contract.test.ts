import { describeOpenRouterProviderRuntimeContract } from "theclaw/plugin-sdk/provider-test-contracts";

describeOpenRouterProviderRuntimeContract(() => import("./index.js"));
