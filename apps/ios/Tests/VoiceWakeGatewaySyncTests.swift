import Foundation
import Testing
@testable import TheClaw

@Suite struct VoiceWakeGatewaySyncTests {
    @Test func decodeGatewayTriggersFromJSONSanitizes() {
        let payload = #"{"triggers":[" theclaw  ","", "computer"]}"#
        let triggers = VoiceWakePreferences.decodeGatewayTriggers(from: payload)
        #expect(triggers == ["theclaw", "computer"])
    }

    @Test func decodeGatewayTriggersFromJSONFallsBackWhenEmpty() {
        let payload = #"{"triggers":["  ",""]}"#
        let triggers = VoiceWakePreferences.decodeGatewayTriggers(from: payload)
        #expect(triggers == VoiceWakePreferences.defaultTriggerWords)
    }

    @Test func decodeGatewayTriggersFromInvalidJSONReturnsNil() {
        let triggers = VoiceWakePreferences.decodeGatewayTriggers(from: "not json")
        #expect(triggers == nil)
    }
}
