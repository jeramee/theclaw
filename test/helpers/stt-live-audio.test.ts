import { normalizeTranscriptForMatch } from "theclaw/plugin-sdk/provider-test-contracts";
import { describe, expect, it } from "vitest";

describe("normalizeTranscriptForMatch", () => {
  it("normalizes punctuation and common TheClaw live transcription variants", () => {
    expect(normalizeTranscriptForMatch("The-Claw integration OK")).toBe("theclawintegrationok");
    expect(normalizeTranscriptForMatch("Testing OpenFlaw realtime transcription")).toMatch(
      /open(?:claw|flaw)/,
    );
  });
});
