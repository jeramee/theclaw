package ai.theclaw.app.protocol

enum class TheClawCapability(
  val rawValue: String,
) {
  Canvas("canvas"),
  Camera("camera"),
  Sms("sms"),
  VoiceWake("voiceWake"),
  Location("location"),
  Device("device"),
  Notifications("notifications"),
  System("system"),
  Photos("photos"),
  Contacts("contacts"),
  Calendar("calendar"),
  Motion("motion"),
  CallLog("callLog"),
}

enum class TheClawCanvasCommand(
  val rawValue: String,
) {
  Present("canvas.present"),
  Hide("canvas.hide"),
  Navigate("canvas.navigate"),
  Eval("canvas.eval"),
  Snapshot("canvas.snapshot"),
  ;

  companion object {
    const val NamespacePrefix: String = "canvas."
  }
}

enum class TheClawCanvasA2UICommand(
  val rawValue: String,
) {
  Push("canvas.a2ui.push"),
  PushJSONL("canvas.a2ui.pushJSONL"),
  Reset("canvas.a2ui.reset"),
  ;

  companion object {
    const val NamespacePrefix: String = "canvas.a2ui."
  }
}

enum class TheClawCameraCommand(
  val rawValue: String,
) {
  List("camera.list"),
  Snap("camera.snap"),
  Clip("camera.clip"),
  ;

  companion object {
    const val NamespacePrefix: String = "camera."
  }
}

enum class TheClawSmsCommand(
  val rawValue: String,
) {
  Send("sms.send"),
  Search("sms.search"),
  ;

  companion object {
    const val NamespacePrefix: String = "sms."
  }
}

enum class TheClawLocationCommand(
  val rawValue: String,
) {
  Get("location.get"),
  ;

  companion object {
    const val NamespacePrefix: String = "location."
  }
}

enum class TheClawDeviceCommand(
  val rawValue: String,
) {
  Status("device.status"),
  Info("device.info"),
  Permissions("device.permissions"),
  Health("device.health"),
  ;

  companion object {
    const val NamespacePrefix: String = "device."
  }
}

enum class TheClawNotificationsCommand(
  val rawValue: String,
) {
  List("notifications.list"),
  Actions("notifications.actions"),
  ;

  companion object {
    const val NamespacePrefix: String = "notifications."
  }
}

enum class TheClawSystemCommand(
  val rawValue: String,
) {
  Notify("system.notify"),
  ;

  companion object {
    const val NamespacePrefix: String = "system."
  }
}

enum class TheClawPhotosCommand(
  val rawValue: String,
) {
  Latest("photos.latest"),
  ;

  companion object {
    const val NamespacePrefix: String = "photos."
  }
}

enum class TheClawContactsCommand(
  val rawValue: String,
) {
  Search("contacts.search"),
  Add("contacts.add"),
  ;

  companion object {
    const val NamespacePrefix: String = "contacts."
  }
}

enum class TheClawCalendarCommand(
  val rawValue: String,
) {
  Events("calendar.events"),
  Add("calendar.add"),
  ;

  companion object {
    const val NamespacePrefix: String = "calendar."
  }
}

enum class TheClawMotionCommand(
  val rawValue: String,
) {
  Activity("motion.activity"),
  Pedometer("motion.pedometer"),
  ;

  companion object {
    const val NamespacePrefix: String = "motion."
  }
}

enum class TheClawCallLogCommand(
  val rawValue: String,
) {
  Search("callLog.search"),
  ;

  companion object {
    const val NamespacePrefix: String = "callLog."
  }
}
