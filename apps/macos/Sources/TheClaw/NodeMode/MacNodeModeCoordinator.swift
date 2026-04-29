import Foundation
import TheClawKit
import OSLog

@MainActor
final class MacNodeModeCoordinator {
    static let shared = MacNodeModeCoordinator()

    private let logger = Logger(subsystem: "ai.theclaw", category: "mac-node")
    private var task: Task<Void, Never>?
    private let runtime = MacNodeRuntime()
    private let session = GatewayNodeSession()

    func start() {
        guard self.task == nil else { return }
        self.task = Task { [weak self] in
            await self?.run()
        }
    }

    func stop() {
        self.task?.cancel()
        self.task = nil
        Task { await self.session.disconnect() }
    }

    func setPreferredGatewayStableID(_ stableID: String?) {
        GatewayDiscoveryPreferences.setPreferredStableID(stableID)
        Task { await self.session.disconnect() }
    }

    private func run() async {
        var retryDelay: UInt64 = 1_000_000_000
        var lastCameraEnabled: Bool?
        var lastBrowserControlEnabled: Bool?
        let defaults = UserDefaults.standard

        while !Task.isCancelled {
            if await MainActor.run(body: { AppStateStore.shared.isPaused }) {
                try? await Task.sleep(nanoseconds: 1_000_000_000)
                continue
            }

            let cameraEnabled = defaults.object(forKey: cameraEnabledKey) as? Bool ?? false
            if lastCameraEnabled == nil {
                lastCameraEnabled = cameraEnabled
            } else if lastCameraEnabled != cameraEnabled {
                lastCameraEnabled = cameraEnabled
                await self.session.disconnect()
                try? await Task.sleep(nanoseconds: 200_000_000)
            }
            let browserControlEnabled = TheClawConfigFile.browserControlEnabled()
            if lastBrowserControlEnabled == nil {
                lastBrowserControlEnabled = browserControlEnabled
            } else if lastBrowserControlEnabled != browserControlEnabled {
                lastBrowserControlEnabled = browserControlEnabled
                await self.session.disconnect()
                try? await Task.sleep(nanoseconds: 200_000_000)
            }

            do {
                let config = try await GatewayEndpointStore.shared.requireConfig()
                let caps = self.currentCaps()
                let commands = self.currentCommands(caps: caps)
                let permissions = await self.currentPermissions()
                let connectOptions = GatewayConnectOptions(
                    role: "node",
                    scopes: [],
                    caps: caps,
                    commands: commands,
                    permissions: permissions,
                    clientId: "theclaw-macos",
                    clientMode: "node",
                    clientDisplayName: InstanceIdentity.displayName)
                let sessionBox = self.buildSessionBox(url: config.url)

                try await self.session.connect(
                    url: config.url,
                    token: config.token,
                    bootstrapToken: nil,
                    password: config.password,
                    connectOptions: connectOptions,
                    sessionBox: sessionBox,
                    onConnected: { [weak self] in
                        guard let self else { return }
                        self.logger.info("mac node connected to gateway")
                        let mainSessionKey = await GatewayConnection.shared.mainSessionKey()
                        await self.runtime.updateMainSessionKey(mainSessionKey)
                        await self.runtime.setEventSender { [weak self] event, payload in
                            guard let self else { return }
                            await self.session.sendEvent(event: event, payloadJSON: payload)
                        }
                    },
                    onDisconnected: { [weak self] reason in
                        guard let self else { return }
                        await self.runtime.setEventSender(nil)
                        self.logger.error("mac node disconnected: \(reason, privacy: .public)")
                    },
                    onInvoke: { [weak self] req in
                        guard let self else {
                            return BridgeInvokeResponse(
                                id: req.id,
                                ok: false,
                                error: TheClawNodeError(code: .unavailable, message: "UNAVAILABLE: node not ready"))
                        }
                        return await self.runtime.handleInvoke(req)
                    })

                retryDelay = 1_000_000_000
                try? await Task.sleep(nanoseconds: 1_000_000_000)
            } catch {
                self.logger.error("mac node gateway connect failed: \(error.localizedDescription, privacy: .public)")
                try? await Task.sleep(nanoseconds: min(retryDelay, 10_000_000_000))
                retryDelay = min(retryDelay * 2, 10_000_000_000)
            }
        }
    }

