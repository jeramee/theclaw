import { resolveApprovalOverGateway } from "theclaw/plugin-sdk/approval-gateway-runtime";
import type { ExecApprovalReplyDecision } from "theclaw/plugin-sdk/approval-runtime";
import type { TheClawConfig } from "theclaw/plugin-sdk/config-types";
import { isApprovalNotFoundError } from "theclaw/plugin-sdk/error-runtime";

export { isApprovalNotFoundError };

export async function resolveMatrixApproval(params: {
  cfg: TheClawConfig;
  approvalId: string;
  decision: ExecApprovalReplyDecision;
  senderId?: string | null;
  gatewayUrl?: string;
}): Promise<void> {
  await resolveApprovalOverGateway({
    cfg: params.cfg,
    approvalId: params.approvalId,
    decision: params.decision,
    senderId: params.senderId,
    gatewayUrl: params.gatewayUrl,
    clientDisplayName: `Matrix approval (${params.senderId?.trim() || "unknown"})`,
  });
}
