import { describe, expect, it } from "vitest";
import { isTheClawManagedMatrixDevice, summarizeMatrixDeviceHealth } from "./device-health.js";

describe("matrix device health", () => {
  it("detects TheClaw-managed device names", () => {
    expect(isTheClawManagedMatrixDevice("TheClaw Gateway")).toBe(true);
    expect(isTheClawManagedMatrixDevice("TheClaw Debug")).toBe(true);
    expect(isTheClawManagedMatrixDevice("Element iPhone")).toBe(false);
    expect(isTheClawManagedMatrixDevice(null)).toBe(false);
  });

  it("summarizes stale TheClaw-managed devices separately from the current device", () => {
    const summary = summarizeMatrixDeviceHealth([
      {
        deviceId: "du314Zpw3A",
        displayName: "TheClaw Gateway",
        current: true,
      },
      {
        deviceId: "BritdXC6iL",
        displayName: "TheClaw Gateway",
        current: false,
      },
      {
        deviceId: "G6NJU9cTgs",
        displayName: "TheClaw Debug",
        current: false,
      },
      {
        deviceId: "phone123",
        displayName: "Element iPhone",
        current: false,
      },
    ]);

    expect(summary.currentDeviceId).toBe("du314Zpw3A");
    expect(summary.currentTheClawDevices).toEqual([
      expect.objectContaining({ deviceId: "du314Zpw3A" }),
    ]);
    expect(summary.staleTheClawDevices).toEqual([
      expect.objectContaining({ deviceId: "BritdXC6iL" }),
      expect.objectContaining({ deviceId: "G6NJU9cTgs" }),
    ]);
  });
});
