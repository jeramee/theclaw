import type {
  ButtonInteraction,
  CommandInteraction,
  StringSelectMenuInteraction,
} from "@buape/carbon";
import type { ChatCommandDefinition, CommandArgs } from "theclaw/plugin-sdk/command-auth";
import type { TheClawConfig } from "theclaw/plugin-sdk/config-types";
import type { ResolvedAgentRoute } from "theclaw/plugin-sdk/routing";
import type { ThreadBindingManager } from "./thread-bindings.js";

type DiscordConfig = NonNullable<TheClawConfig["channels"]>["discord"];

export type DispatchDiscordCommandInteractionParams = {
  interaction: CommandInteraction | ButtonInteraction | StringSelectMenuInteraction;
  prompt: string;
  command: ChatCommandDefinition;
  commandArgs?: CommandArgs;
  cfg: TheClawConfig;
  discordConfig: DiscordConfig;
  accountId: string;
  sessionPrefix: string;
  preferFollowUp: boolean;
  threadBindings: ThreadBindingManager;
  responseEphemeral?: boolean;
  suppressReplies?: boolean;
};

export type DispatchDiscordCommandInteractionResult = {
  accepted: boolean;
  effectiveRoute?: ResolvedAgentRoute;
};

export type DispatchDiscordCommandInteraction = (
  params: DispatchDiscordCommandInteractionParams,
) => Promise<DispatchDiscordCommandInteractionResult>;
