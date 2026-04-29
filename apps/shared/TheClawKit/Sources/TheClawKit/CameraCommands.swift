import Foundation

public enum TheClawCameraCommand: String, Codable, Sendable {
    case list = "camera.list"
    case snap = "camera.snap"
    case clip = "camera.clip"
}

public enum TheClawCameraFacing: String, Codable, Sendable {
    case back
    case front
}

public enum TheClawCameraImageFormat: String, Codable, Sendable {
    case jpg
    case jpeg
}

public enum TheClawCameraVideoFormat: String, Codable, Sendable {
    case mp4
}

public struct TheClawCameraSnapParams: Codable, Sendable, Equatable {
    public var facing: TheClawCameraFacing?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: TheClawCameraImageFormat?
    public var deviceId: String?
    public var delayMs: Int?

    public init(
        facing: TheClawCameraFacing? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: TheClawCameraImageFormat? = nil,
        deviceId: String? = nil,
        delayMs: Int? = nil)
    {
        self.facing = facing
        self.maxWidth = maxWidth
        self.quality = quality
        self.format = format
        self.deviceId = deviceId
        self.delayMs = delayMs
    }
}

public struct TheClawCameraClipParams: Codable, Sendable, Equatable {
    public var facing: TheClawCameraFacing?
    public var durationMs: Int?
    public var includeAudio: Bool?
    public var format: TheClawCameraVideoFormat?
    public var deviceId: String?

    public init(
        facing: TheClawCameraFacing? = nil,
        durationMs: Int? = nil,
        includeAudio: Bool? = nil,
        format: TheClawCameraVideoFormat? = nil,
        deviceId: String? = nil)
    {
        self.facing = facing
        self.durationMs = durationMs
        self.includeAudio = includeAudio
        self.format = format
        self.deviceId = deviceId
    }
}
