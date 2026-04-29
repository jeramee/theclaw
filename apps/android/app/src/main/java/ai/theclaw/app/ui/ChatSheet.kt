package ai.theclaw.app.ui

import ai.theclaw.app.MainViewModel
import ai.theclaw.app.ui.chat.ChatSheetContent
import androidx.compose.runtime.Composable

@Composable
fun ChatSheet(viewModel: MainViewModel) {
  ChatSheetContent(viewModel = viewModel)
}
