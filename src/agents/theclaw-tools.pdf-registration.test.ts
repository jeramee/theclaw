import { describe, expect, it } from "vitest";
import { collectPresentTheClawTools } from "./theclaw-tools.registration.js";
import { createPdfTool } from "./tools/pdf-tool.js";

describe("createTheClawTools PDF registration", () => {
  it("includes the pdf tool when the pdf factory returns a tool", () => {
    const pdfTool = createPdfTool({
      agentDir: "/tmp/theclaw-agent-main",
      config: {
        agents: {
          defaults: {
            pdfModel: { primary: "openai/gpt-5.4-mini" },
          },
        },
      },
    });

    expect(pdfTool?.name).toBe("pdf");
    expect(collectPresentTheClawTools([pdfTool]).map((tool) => tool.name)).toContain("pdf");
  });
});
