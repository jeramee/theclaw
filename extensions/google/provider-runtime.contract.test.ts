import { describeGoogleProviderRuntimeContract } from "theclaw/plugin-sdk/provider-test-contracts";

describeGoogleProviderRuntimeContract(() => import("./index.js"));
