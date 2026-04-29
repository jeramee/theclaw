import { formatTrimmedAllowFromEntries } from "theclaw/plugin-sdk/channel-config-helpers";
import type { ChannelStatusIssue } from "theclaw/plugin-sdk/channel-contract";
import { PAIRING_APPROVED_MESSAGE } from "theclaw/plugin-sdk/channel-status";
import {
  DEFAULT_ACCOUNT_ID,
  getChatChannelMeta,
  type ChannelPlugin,
  type TheClawConfig,
} from "theclaw/plugin-sdk/core";
import { resolveChannelMediaMaxBytes } from "theclaw/plugin-sdk/media-runtime";
import { collectStatusIssuesFromLastError } from "theclaw/plugin-sdk/status-helpers";
import {
  resolveIMessageConfigAllowFrom,
  resolveIMessageConfigDefaultTo,
} from "./config-accessors.js";
import { looksLikeIMessageTargetId, normalizeIMessageMessagingTarget } from "./normalize.js";
export { chunkTextForOutbound } from "theclaw/plugin-sdk/text-chunking";

export {
  collectStatusIssuesFromLastError,
  DEFAULT_ACCOUNT_ID,
  formatTrimmedAllowFromEntries,
  getChatChannelMeta,
  looksLikeIMessageTargetId,
  normalizeIMessageMessagingTarget,
  PAIRING_APPROVED_MESSAGE,
  resolveChannelMediaMaxBytes,
  resolveIMessageConfigAllowFrom,
  resolveIMessageConfigDefaultTo,
};

export type { ChannelPlugin, ChannelStatusIssue, TheClawConfig };
