import { describeVeniceProviderRuntimeContract } from "theclaw/plugin-sdk/provider-test-contracts";

describeVeniceProviderRuntimeContract(() => import("./index.js"));
