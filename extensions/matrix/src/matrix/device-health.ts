export type MatrixManagedDeviceInfo = {
  deviceId: string;
  displayName: string | null;
  current: boolean;
};

export type MatrixDeviceHealthSummary = {
  currentDeviceId: string | null;
  staleTheClawDevices: MatrixManagedDeviceInfo[];
  currentTheClawDevices: MatrixManagedDeviceInfo[];
};

const THECLAW_DEVICE_NAME_PREFIX = "TheClaw ";

export function isTheClawManagedMatrixDevice(displayName: string | null | undefined): boolean {
  return displayName?.startsWith(THECLAW_DEVICE_NAME_PREFIX) === true;
}

export function summarizeMatrixDeviceHealth(
  devices: MatrixManagedDeviceInfo[],
): MatrixDeviceHealthSummary {
  const currentDeviceId = devices.find((device) => device.current)?.deviceId ?? null;
  const openClawDevices = devices.filter((device) =>
    isTheClawManagedMatrixDevice(device.displayName),
  );
  return {
    currentDeviceId,
    staleTheClawDevices: openClawDevices.filter((device) => !device.current),
    currentTheClawDevices: openClawDevices.filter((device) => device.current),
  };
}
