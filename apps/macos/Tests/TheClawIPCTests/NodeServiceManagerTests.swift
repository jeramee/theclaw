import Foundation
import Testing
@testable import TheClaw

@Suite(.serialized) struct NodeServiceManagerTests {
    @Test func `builds node service commands with current CLI shape`() async throws {
        try await TestIsolation.withUserDefaultsValues(["theclaw.gatewayProjectRootPath": nil]) {
            let tmp = try makeTempDirForTests()
            CommandResolver.setProjectRoot(tmp.path)

            let theclawPath = tmp.appendingPathComponent("node_modules/.bin/theclaw")
            try makeExecutableForTests(at: theclawPath)

            let start = NodeServiceManager._testServiceCommand(["start"])
            #expect(start == [theclawPath.path, "node", "start", "--json"])

            let stop = NodeServiceManager._testServiceCommand(["stop"])
            #expect(stop == [theclawPath.path, "node", "stop", "--json"])
        }
    }
}
