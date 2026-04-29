import type { TheClawConfig } from "theclaw/plugin-sdk/config-types";
import { generateConversationLabel } from "theclaw/plugin-sdk/reply-dispatch-runtime";
export {
  AUTO_TOPIC_LABEL_DEFAULT_PROMPT,
  resolveAutoTopicLabelConfig,
} from "./auto-topic-label-config.js";

export async function generateTelegramTopicLabel(params: {
  userMessage: string;
  prompt: string;
  cfg: TheClawConfig;
  agentId?: string;
  agentDir?: string;
}): Promise<string | null> {
  return await generateConversationLabel({
    ...params,
    maxLength: 128,
  });
}