    nonisolated static func resolvedCaps(
        browserControlEnabled: Bool,
        cameraEnabled: Bool,
        locationMode: TheClawLocationMode,
        connectionMode: AppState.ConnectionMode) -> [String]
    {
        var caps: [String] = [TheClawCapability.canvas.rawValue, TheClawCapability.screen.rawValue]
        if browserControlEnabled, connectionMode == .local {
            caps.append(TheClawCapability.browser.rawValue)
        }
        if cameraEnabled {
            caps.append(TheClawCapability.camera.rawValue)
        }
        if locationMode != .off {
            caps.append(TheClawCapability.location.rawValue)
        }
        return caps
    }

    private func currentCaps() -> [String] {
        let rawLocationMode = UserDefaults.standard.string(forKey: locationModeKey) ?? "off"
        return Self.resolvedCaps(
            browserControlEnabled: TheClawConfigFile.browserControlEnabled(),
            cameraEnabled: UserDefaults.standard.object(forKey: cameraEnabledKey) as? Bool ?? false,
            locationMode: TheClawLocationMode(rawValue: rawLocationMode) ?? .off,
            connectionMode: AppStateStore.shared.connectionMode)
    }

    private func currentPermissions() async -> [String: Bool] {
        let statuses = await PermissionManager.status()
        return Dictionary(uniqueKeysWithValues: statuses.map { ($0.key.rawValue, $0.value) })
    }

    nonisolated static func resolvedCommands(caps: [String]) -> [String] {
        var commands: [String] = [
            TheClawCanvasCommand.present.rawValue,
            TheClawCanvasCommand.hide.rawValue,
            TheClawCanvasCommand.navigate.rawValue,
            TheClawCanvasCommand.evalJS.rawValue,
            TheClawCanvasCommand.snapshot.rawValue,
            TheClawCanvasA2UICommand.push.rawValue,
            TheClawCanvasA2UICommand.pushJSONL.rawValue,
            TheClawCanvasA2UICommand.reset.rawValue,
            MacNodeScreenCommand.snapshot.rawValue,
            MacNodeScreenCommand.record.rawValue,
            TheClawSystemCommand.notify.rawValue,
            TheClawSystemCommand.which.rawValue,
            TheClawSystemCommand.run.rawValue,
            TheClawSystemCommand.execApprovalsGet.rawValue,
            TheClawSystemCommand.execApprovalsSet.rawValue,
        ]

        let capsSet = Set(caps)
        if capsSet.contains(TheClawCapability.browser.rawValue) {
            commands.append(TheClawBrowserCommand.proxy.rawValue)
        }
        if capsSet.contains(TheClawCapability.camera.rawValue) {
            commands.append(TheClawCameraCommand.list.rawValue)
            commands.append(TheClawCameraCommand.snap.rawValue)
            commands.append(TheClawCameraCommand.clip.rawValue)
        }
        if capsSet.contains(TheClawCapability.location.rawValue) {
            commands.append(TheClawLocationCommand.get.rawValue)
        }

        return commands
    }

    private func currentCommands(caps: [String]) -> [String] {
        Self.resolvedCommands(caps: caps)
    }

    private func buildSessionBox(url: URL) -> WebSocketSessionBox? {
        guard url.scheme?.lowercased() == "wss" else { return nil }
        let host = url.host ?? "gateway"
        let port = url.port ?? 443
        let stableID = "\(host):\(port)"
        let stored = GatewayTLSStore.loadFingerprint(stableID: stableID)
        let params = GatewayTLSParams(
            required: true,
            expectedFingerprint: stored,
            allowTOFU: stored == nil,
            storeKey: stableID)
        let session = GatewayTLSPinningSession(params: params)
        return WebSocketSessionBox(session: session)
    }
}
