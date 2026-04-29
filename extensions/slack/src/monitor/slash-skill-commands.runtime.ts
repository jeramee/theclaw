import { listSkillCommandsForAgents as listSkillCommandsForAgentsImpl } from "theclaw/plugin-sdk/command-auth";

type ListSkillCommandsForAgents =
  typeof import("theclaw/plugin-sdk/command-auth").listSkillCommandsForAgents;

export function listSkillCommandsForAgents(
  ...args: Parameters<ListSkillCommandsForAgents>
): ReturnType<ListSkillCommandsForAgents> {
  return listSkillCommandsForAgentsImpl(...args);
}
