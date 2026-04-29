import { describe, expect, it } from "vitest";
import { coerceIdentityValue } from "./assistant-identity-values.js";

describe("shared/assistant-identity-values", () => {
  it("returns undefined for missing or blank values", () => {
    expect(coerceIdentityValue(undefined, 10)).toBeUndefined();
    expect(coerceIdentityValue("   ", 10)).toBeUndefined();
    expect(coerceIdentityValue(42 as unknown as string, 10)).toBeUndefined();
  });

  it("trims values and preserves strings within the limit", () => {
    expect(coerceIdentityValue("  TheClaw  ", 20)).toBe("TheClaw");
    expect(coerceIdentityValue("  TheClaw  ", 8)).toBe("TheClaw");
  });

  it("truncates overlong trimmed values at the exact limit", () => {
    expect(coerceIdentityValue("  TheClaw Assistant  ", 8)).toBe("TheClaw");
  });

  it("returns an empty string when truncating to a zero-length limit", () => {
    expect(coerceIdentityValue("  TheClaw  ", 0)).toBe("");
    expect(coerceIdentityValue("  TheClaw  ", -1)).toBe("OpenCla");
  });
});
