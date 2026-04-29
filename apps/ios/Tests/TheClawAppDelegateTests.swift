import Testing
@testable import TheClaw

@Suite(.serialized) struct TheClawAppDelegateTests {
    @Test @MainActor func resolvesRegistryModelBeforeViewTaskAssignsDelegateModel() {
        let registryModel = NodeAppModel()
        TheClawAppModelRegistry.appModel = registryModel
        defer { TheClawAppModelRegistry.appModel = nil }

        let delegate = TheClawAppDelegate()

        #expect(delegate._test_resolvedAppModel() === registryModel)
    }

    @Test @MainActor func prefersExplicitDelegateModelOverRegistryFallback() {
        let registryModel = NodeAppModel()
        let explicitModel = NodeAppModel()
        TheClawAppModelRegistry.appModel = registryModel
        defer { TheClawAppModelRegistry.appModel = nil }

        let delegate = TheClawAppDelegate()
        delegate.appModel = explicitModel

        #expect(delegate._test_resolvedAppModel() === explicitModel)
    }
}
