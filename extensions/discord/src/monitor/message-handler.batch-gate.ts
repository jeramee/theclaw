import type { ReplyToMode } from "theclaw/plugin-sdk/config-types";
import type { ReplyThreadingPolicy } from "theclaw/plugin-sdk/reply-reference";
import { resolveBatchedReplyThreadingPolicy } from "theclaw/plugin-sdk/reply-reference";

type ReplyThreadingContext = {
  ReplyThreading?: ReplyThreadingPolicy;
};

export function applyImplicitReplyBatchGate(
  ctx: object,
  replyToMode: ReplyToMode,
  isBatched: boolean,
) {
  const replyThreading = resolveBatchedReplyThreadingPolicy(replyToMode, isBatched);
  if (!replyThreading) {
    return;
  }
  (ctx as ReplyThreadingContext).ReplyThreading = replyThreading;
}
