import { readStringOrNumberParam, readStringParam } from "theclaw/plugin-sdk/channel-actions";
import type { TheClawConfig } from "theclaw/plugin-sdk/config-types";

export { resolveReactionMessageId } from "theclaw/plugin-sdk/channel-actions";
export { handleWhatsAppAction } from "./action-runtime.js";
export { isWhatsAppGroupJid, normalizeWhatsAppTarget } from "./normalize.js";
export { readStringOrNumberParam, readStringParam, type TheClawConfig };
