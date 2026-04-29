import Foundation
import TheClawKit
import Testing
@testable import TheClaw

struct MacNodeModeCoordinatorTests {
    @Test func `remote mode does not advertise browser proxy`() {
        let caps = MacNodeModeCoordinator.resolvedCaps(
            browserControlEnabled: true,
            cameraEnabled: false,
            locationMode: .off,
            connectionMode: .remote)
        let commands = MacNodeModeCoordinator.resolvedCommands(caps: caps)

        #expect(!caps.contains(TheClawCapability.browser.rawValue))
        #expect(!commands.contains(TheClawBrowserCommand.proxy.rawValue))
        #expect(commands.contains(TheClawCanvasCommand.present.rawValue))
        #expect(commands.contains(TheClawSystemCommand.notify.rawValue))
    }

    @Test func `local mode advertises browser proxy when enabled`() {
        let caps = MacNodeModeCoordinator.resolvedCaps(
            browserControlEnabled: true,
            cameraEnabled: false,
            locationMode: .off,
            connectionMode: .local)
        let commands = MacNodeModeCoordinator.resolvedCommands(caps: caps)

        #expect(caps.contains(TheClawCapability.browser.rawValue))
        #expect(commands.contains(TheClawBrowserCommand.proxy.rawValue))
    }
}
