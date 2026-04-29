import type { TheClawConfig } from "../../config/types.theclaw.js";
import type { GetReplyOptions } from "../get-reply-options.types.js";
import type { ReplyPayload } from "../reply-payload.js";
import type { MsgContext } from "../templating.js";

export type GetReplyFromConfig = (
  ctx: MsgContext,
  opts?: GetReplyOptions,
  configOverride?: TheClawConfig,
) => Promise<ReplyPayload | ReplyPayload[] | undefined>;
