import CoreLocation
import Foundation
import TheClawKit
import UIKit

typealias TheClawCameraSnapResult = (format: String, base64: String, width: Int, height: Int)
typealias TheClawCameraClipResult = (format: String, base64: String, durationMs: Int, hasAudio: Bool)

protocol CameraServicing: Sendable {
    func listDevices() async -> [CameraController.CameraDeviceInfo]
    func snap(params: TheClawCameraSnapParams) async throws -> TheClawCameraSnapResult
    func clip(params: TheClawCameraClipParams) async throws -> TheClawCameraClipResult
}

protocol ScreenRecordingServicing: Sendable {
    func record(
        screenIndex: Int?,
        durationMs: Int?,
        fps: Double?,
        includeAudio: Bool?,
        outPath: String?) async throws -> String
}

@MainActor
protocol LocationServicing: Sendable {
    func authorizationStatus() -> CLAuthorizationStatus
    func accuracyAuthorization() -> CLAccuracyAuthorization
    func ensureAuthorization(mode: TheClawLocationMode) async -> CLAuthorizationStatus
    func currentLocation(
        params: TheClawLocationGetParams,
        desiredAccuracy: TheClawLocationAccuracy,
        maxAgeMs: Int?,
        timeoutMs: Int?) async throws -> CLLocation
    func startLocationUpdates(
        desiredAccuracy: TheClawLocationAccuracy,
        significantChangesOnly: Bool) -> AsyncStream<CLLocation>
    func stopLocationUpdates()
    func startMonitoringSignificantLocationChanges(onUpdate: @escaping @Sendable (CLLocation) -> Void)
    func stopMonitoringSignificantLocationChanges()
}

@MainActor
protocol DeviceStatusServicing: Sendable {
    func status() async throws -> TheClawDeviceStatusPayload
    func info() -> TheClawDeviceInfoPayload
}

protocol PhotosServicing: Sendable {
    func latest(params: TheClawPhotosLatestParams) async throws -> TheClawPhotosLatestPayload
}

protocol ContactsServicing: Sendable {
    func search(params: TheClawContactsSearchParams) async throws -> TheClawContactsSearchPayload
    func add(params: TheClawContactsAddParams) async throws -> TheClawContactsAddPayload
}

protocol CalendarServicing: Sendable {
    func events(params: TheClawCalendarEventsParams) async throws -> TheClawCalendarEventsPayload
    func add(params: TheClawCalendarAddParams) async throws -> TheClawCalendarAddPayload
}

protocol RemindersServicing: Sendable {
    func list(params: TheClawRemindersListParams) async throws -> TheClawRemindersListPayload
    func add(params: TheClawRemindersAddParams) async throws -> TheClawRemindersAddPayload
}

protocol MotionServicing: Sendable {
    func activities(params: TheClawMotionActivityParams) async throws -> TheClawMotionActivityPayload
    func pedometer(params: TheClawPedometerParams) async throws -> TheClawPedometerPayload
}

struct WatchMessagingStatus: Equatable {
    var supported: Bool
    var paired: Bool
    var appInstalled: Bool
    var reachable: Bool
    var activationState: String
}

struct WatchQuickReplyEvent: Equatable {
    var replyId: String
    var promptId: String
    var actionId: String
    var actionLabel: String?
    var sessionKey: String?
    var note: String?
    var sentAtMs: Int?
    var transport: String
}

struct WatchExecApprovalResolveEvent: Equatable {
    var replyId: String
    var approvalId: String
    var decision: TheClawWatchExecApprovalDecision
    var sentAtMs: Int?
    var transport: String
}

struct WatchExecApprovalSnapshotRequestEvent: Equatable {
    var requestId: String
    var sentAtMs: Int?
    var transport: String
}

struct WatchNotificationSendResult: Equatable {
    var deliveredImmediately: Bool
    var queuedForDelivery: Bool
    var transport: String
}

protocol WatchMessagingServicing: AnyObject, Sendable {
    func status() async -> WatchMessagingStatus
    func setStatusHandler(_ handler: (@Sendable (WatchMessagingStatus) -> Void)?)
    func setReplyHandler(_ handler: (@Sendable (WatchQuickReplyEvent) -> Void)?)
    func setExecApprovalResolveHandler(_ handler: (@Sendable (WatchExecApprovalResolveEvent) -> Void)?)
    func setExecApprovalSnapshotRequestHandler(
        _ handler: (@Sendable (WatchExecApprovalSnapshotRequestEvent) -> Void)?)
    func sendNotification(
        id: String,
        params: TheClawWatchNotifyParams) async throws -> WatchNotificationSendResult
    func sendExecApprovalPrompt(
        _ message: TheClawWatchExecApprovalPromptMessage) async throws -> WatchNotificationSendResult
    func sendExecApprovalResolved(
        _ message: TheClawWatchExecApprovalResolvedMessage) async throws -> WatchNotificationSendResult
    func sendExecApprovalExpired(
        _ message: TheClawWatchExecApprovalExpiredMessage) async throws -> WatchNotificationSendResult
    func syncExecApprovalSnapshot(
        _ message: TheClawWatchExecApprovalSnapshotMessage) async throws -> WatchNotificationSendResult
}

extension CameraController: CameraServicing {}
extension ScreenRecordService: ScreenRecordingServicing {}
extension LocationService: LocationServicing {}
