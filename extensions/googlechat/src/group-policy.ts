import { resolveChannelGroupRequireMention } from "theclaw/plugin-sdk/channel-policy";
import type { TheClawConfig } from "theclaw/plugin-sdk/core";

type GoogleChatGroupContext = {
  cfg: TheClawConfig;
  accountId?: string | null;
  groupId?: string | null;
};

export function resolveGoogleChatGroupRequireMention(params: GoogleChatGroupContext): boolean {
  return resolveChannelGroupRequireMention({
    cfg: params.cfg,
    channel: "googlechat",
    groupId: params.groupId,
    accountId: params.accountId,
  });
}
