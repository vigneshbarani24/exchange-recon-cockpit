// The human gate, answered from the cockpit.
//
// Maestro's gate is a pair of armed message events; the decision travels as a
// correlated message whose NAME is the decision (ApproveGate / EscalateGate) and
// whose reference is the purchase order. The portal has no surface for this and
// the SDK exposes no wrapper, so we call the PIMS endpoint the platform's own
// tooling uses, with the SDK's PKCE token. Requires the PIMS scope on the token.
import type { UiPath } from "@uipath/uipath-typescript/core";
import { config } from "./config";

export type GateDecision = "approve" | "escalate";

export interface GateSendResult {
  id: string;
  jobId?: string;
}

export async function sendGateDecision(
  sdk: UiPath,
  opts: { decision: GateDecision; purchaseOrder: string; note: string },
): Promise<GateSendResult> {
  const token = sdk.getToken();
  if (!token) throw new Error("Not authenticated — connect to the tenant first.");

  const url = `${config.baseUrl}/${config.orgName}/${config.tenantName}/pims_/api/v1/instances/messages/send`;
  const body = {
    name: opts.decision === "approve" ? "ApproveGate" : "EscalateGate",
    reference: opts.purchaseOrder,
    itemData: { decision: opts.decision, note: opts.note },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-uipath-folderkey": config.folderKey,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gate message rejected (${res.status}): ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as GateSendResult;

  // Best-effort Teams card, fired by the approval surface at the moment of the
  // human decision. Browser-to-webhook is CORS-opaque, so failures are silent
  // and never block the decision itself.
  if (config.teamsWebhook) {
    const title =
      opts.decision === "approve"
        ? "Exchange Recon: correction approved and held"
        : "Exchange Recon: escalated to buyer";
    const card = {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          contentUrl: null,
          content: {
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            type: "AdaptiveCard",
            version: "1.2",
            msteams: { width: "Full" },
            body: [
              { type: "TextBlock", size: "Large", weight: "Bolder", text: title },
              { type: "TextBlock", wrap: true, text: `PO ${opts.purchaseOrder}: ${opts.note}` },
              {
                type: "TextBlock",
                isSubtle: true,
                size: "Small",
                text: "Sent by the Recon cockpit on the approver's action.",
              },
            ],
          },
        },
      ],
    };
    try {
      await fetch(config.teamsWebhook, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(card),
      });
    } catch {
      // Notification is best-effort by design; governance never depends on it.
    }
  }

  return data;
}
