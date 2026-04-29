import Foundation
import Testing
@testable import TheClaw

@Suite(.serialized)
struct TheClawConfigFileTests {
    private func makeConfigOverridePath() -> String {
        FileManager().temporaryDirectory
            .appendingPathComponent("theclaw-config-\(UUID().uuidString)")
            .appendingPathComponent("theclaw.json")
            .path
    }

    @Test
    func `config path respects env override`() async {
        let override = self.makeConfigOverridePath()

        await TestIsolation.withEnvValues(["THECLAW_CONFIG_PATH": override]) {
            #expect(TheClawConfigFile.url().path == override)
        }
    }

    @MainActor
    @Test
    func `remote gateway port parses and matches host`() async {
        let override = self.makeConfigOverridePath()

        await TestIsolation.withEnvValues(["THECLAW_CONFIG_PATH": override]) {
            TheClawConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "ws://gateway.ts.net:19999",
                    ],
                ],
            ])
            #expect(TheClawConfigFile.remoteGatewayPort() == 19999)
            #expect(TheClawConfigFile.remoteGatewayPort(matchingHost: "gateway.ts.net") == 19999)
            #expect(TheClawConfigFile.remoteGatewayPort(matchingHost: "GATEWAY.ts.net.") == 19999)
            #expect(TheClawConfigFile.remoteGatewayPort(matchingHost: "gateway") == nil)
            #expect(TheClawConfigFile.remoteGatewayPort(matchingHost: "other.ts.net") == nil)
            #expect(TheClawConfigFile.remoteGatewayPort(matchingHost: "gateway.attacker.tld") == nil)
        }
    }

    @MainActor
    @Test
    func `set remote gateway url string replaces scheme`() async {
        let override = self.makeConfigOverridePath()

        await TestIsolation.withEnvValues(["THECLAW_CONFIG_PATH": override]) {
            TheClawConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "wss://old-host:111",
                    ],
                ],
            ])
            TheClawConfigFile.setRemoteGatewayUrlString("ws://127.0.0.1:18789")
            let root = TheClawConfigFile.loadDict()
            let url = ((root["gateway"] as? [String: Any])?["remote"] as? [String: Any])?["url"] as? String
            #expect(url == "ws://127.0.0.1:18789")
        }
    }

    @MainActor
    @Test
    func `set remote gateway url preserves scheme`() async {
        let override = self.makeConfigOverridePath()

        await TestIsolation.withEnvValues(["THECLAW_CONFIG_PATH": override]) {
            TheClawConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "wss://old-host:111",
                    ],
                ],
            ])
            TheClawConfigFile.setRemoteGatewayUrl(host: "new-host", port: 2222)
            let root = TheClawConfigFile.loadDict()
            let url = ((root["gateway"] as? [String: Any])?["remote"] as? [String: Any])?["url"] as? String
            #expect(url == "wss://new-host:2222")
        }
    }

    @MainActor
    @Test
    func `clear remote gateway url removes only url field`() async {
        let override = self.makeConfigOverridePath()

        await TestIsolation.withEnvValues(["THECLAW_CONFIG_PATH": override]) {
            TheClawConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "wss://old-host:111",
                        "token": "tok",
                    ],
                ],
            ])
            TheClawConfigFile.clearRemoteGatewayUrl()
            let root = TheClawConfigFile.loadDict()
            let remote = ((root["gateway"] as? [String: Any])?["remote"] as? [String: Any]) ?? [:]
            #expect((remote["url"] as? String) == nil)
            #expect((remote["token"] as? String) == "tok")
        }
    }

    @Test
    func `state dir override sets config path`() async {
        let dir = FileManager().temporaryDirectory
            .appendingPathComponent("theclaw-state-\(UUID().uuidString)", isDirectory: true)
            .path

        await TestIsolation.withEnvValues([
            "THECLAW_CONFIG_PATH": nil,
            "THECLAW_STATE_DIR": dir,
        ]) {
            #expect(TheClawConfigFile.stateDirURL().path == dir)
            #expect(TheClawConfigFile.url().path == "\(dir)/theclaw.json")
        }
    }

    @MainActor
    @Test
    func `save dict appends config audit log`() async throws {
        let stateDir = FileManager().temporaryDirectory
            .appendingPathComponent("theclaw-state-\(UUID().uuidString)", isDirectory: true)
        let configPath = stateDir.appendingPathComponent("theclaw.json")
        let auditPath = stateDir.appendingPathComponent("logs/config-audit.jsonl")

        defer { try? FileManager().removeItem(at: stateDir) }

        try await TestIsolation.withEnvValues([
            "THECLAW_STATE_DIR": stateDir.path,
            "THECLAW_CONFIG_PATH": configPath.path,
        ]) {
            TheClawConfigFile.saveDict([
                "gateway": ["mode": "local"],
            ])

            let configData = try Data(contentsOf: configPath)
            let configRoot = try JSONSerialization.jsonObject(with: configData) as? [String: Any]
            #expect((configRoot?["meta"] as? [String: Any]) != nil)

            let rawAudit = try String(contentsOf: auditPath, encoding: .utf8)
            let lines = rawAudit
                .split(whereSeparator: \.isNewline)
                .map(String.init)
            #expect(!lines.isEmpty)
            guard let last = lines.last else {
                Issue.record("Missing config audit line")
                return
            }
            let auditRoot = try JSONSerialization.jsonObject(with: Data(last.utf8)) as? [String: Any]
            #expect(auditRoot?["source"] as? String == "macos-theclaw-config-file")
            #expect(auditRoot?["event"] as? String == "config.write")
            #expect(auditRoot?["result"] as? String == "success")
            #expect(auditRoot?["configPath"] as? String == configPath.path)
            #expect(auditRoot?["previousMode"] is NSNull)
            #expect(auditRoot?["nextMode"] is NSNumber)
            #expect(auditRoot?["previousIno"] is NSNull)
            #expect(auditRoot?["nextIno"] as? String != nil)
        }
    }

    @MainActor
    @Test
    func `load dict audits suspicious out-of-band clobbers`() async throws {
        let stateDir = FileManager().temporaryDirectory
            .appendingPathComponent("theclaw-state-\(UUID().uuidString)", isDirectory: true)
        let configPath = stateDir.appendingPathComponent("theclaw.json")
        let auditPath = stateDir.appendingPathComponent("logs/config-audit.jsonl")

        defer { try? FileManager().removeItem(at: stateDir) }

        try await TestIsolation.withEnvValues([
            "THECLAW_STATE_DIR": stateDir.path,
            "THECLAW_CONFIG_PATH": configPath.path,
        ]) {
            try TheClawConfigFile.withTestingFileLock {
                TheClawConfigFile.saveDict([
                    "update": ["channel": "beta"],
                    "browser": ["enabled": true],
                    "gateway": ["mode": "local"],
                    "channels": [
                        "discord": [
                            "enabled": true,
                            "dmPolicy": "pairing",
                        ],
                    ],
                ])
                _ = TheClawConfigFile.loadDict()

                let clobbered = """
                {
                  "update": {
                    "channel": "beta"
                  }
                }
                """
                try clobbered.write(to: configPath, atomically: true, encoding: .utf8)

                let loaded = TheClawConfigFile.loadDict()
                #expect((loaded["gateway"] as? [String: Any]) == nil)

                let rawAudit = try String(contentsOf: auditPath, encoding: .utf8)
                let lines = rawAudit
                    .split(whereSeparator: \.isNewline)
                    .map(String.init)
                let observeLine = lines.reversed().first { $0.contains("\"event\":\"config.observe\"") }
                #expect(observeLine != nil)
                guard let observeLine else {
                    Issue.record("Missing config.observe audit line")
                    return
                }
                let auditRoot = try JSONSerialization.jsonObject(with: Data(observeLine.utf8)) as? [String: Any]
                #expect(auditRoot?["source"] as? String == "macos-theclaw-config-file")
                #expect(auditRoot?["configPath"] as? String == configPath.path)
                #expect(auditRoot?["mode"] is NSNumber)
                #expect(auditRoot?["ino"] as? String != nil)
                #expect(auditRoot?["lastKnownGoodMode"] is NSNumber)
                #expect(auditRoot?["backupMode"] is NSNull)
                let suspicious = auditRoot?["suspicious"] as? [String] ?? []
                #expect(suspicious.contains("gateway-mode-missing-vs-last-good"))
                #expect(suspicious.contains("update-channel-only-root"))

                let clobberedPath = auditRoot?["clobberedPath"] as? String
                #expect(clobberedPath != nil)
                if let clobberedPath {
                    let preserved = try String(contentsOfFile: clobberedPath, encoding: .utf8)
                    #expect(preserved == clobbered)
                }
            }
        }
    }
}
