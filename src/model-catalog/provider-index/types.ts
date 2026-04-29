import type { ModelCatalogProvider } from "../types.js";

export type TheClawProviderIndexPluginInstall = {
  npmSpec: string;
  defaultChoice?: "npm";
  minHostVersion?: string;
  expectedIntegrity?: string;
};

export type TheClawProviderIndexPlugin = {
  id: string;
  package?: string;
  source?: string;
  install?: TheClawProviderIndexPluginInstall;
};

export type TheClawProviderIndexProviderAuthChoice = {
  method: string;
  choiceId: string;
  choiceLabel: string;
  choiceHint?: string;
  assistantPriority?: number;
  assistantVisibility?: "visible" | "manual-only";
  groupId?: string;
  groupLabel?: string;
  groupHint?: string;
  optionKey?: string;
  cliFlag?: string;
  cliOption?: string;
  cliDescription?: string;
  onboardingScopes?: readonly ("text-inference" | "image-generation")[];
};

export type TheClawProviderIndexProvider = {
  id: string;
  name: string;
  plugin: TheClawProviderIndexPlugin;
  docs?: string;
  categories?: readonly string[];
  authChoices?: readonly TheClawProviderIndexProviderAuthChoice[];
  previewCatalog?: ModelCatalogProvider;
};

export type TheClawProviderIndex = {
  version: number;
  providers: Readonly<Record<string, TheClawProviderIndexProvider>>;
};
