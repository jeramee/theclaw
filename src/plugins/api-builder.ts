import type { TheClawConfig } from "../config/types.theclaw.js";
import type { PluginRuntime } from "./runtime/types.js";
import type { TheClawPluginApi, PluginLogger } from "./types.js";

export type BuildPluginApiParams = {
  id: string;
  name: string;
  version?: string;
  description?: string;
  source: string;
  rootDir?: string;
  registrationMode: TheClawPluginApi["registrationMode"];
  config: TheClawConfig;
  pluginConfig?: Record<string, unknown>;
  runtime: PluginRuntime;
  logger: PluginLogger;
  resolvePath: (input: string) => string;
  handlers?: Partial<
    Pick<
      TheClawPluginApi,
      | "registerTool"
      | "registerHook"
      | "registerHttpRoute"
      | "registerChannel"
      | "registerGatewayMethod"
      | "registerCli"
      | "registerReload"
      | "registerNodeHostCommand"
      | "registerSecurityAuditCollector"
      | "registerService"
      | "registerGatewayDiscoveryService"
      | "registerCliBackend"
      | "registerTextTransforms"
      | "registerConfigMigration"
      | "registerMigrationProvider"
      | "registerAutoEnableProbe"
      | "registerProvider"
      | "registerSpeechProvider"
      | "registerRealtimeTranscriptionProvider"
      | "registerRealtimeVoiceProvider"
      | "registerMediaUnderstandingProvider"
      | "registerImageGenerationProvider"
      | "registerVideoGenerationProvider"
      | "registerMusicGenerationProvider"
      | "registerWebFetchProvider"
      | "registerWebSearchProvider"
      | "registerInteractiveHandler"
      | "onConversationBindingResolved"
      | "registerCommand"
      | "registerContextEngine"
      | "registerCompactionProvider"
      | "registerAgentHarness"
      | "registerCodexAppServerExtensionFactory"
      | "registerAgentToolResultMiddleware"
      | "registerSessionExtension"
      | "enqueueNextTurnInjection"
      | "registerTrustedToolPolicy"
      | "registerToolMetadata"
      | "registerControlUiDescriptor"
      | "registerRuntimeLifecycle"
      | "registerAgentEventSubscription"
      | "setRunContext"
      | "getRunContext"
      | "clearRunContext"
      | "registerSessionSchedulerJob"
      | "registerDetachedTaskRuntime"
      | "registerMemoryCapability"
      | "registerMemoryPromptSection"
      | "registerMemoryPromptSupplement"
      | "registerMemoryCorpusSupplement"
      | "registerMemoryFlushPlan"
      | "registerMemoryRuntime"
      | "registerMemoryEmbeddingProvider"
      | "on"
    >
  >;
};

const noopRegisterTool: TheClawPluginApi["registerTool"] = () => {};
const noopRegisterHook: TheClawPluginApi["registerHook"] = () => {};
const noopRegisterHttpRoute: TheClawPluginApi["registerHttpRoute"] = () => {};
const noopRegisterChannel: TheClawPluginApi["registerChannel"] = () => {};
const noopRegisterGatewayMethod: TheClawPluginApi["registerGatewayMethod"] = () => {};
const noopRegisterCli: TheClawPluginApi["registerCli"] = () => {};
const noopRegisterReload: TheClawPluginApi["registerReload"] = () => {};
const noopRegisterNodeHostCommand: TheClawPluginApi["registerNodeHostCommand"] = () => {};
const noopRegisterSecurityAuditCollector: TheClawPluginApi["registerSecurityAuditCollector"] =
  () => {};
const noopRegisterService: TheClawPluginApi["registerService"] = () => {};
const noopRegisterGatewayDiscoveryService: TheClawPluginApi["registerGatewayDiscoveryService"] =
  () => {};
const noopRegisterCliBackend: TheClawPluginApi["registerCliBackend"] = () => {};
const noopRegisterTextTransforms: TheClawPluginApi["registerTextTransforms"] = () => {};
const noopRegisterConfigMigration: TheClawPluginApi["registerConfigMigration"] = () => {};
const noopRegisterMigrationProvider: TheClawPluginApi["registerMigrationProvider"] = () => {};
const noopRegisterAutoEnableProbe: TheClawPluginApi["registerAutoEnableProbe"] = () => {};
const noopRegisterProvider: TheClawPluginApi["registerProvider"] = () => {};
const noopRegisterSpeechProvider: TheClawPluginApi["registerSpeechProvider"] = () => {};
const noopRegisterRealtimeTranscriptionProvider: TheClawPluginApi["registerRealtimeTranscriptionProvider"] =
  () => {};
const noopRegisterRealtimeVoiceProvider: TheClawPluginApi["registerRealtimeVoiceProvider"] =
  () => {};
const noopRegisterMediaUnderstandingProvider: TheClawPluginApi["registerMediaUnderstandingProvider"] =
  () => {};
const noopRegisterImageGenerationProvider: TheClawPluginApi["registerImageGenerationProvider"] =
  () => {};
