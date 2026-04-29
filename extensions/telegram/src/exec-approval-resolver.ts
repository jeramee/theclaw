import { resolveApprovalOverGateway } from "theclaw/plugin-sdk/approval-gateway-runtime";
import type { ExecApprovalReplyDecision } from "theclaw/plugin-sdk/approval-reply-runtime";
import type { TheClawConfig } from "theclaw/plugin-sdk/config-types";

export type ResolveTelegramExecApprovalParams = {
  cfg: TheClawConfig;
  approvalId: string;
  decision: ExecApprovalReplyDecision;
  senderId?: string | null;
  allowPluginFallback?: boolean;
  gatewayUrl?: string;
};

export async function resolveTelegramExecApproval(
  params: ResolveTelegramExecApprovalParams,
): Promise<void> {
  await resolveApprovalOverGateway({
    cfg: params.cfg,
    approvalId: params.approvalId,
    decision: params.decision,
    senderId: params.senderId,
    gatewayUrl: params.gatewayUrl,
    allowPluginFallback: params.allowPluginFallback,
    clientDisplayName: `Telegram approval (${params.senderId?.trim() || "unknown"})`,
  });
}
