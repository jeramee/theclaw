package ai.theclaw.app.protocol

import org.junit.Assert.assertEquals
import org.junit.Test

class TheClawProtocolConstantsTest {
  @Test
  fun canvasCommandsUseStableStrings() {
    assertEquals("canvas.present", TheClawCanvasCommand.Present.rawValue)
    assertEquals("canvas.hide", TheClawCanvasCommand.Hide.rawValue)
    assertEquals("canvas.navigate", TheClawCanvasCommand.Navigate.rawValue)
    assertEquals("canvas.eval", TheClawCanvasCommand.Eval.rawValue)
    assertEquals("canvas.snapshot", TheClawCanvasCommand.Snapshot.rawValue)
  }

  @Test
  fun a2uiCommandsUseStableStrings() {
    assertEquals("canvas.a2ui.push", TheClawCanvasA2UICommand.Push.rawValue)
    assertEquals("canvas.a2ui.pushJSONL", TheClawCanvasA2UICommand.PushJSONL.rawValue)
    assertEquals("canvas.a2ui.reset", TheClawCanvasA2UICommand.Reset.rawValue)
  }

  @Test
  fun capabilitiesUseStableStrings() {
    assertEquals("canvas", TheClawCapability.Canvas.rawValue)
    assertEquals("camera", TheClawCapability.Camera.rawValue)
    assertEquals("voiceWake", TheClawCapability.VoiceWake.rawValue)
    assertEquals("location", TheClawCapability.Location.rawValue)
    assertEquals("sms", TheClawCapability.Sms.rawValue)
    assertEquals("device", TheClawCapability.Device.rawValue)
    assertEquals("notifications", TheClawCapability.Notifications.rawValue)
    assertEquals("system", TheClawCapability.System.rawValue)
    assertEquals("photos", TheClawCapability.Photos.rawValue)
    assertEquals("contacts", TheClawCapability.Contacts.rawValue)
    assertEquals("calendar", TheClawCapability.Calendar.rawValue)
    assertEquals("motion", TheClawCapability.Motion.rawValue)
    assertEquals("callLog", TheClawCapability.CallLog.rawValue)
  }

  @Test
  fun cameraCommandsUseStableStrings() {
    assertEquals("camera.list", TheClawCameraCommand.List.rawValue)
    assertEquals("camera.snap", TheClawCameraCommand.Snap.rawValue)
    assertEquals("camera.clip", TheClawCameraCommand.Clip.rawValue)
  }

  @Test
  fun notificationsCommandsUseStableStrings() {
    assertEquals("notifications.list", TheClawNotificationsCommand.List.rawValue)
    assertEquals("notifications.actions", TheClawNotificationsCommand.Actions.rawValue)
  }

  @Test
  fun deviceCommandsUseStableStrings() {
    assertEquals("device.status", TheClawDeviceCommand.Status.rawValue)
    assertEquals("device.info", TheClawDeviceCommand.Info.rawValue)
    assertEquals("device.permissions", TheClawDeviceCommand.Permissions.rawValue)
    assertEquals("device.health", TheClawDeviceCommand.Health.rawValue)
  }

  @Test
  fun systemCommandsUseStableStrings() {
    assertEquals("system.notify", TheClawSystemCommand.Notify.rawValue)
  }

  @Test
  fun photosCommandsUseStableStrings() {
    assertEquals("photos.latest", TheClawPhotosCommand.Latest.rawValue)
  }

  @Test
  fun contactsCommandsUseStableStrings() {
    assertEquals("contacts.search", TheClawContactsCommand.Search.rawValue)
    assertEquals("contacts.add", TheClawContactsCommand.Add.rawValue)
  }

  @Test
  fun calendarCommandsUseStableStrings() {
    assertEquals("calendar.events", TheClawCalendarCommand.Events.rawValue)
    assertEquals("calendar.add", TheClawCalendarCommand.Add.rawValue)
  }

  @Test
  fun motionCommandsUseStableStrings() {
    assertEquals("motion.activity", TheClawMotionCommand.Activity.rawValue)
    assertEquals("motion.pedometer", TheClawMotionCommand.Pedometer.rawValue)
  }

  @Test
  fun smsCommandsUseStableStrings() {
    assertEquals("sms.send", TheClawSmsCommand.Send.rawValue)
    assertEquals("sms.search", TheClawSmsCommand.Search.rawValue)
  }

  @Test
  fun callLogCommandsUseStableStrings() {
    assertEquals("callLog.search", TheClawCallLogCommand.Search.rawValue)
  }
}
