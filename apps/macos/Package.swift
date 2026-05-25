// swift-tools-version: 6.2
// Package manifest for the TheClaw macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "TheClaw",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "TheClawIPC", targets: ["TheClawIPC"]),
        .library(name: "TheClawDiscovery", targets: ["TheClawDiscovery"]),
        .executable(name: "TheClaw", targets: ["TheClaw"]),
        .executable(name: "theclaw-mac", targets: ["TheClawMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.3.0"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.4.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.10.1"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.9.0"),
        .package(url: "https://github.com/steipete/Peekaboo.git", exact: "3.2.3"),
        .package(path: "../shared/TheClawKit"),
        .package(path: "../../Swabble"),
    ],
    targets: [
        .target(
            name: "TheClawIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "TheClawDiscovery",
            dependencies: [
                .product(name: "TheClawKit", package: "TheClawKit"),
            ],
            path: "Sources/TheClawDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "TheClaw",
            dependencies: [
                "TheClawIPC",
                "TheClawDiscovery",
                .product(name: "TheClawKit", package: "TheClawKit"),
                .product(name: "TheClawChatUI", package: "TheClawKit"),
                .product(name: "TheClawProtocol", package: "TheClawKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
            ],
            exclude: [
                "Resources/Info.plist",
            ],
            resources: [
                .copy("Resources/TheClaw.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "TheClawMacCLI",
            dependencies: [
                "TheClawDiscovery",
                .product(name: "TheClawKit", package: "TheClawKit"),
                .product(name: "TheClawProtocol", package: "TheClawKit"),
            ],
            path: "Sources/TheClawMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "TheClawIPCTests",
            dependencies: [
                "TheClawIPC",
                "TheClaw",
                "TheClawDiscovery",
                .product(name: "TheClawProtocol", package: "TheClawKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
