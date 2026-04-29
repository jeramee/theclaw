import type { TheClawConfig } from "theclaw/plugin-sdk/config-types";

export function makeQqbotSecretRefConfig(): TheClawConfig {
  return {
    channels: {
      qqbot: {
        appId: "123456",
        clientSecret: {
          source: "env",
          provider: "default",
          id: "QQBOT_CLIENT_SECRET",
        },
      },
    },
  } as TheClawConfig;
}

export function makeQqbotDefaultAccountConfig(): TheClawConfig {
  return {
    channels: {
      qqbot: {
        defaultAccount: "bot2",
        accounts: {
          bot2: { appId: "123456" },
        },
      },
    },
  } as TheClawConfig;
}
