import type { TheClawConfig } from "theclaw/plugin-sdk/config-types";
import {
  resolveConfiguredBindingRoute,
  resolveRuntimeConversationBindingRoute,
} from "theclaw/plugin-sdk/conversation-runtime";
import { resolveAgentRoute } from "theclaw/plugin-sdk/routing";
import { logVerbose } from "theclaw/plugin-sdk/runtime-env";
import { resolveBlueBubblesInboundConversationId } from "./conversation-id.js";

export function resolveBlueBubblesConversationRoute(params: {
  cfg: TheClawConfig;
  accountId: string;
  isGroup: boolean;
  peerId: string;
  sender: string;
  chatId?: number | null;
  chatGuid?: string | null;
  chatIdentifier?: string | null;
}): ReturnType<typeof resolveAgentRoute> {
  let route = resolveAgentRoute({
    cfg: params.cfg,
    channel: "bluebubbles",
    accountId: params.accountId,
    peer: {
      kind: params.isGroup ? "group" : "direct",
      id: params.peerId,
    },
  });

  const conversationId = resolveBlueBubblesInboundConversationId({
    isGroup: params.isGroup,
    sender: params.sender,
    chatId: params.chatId,
    chatGuid: params.chatGuid,
    chatIdentifier: params.chatIdentifier,
  });
  if (!conversationId) {
    return route;
  }

  route = resolveConfiguredBindingRoute({
    cfg: params.cfg,
    route,
    conversation: {
      channel: "bluebubbles",
      accountId: params.accountId,
      conversationId,
    },
  }).route;

  const runtimeRoute = resolveRuntimeConversationBindingRoute({
    route,
    conversation: {
      channel: "bluebubbles",
      accountId: params.accountId,
      conversationId,
    },
  });
  route = runtimeRoute.route;
  if (runtimeRoute.bindingRecord && !runtimeRoute.boundSessionKey) {
    logVerbose(`bluebubbles: plugin-bound conversation ${conversationId}`);
  } else if (runtimeRoute.boundSessionKey) {
    logVerbose(
      `bluebubbles: routed via bound conversation ${conversationId} -> ${runtimeRoute.boundSessionKey}`,
    );
  }
  return route;
}
