import { describe, expect, it } from "vitest";
import { shortenText } from "./text-format.js";

describe("shortenText", () => {
  it("returns original text when it fits", () => {
    expect(shortenText("theclaw", 16)).toBe("theclaw");
  });

  it("truncates and appends ellipsis when over limit", () => {
    expect(shortenText("theclaw-status-output", 10)).toBe("theclaw-…");
  });

  it("counts multi-byte characters correctly", () => {
    expect(shortenText("hello🙂world", 7)).toBe("hello🙂…");
  });
});
