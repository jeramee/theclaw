import { describe, expect, it } from "vitest";
import {
  isTheClawOwnerOnlyCoreToolName,
  THECLAW_OWNER_ONLY_CORE_TOOL_NAMES,
} from "./tools/owner-only-tools.js";

describe("createTheClawTools owner authorization", () => {
  it("marks owner-only core tool names", () => {
    expect(THECLAW_OWNER_ONLY_CORE_TOOL_NAMES).toEqual(["cron", "gateway", "nodes"]);
    expect(isTheClawOwnerOnlyCoreToolName("cron")).toBe(true);
    expect(isTheClawOwnerOnlyCoreToolName("gateway")).toBe(true);
    expect(isTheClawOwnerOnlyCoreToolName("nodes")).toBe(true);
  });

  it("keeps canvas non-owner-only", () => {
    expect(isTheClawOwnerOnlyCoreToolName("canvas")).toBe(false);
  });
});
