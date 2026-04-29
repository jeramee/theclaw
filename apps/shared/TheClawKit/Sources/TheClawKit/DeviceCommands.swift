import Foundation

public enum TheClawDeviceCommand: String, Codable, Sendable {
    case status = "device.status"
    case info = "device.info"
}

public enum TheClawBatteryState: String, Codable, Sendable {
    case unknown
    case unplugged
    case charging
    case full
}

public enum TheClawThermalState: String, Codable, Sendable {
    case nominal
    case fair
    case serious
    case critical
}

public enum TheClawNetworkPathStatus: String, Codable, Sendable {
    case satisfied
    case unsatisfied
    case requiresConnection
}

public enum TheClawNetworkInterfaceType: String, Codable, Sendable {
    case wifi
    case cellular
    case wired
    case other
}

public struct TheClawBatteryStatusPayload: Codable, Sendable, Equatable {
    public var level: Double?
    public var state: TheClawBatteryState
    public var lowPowerModeEnabled: Bool

    public init(level: Double?, state: TheClawBatteryState, lowPowerModeEnabled: Bool) {
        self.level = level
        self.state = state
        self.lowPowerModeEnabled = lowPowerModeEnabled
    }
}

public struct TheClawThermalStatusPayload: Codable, Sendable, Equatable {
    public var state: TheClawThermalState

    public init(state: TheClawThermalState) {
        self.state = state
    }
}

public struct TheClawStorageStatusPayload: Codable, Sendable, Equatable {
    public var totalBytes: Int64
    public var freeBytes: Int64
    public var usedBytes: Int64

    public init(totalBytes: Int64, freeBytes: Int64, usedBytes: Int64) {
        self.totalBytes = totalBytes
        self.freeBytes = freeBytes
        self.usedBytes = usedBytes
    }
}

public struct TheClawNetworkStatusPayload: Codable, Sendable, Equatable {
    public var status: TheClawNetworkPathStatus
    public var isExpensive: Bool
    public var isConstrained: Bool
    public var interfaces: [TheClawNetworkInterfaceType]

    public init(
        status: TheClawNetworkPathStatus,
        isExpensive: Bool,
        isConstrained: Bool,
        interfaces: [TheClawNetworkInterfaceType])
    {
        self.status = status
        self.isExpensive = isExpensive
        self.isConstrained = isConstrained
        self.interfaces = interfaces
    }
}

public struct TheClawDeviceStatusPayload: Codable, Sendable, Equatable {
    public var battery: TheClawBatteryStatusPayload
    public var thermal: TheClawThermalStatusPayload
    public var storage: TheClawStorageStatusPayload
    public var network: TheClawNetworkStatusPayload
    public var uptimeSeconds: Double

    public init(
        battery: TheClawBatteryStatusPayload,
        thermal: TheClawThermalStatusPayload,
        storage: TheClawStorageStatusPayload,
        network: TheClawNetworkStatusPayload,
        uptimeSeconds: Double)
    {
        self.battery = battery
        self.thermal = thermal
        self.storage = storage
        self.network = network
        self.uptimeSeconds = uptimeSeconds
    }
}

public struct TheClawDeviceInfoPayload: Codable, Sendable, Equatable {
    public var deviceName: String
    public var modelIdentifier: String
    public var systemName: String
    public var systemVersion: String
    public var appVersion: String
    public var appBuild: String
    public var locale: String

    public init(
        deviceName: String,
        modelIdentifier: String,
        systemName: String,
        systemVersion: String,
        appVersion: String,
        appBuild: String,
        locale: String)
    {
        self.deviceName = deviceName
        self.modelIdentifier = modelIdentifier
        self.systemName = systemName
        self.systemVersion = systemVersion
        self.appVersion = appVersion
        self.appBuild = appBuild
        self.locale = locale
    }
}