const noopRegisterVideoGenerationProvider: TheClawPluginApi["registerVideoGenerationProvider"] =
  () => {};
const noopRegisterMusicGenerationProvider: TheClawPluginApi["registerMusicGenerationProvider"] =
  () => {};
const noopRegisterWebFetchProvider: TheClawPluginApi["registerWebFetchProvider"] = () => {};
const noopRegisterWebSearchProvider: TheClawPluginApi["registerWebSearchProvider"] = () => {};
const noopRegisterInteractiveHandler: TheClawPluginApi["registerInteractiveHandler"] = () => {};
const noopOnConversationBindingResolved: TheClawPluginApi["onConversationBindingResolved"] =
  () => {};
const noopRegisterCommand: TheClawPluginApi["registerCommand"] = () => {};
const noopRegisterContextEngine: TheClawPluginApi["registerContextEngine"] = () => {};
const noopRegisterCompactionProvider: TheClawPluginApi["registerCompactionProvider"] = () => {};
const noopRegisterAgentHarness: TheClawPluginApi["registerAgentHarness"] = () => {};
const noopRegisterCodexAppServerExtensionFactory: TheClawPluginApi["registerCodexAppServerExtensionFactory"] =
  () => {};
const noopRegisterAgentToolResultMiddleware: TheClawPluginApi["registerAgentToolResultMiddleware"] =
  () => {};
const noopRegisterSessionExtension: TheClawPluginApi["registerSessionExtension"] = () => {};
const noopEnqueueNextTurnInjection: TheClawPluginApi["enqueueNextTurnInjection"] = async (
  injection,
) => ({ enqueued: false, id: "", sessionKey: injection.sessionKey });
const noopRegisterTrustedToolPolicy: TheClawPluginApi["registerTrustedToolPolicy"] = () => {};
const noopRegisterToolMetadata: TheClawPluginApi["registerToolMetadata"] = () => {};
const noopRegisterControlUiDescriptor: TheClawPluginApi["registerControlUiDescriptor"] = () => {};
const noopRegisterRuntimeLifecycle: TheClawPluginApi["registerRuntimeLifecycle"] = () => {};
const noopRegisterAgentEventSubscription: TheClawPluginApi["registerAgentEventSubscription"] =
  () => {};
const noopSetRunContext: TheClawPluginApi["setRunContext"] = () => false;
const noopGetRunContext: TheClawPluginApi["getRunContext"] = () => undefined;
const noopClearRunContext: TheClawPluginApi["clearRunContext"] = () => {};
const noopRegisterSessionSchedulerJob: TheClawPluginApi["registerSessionSchedulerJob"] = () =>
  undefined;
const noopRegisterDetachedTaskRuntime: TheClawPluginApi["registerDetachedTaskRuntime"] = () => {};
const noopRegisterMemoryCapability: TheClawPluginApi["registerMemoryCapability"] = () => {};
const noopRegisterMemoryPromptSection: TheClawPluginApi["registerMemoryPromptSection"] = () => {};
const noopRegisterMemoryPromptSupplement: TheClawPluginApi["registerMemoryPromptSupplement"] =
  () => {};
const noopRegisterMemoryCorpusSupplement: TheClawPluginApi["registerMemoryCorpusSupplement"] =
  () => {};
const noopRegisterMemoryFlushPlan: TheClawPluginApi["registerMemoryFlushPlan"] = () => {};
const noopRegisterMemoryRuntime: TheClawPluginApi["registerMemoryRuntime"] = () => {};
const noopRegisterMemoryEmbeddingProvider: TheClawPluginApi["registerMemoryEmbeddingProvider"] =
  () => {};
const noopOn: TheClawPluginApi["on"] = () => {};

