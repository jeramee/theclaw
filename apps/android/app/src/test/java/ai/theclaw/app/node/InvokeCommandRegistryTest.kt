package ai.theclaw.app.node

import ai.theclaw.app.protocol.TheClawCalendarCommand
import ai.theclaw.app.protocol.TheClawCallLogCommand
import ai.theclaw.app.protocol.TheClawCameraCommand
import ai.theclaw.app.protocol.TheClawCapability
import ai.theclaw.app.protocol.TheClawContactsCommand
import ai.theclaw.app.protocol.TheClawDeviceCommand
import ai.theclaw.app.protocol.TheClawLocationCommand
import ai.theclaw.app.protocol.TheClawMotionCommand
import ai.theclaw.app.protocol.TheClawNotificationsCommand
import ai.theclaw.app.protocol.TheClawPhotosCommand
import ai.theclaw.app.protocol.TheClawSmsCommand
import ai.theclaw.app.protocol.TheClawSystemCommand
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class InvokeCommandRegistryTest {
  private val coreCapabilities =
    setOf(
      TheClawCapability.Canvas.rawValue,
      TheClawCapability.Device.rawValue,
      TheClawCapability.Notifications.rawValue,
      TheClawCapability.System.rawValue,
      TheClawCapability.Photos.rawValue,
      TheClawCapability.Contacts.rawValue,
      TheClawCapability.Calendar.rawValue,
    )

  private val optionalCapabilities =
    setOf(
      TheClawCapability.Camera.rawValue,
      TheClawCapability.Location.rawValue,
      TheClawCapability.Sms.rawValue,
      TheClawCapability.CallLog.rawValue,
      TheClawCapability.VoiceWake.rawValue,
      TheClawCapability.Motion.rawValue,
    )

  private val coreCommands =
    setOf(
      TheClawDeviceCommand.Status.rawValue,
      TheClawDeviceCommand.Info.rawValue,
      TheClawDeviceCommand.Permissions.rawValue,
      TheClawDeviceCommand.Health.rawValue,
      TheClawNotificationsCommand.List.rawValue,
      TheClawNotificationsCommand.Actions.rawValue,
      TheClawSystemCommand.Notify.rawValue,
      TheClawPhotosCommand.Latest.rawValue,
      TheClawContactsCommand.Search.rawValue,
      TheClawContactsCommand.Add.rawValue,
      TheClawCalendarCommand.Events.rawValue,
      TheClawCalendarCommand.Add.rawValue,
    )

  private val optionalCommands =
    setOf(
      TheClawCameraCommand.Snap.rawValue,
      TheClawCameraCommand.Clip.rawValue,
      TheClawCameraCommand.List.rawValue,
      TheClawLocationCommand.Get.rawValue,
      TheClawMotionCommand.Activity.rawValue,
      TheClawMotionCommand.Pedometer.rawValue,
      TheClawSmsCommand.Send.rawValue,
      TheClawSmsCommand.Search.rawValue,
      TheClawCallLogCommand.Search.rawValue,
    )

  private val debugCommands = setOf("debug.logs", "debug.ed25519")

  @Test
  fun advertisedCapabilities_respectsFeatureAvailability() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags())

    assertContainsAll(capabilities, coreCapabilities)
    assertMissingAll(capabilities, optionalCapabilities)
  }

  @Test
  fun advertisedCapabilities_includesFeatureCapabilitiesWhenEnabled() {
    val capabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          sendSmsAvailable = true,
          readSmsAvailable = true,
          smsSearchPossible = true,
          callLogAvailable = true,
          voiceWakeEnabled = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
        ),
      )

    assertContainsAll(capabilities, coreCapabilities + optionalCapabilities)
  }

  @Test
  fun advertisedCommands_respectsFeatureAvailability() {
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags())

    assertContainsAll(commands, coreCommands)
    assertMissingAll(commands, optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_includesFeatureCommandsWhenEnabled() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          sendSmsAvailable = true,
          readSmsAvailable = true,
          smsSearchPossible = true,
          callLogAvailable = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
          debugBuild = true,
        ),
      )

    assertContainsAll(commands, coreCommands + optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_onlyIncludesSupportedMotionCommands() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        NodeRuntimeFlags(
          cameraEnabled = false,
          locationEnabled = false,
          sendSmsAvailable = false,
          readSmsAvailable = false,
          smsSearchPossible = false,
          callLogAvailable = false,
          voiceWakeEnabled = false,
          motionActivityAvailable = true,
          motionPedometerAvailable = false,
          debugBuild = false,
        ),
      )

    assertTrue(commands.contains(TheClawMotionCommand.Activity.rawValue))
    assertFalse(commands.contains(TheClawMotionCommand.Pedometer.rawValue))
  }

  @Test
  fun advertisedCommands_splitsSmsSendAndSearchAvailability() {
    val readOnlyCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(readSmsAvailable = true, smsSearchPossible = true),
      )
    val sendOnlyCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(sendSmsAvailable = true),
      )
    val requestableSearchCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(smsSearchPossible = true),
      )

    assertTrue(readOnlyCommands.contains(TheClawSmsCommand.Search.rawValue))
    assertFalse(readOnlyCommands.contains(TheClawSmsCommand.Send.rawValue))
    assertTrue(sendOnlyCommands.contains(TheClawSmsCommand.Send.rawValue))
    assertFalse(sendOnlyCommands.contains(TheClawSmsCommand.Search.rawValue))
    assertTrue(requestableSearchCommands.contains(TheClawSmsCommand.Search.rawValue))
  }

  @Test
  fun advertisedCapabilities_includeSmsWhenEitherSmsPathIsAvailable() {
    val readOnlyCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(readSmsAvailable = true),
      )
    val sendOnlyCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(sendSmsAvailable = true),
      )
    val requestableSearchCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(smsSearchPossible = true),
      )

    assertTrue(readOnlyCapabilities.contains(TheClawCapability.Sms.rawValue))
    assertTrue(sendOnlyCapabilities.contains(TheClawCapability.Sms.rawValue))
    assertFalse(requestableSearchCapabilities.contains(TheClawCapability.Sms.rawValue))
  }

  @Test
  fun advertisedCommands_excludesCallLogWhenUnavailable() {
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags(callLogAvailable = false))

    assertFalse(commands.contains(TheClawCallLogCommand.Search.rawValue))
  }

  @Test
  fun advertisedCapabilities_excludesCallLogWhenUnavailable() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags(callLogAvailable = false))

    assertFalse(capabilities.contains(TheClawCapability.CallLog.rawValue))
  }

  @Test
  fun advertisedCapabilities_includesVoiceWakeWithoutAdvertisingCommands() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags(voiceWakeEnabled = true))
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags(voiceWakeEnabled = true))

    assertTrue(capabilities.contains(TheClawCapability.VoiceWake.rawValue))
    assertFalse(commands.any { it.contains("voice", ignoreCase = true) })
  }

  @Test
  fun find_returnsForegroundMetadataForCameraCommands() {
    val list = InvokeCommandRegistry.find(TheClawCameraCommand.List.rawValue)
    val location = InvokeCommandRegistry.find(TheClawLocationCommand.Get.rawValue)

    assertNotNull(list)
    assertEquals(true, list?.requiresForeground)
    assertNotNull(location)
    assertEquals(false, location?.requiresForeground)
  }

  @Test
  fun find_returnsNullForUnknownCommand() {
    assertNull(InvokeCommandRegistry.find("not.real"))
  }

  private fun defaultFlags(
    cameraEnabled: Boolean = false,
    locationEnabled: Boolean = false,
    sendSmsAvailable: Boolean = false,
    readSmsAvailable: Boolean = false,
    smsSearchPossible: Boolean = false,
    callLogAvailable: Boolean = false,
    voiceWakeEnabled: Boolean = false,
    motionActivityAvailable: Boolean = false,
    motionPedometerAvailable: Boolean = false,
    debugBuild: Boolean = false,
  ): NodeRuntimeFlags =
    NodeRuntimeFlags(
      cameraEnabled = cameraEnabled,
      locationEnabled = locationEnabled,
      sendSmsAvailable = sendSmsAvailable,
      readSmsAvailable = readSmsAvailable,
      smsSearchPossible = smsSearchPossible,
      callLogAvailable = callLogAvailable,
      voiceWakeEnabled = voiceWakeEnabled,
      motionActivityAvailable = motionActivityAvailable,
      motionPedometerAvailable = motionPedometerAvailable,
      debugBuild = debugBuild,
    )

  private fun assertContainsAll(
    actual: List<String>,
    expected: Set<String>,
  ) {
    expected.forEach { value -> assertTrue(actual.contains(value)) }
  }

  private fun assertMissingAll(
    actual: List<String>,
    forbidden: Set<String>,
  ) {
    forbidden.forEach { value -> assertFalse(actual.contains(value)) }
  }
}