export function buildPluginApi(params: BuildPluginApiParams): TheClawPluginApi {
  const handlers = params.handlers ?? {};
  return {
    id: params.id,
    name: params.name,
    version: params.version,
    description: params.description,
    source: params.source,
    rootDir: params.rootDir,
    registrationMode: params.registrationMode,
    config: params.config,
    pluginConfig: params.pluginConfig,
    runtime: params.runtime,
    logger: params.logger,
    registerTool: handlers.registerTool ?? noopRegisterTool,
    registerHook: handlers.registerHook ?? noopRegisterHook,
    registerHttpRoute: handlers.registerHttpRoute ?? noopRegisterHttpRoute,
    registerChannel: handlers.registerChannel ?? noopRegisterChannel,
    registerGatewayMethod: handlers.registerGatewayMethod ?? noopRegisterGatewayMethod,
    registerCli: handlers.registerCli ?? noopRegisterCli,
    registerReload: handlers.registerReload ?? noopRegisterReload,
    registerNodeHostCommand: handlers.registerNodeHostCommand ?? noopRegisterNodeHostCommand,
    registerSecurityAuditCollector:
      handlers.registerSecurityAuditCollector ?? noopRegisterSecurityAuditCollector,
    registerService: handlers.registerService ?? noopRegisterService,
    registerGatewayDiscoveryService:
      handlers.registerGatewayDiscoveryService ?? noopRegisterGatewayDiscoveryService,
    registerCliBackend: handlers.registerCliBackend ?? noopRegisterCliBackend,
    registerTextTransforms: handlers.registerTextTransforms ?? noopRegisterTextTransforms,
    registerConfigMigration: handlers.registerConfigMigration ?? noopRegisterConfigMigration,
    registerMigrationProvider: handlers.registerMigrationProvider ?? noopRegisterMigrationProvider,
    registerAutoEnableProbe: handlers.registerAutoEnableProbe ?? noopRegisterAutoEnableProbe,
    registerProvider: handlers.registerProvider ?? noopRegisterProvider,
    registerSpeechProvider: handlers.registerSpeechProvider ?? noopRegisterSpeechProvider,
    registerRealtimeTranscriptionProvider:
      handlers.registerRealtimeTranscriptionProvider ?? noopRegisterRealtimeTranscriptionProvider,
    registerRealtimeVoiceProvider:
      handlers.registerRealtimeVoiceProvider ?? noopRegisterRealtimeVoiceProvider,
    registerMediaUnderstandingProvider:
      handlers.registerMediaUnderstandingProvider ?? noopRegisterMediaUnderstandingProvider,
    registerImageGenerationProvider:
      handlers.registerImageGenerationProvider ?? noopRegisterImageGenerationProvider,
    registerVideoGenerationProvider:
      handlers.registerVideoGenerationProvider ?? noopRegisterVideoGenerationProvider,
    registerMusicGenerationProvider:
      handlers.registerMusicGenerationProvider ?? noopRegisterMusicGenerationProvider,
    registerWebFetchProvider: handlers.registerWebFetchProvider ?? noopRegisterWebFetchProvider,
    registerWebSearchProvider: handlers.registerWebSearchProvider ?? noopRegisterWebSearchProvider,
    registerInteractiveHandler:
      handlers.registerInteractiveHandler ?? noopRegisterInteractiveHandler,
    onConversationBindingResolved:
      handlers.onConversationBindingResolved ?? noopOnConversationBindingResolved,
    registerCommand: handlers.registerCommand ?? noopRegisterCommand,
    registerContextEngine: handlers.registerContextEngine ?? noopRegisterContextEngine,
    registerCompactionProvider:
      handlers.registerCompactionProvider ?? noopRegisterCompactionProvider,
    registerAgentHarness: handlers.registerAgentHarness ?? noopRegisterAgentHarness,
    registerCodexAppServerExtensionFactory:
      handlers.registerCodexAppServerExtensionFactory ?? noopRegisterCodexAppServerExtensionFactory,
    registerAgentToolResultMiddleware:
      handlers.registerAgentToolResultMiddleware ?? noopRegisterAgentToolResultMiddleware,
    registerSessionExtension: handlers.registerSessionExtension ?? noopRegisterSessionExtension,
    enqueueNextTurnInjection: handlers.enqueueNextTurnInjection ?? noopEnqueueNextTurnInjection,
    registerTrustedToolPolicy: handlers.registerTrustedToolPolicy ?? noopRegisterTrustedToolPolicy,
    registerToolMetadata: handlers.registerToolMetadata ?? noopRegisterToolMetadata,
    registerControlUiDescriptor:
      handlers.registerControlUiDescriptor ?? noopRegisterControlUiDescriptor,
    registerRuntimeLifecycle: handlers.registerRuntimeLifecycle ?? noopRegisterRuntimeLifecycle,
    registerAgentEventSubscription:
      handlers.registerAgentEventSubscription ?? noopRegisterAgentEventSubscription,
    setRunContext: handlers.setRunContext ?? noopSetRunContext,
    getRunContext: handlers.getRunContext ?? noopGetRunContext,
    clearRunContext: handlers.clearRunContext ?? noopClearRunContext,
    registerSessionSchedulerJob:
      handlers.registerSessionSchedulerJob ?? noopRegisterSessionSchedulerJob,
    registerDetachedTaskRuntime:
      handlers.registerDetachedTaskRuntime ?? noopRegisterDetachedTaskRuntime,
    registerMemoryCapability: handlers.registerMemoryCapability ?? noopRegisterMemoryCapability,
    registerMemoryPromptSection:
      handlers.registerMemoryPromptSection ?? noopRegisterMemoryPromptSection,
    registerMemoryPromptSupplement:
      handlers.registerMemoryPromptSupplement ?? noopRegisterMemoryPromptSupplement,
    registerMemoryCorpusSupplement:
      handlers.registerMemoryCorpusSupplement ?? noopRegisterMemoryCorpusSupplement,
    registerMemoryFlushPlan: handlers.registerMemoryFlushPlan ?? noopRegisterMemoryFlushPlan,
    registerMemoryRuntime: handlers.registerMemoryRuntime ?? noopRegisterMemoryRuntime,
    registerMemoryEmbeddingProvider:
      handlers.registerMemoryEmbeddingProvider ?? noopRegisterMemoryEmbeddingProvider,
    resolvePath: params.resolvePath,
    on: handlers.on ?? noopOn,
  };
}
