// Domain queries for the Exchange Recon cockpit.
// Typed against the real SDK responses:
//   MaestroProcesses.getAll()        -> MaestroProcessGetAllResponse[]
//   ProcessInstances.getAll()        -> NonPaginated/Paginated<ProcessInstanceGetResponse> ({ items })
//   ProcessInstances.getVariables()  -> ProcessInstanceGetVariablesResponse ({ globalVariables })
//   Tasks.getAll() / Tasks.complete()
import type { UiPath } from "@uipath/uipath-typescript/core";
import type {
  MaestroProcessGetAllResponse,
  ProcessInstanceGetResponse,
} from "@uipath/uipath-typescript/maestro-processes";
import { services, unwrap } from "./sdk";
import { config } from "./config";

export type InstanceRow = {
  id: string;
  processKey: string;
  status: string;
  displayName: string;
  startedAt: string;
};

/** Find the Maestro process for Exchange Recon by display name. */
export async function findExchangeProcess(
  sdk: UiPath,
): Promise<MaestroProcessGetAllResponse | undefined> {
  const all = await services.maestro(sdk).getAll();
  const want = config.exchangeProcessName.toLowerCase();
  return all.find((p) => p.name?.toLowerCase().includes(want));
}

/** Live instances for the Exchange process, newest first. */
export async function listExchangeInstances(sdk: UiPath): Promise<InstanceRow[]> {
  const proc = await findExchangeProcess(sdk);
  const procKey = proc?.processKey ?? "";

  const res = await services.instances(sdk).getAll();
  const items = unwrap<ProcessInstanceGetResponse>(res);

  const rows: InstanceRow[] = items.map((r) => ({
    id: r.instanceId,
    processKey: r.processKey,
    status: r.latestRunStatus,
    displayName: r.instanceDisplayName || "Exchange instance",
    startedAt: r.startedTime,
  }));

  const scoped = procKey ? rows.filter((r) => r.processKey === procKey) : rows;
  return scoped.sort((a, b) => (b.startedAt || "").localeCompare(a.startedAt || ""));
}

/** Instances that need a human: faulted, paused, pending, or running. */
export function needsAttention(r: InstanceRow): boolean {
  const s = (r.status || "").toLowerCase();
  return s.includes("fault") || s.includes("pause") || s.includes("pending") || s.includes("running");
}

export type VarRow = { name: string; value: unknown; source?: string };

/** Variables for one instance — where the agent's variance proposal lives. */
export async function getInstanceVariables(sdk: UiPath, instanceId: string): Promise<VarRow[]> {
  const res = await services.instances(sdk).getVariables(instanceId, config.folderKey);
  return (res.globalVariables ?? []).map((v) => ({ name: v.name, value: v.value, source: v.source }));
}

/** Execution timeline for the instance detail view. */
export async function getInstanceHistory(sdk: UiPath, instanceId: string) {
  return services.instances(sdk).getExecutionHistory(instanceId, config.folderKey);
}

/**
 * The human gate. Find the open Action Center task linked to this instance.
 *
 * NOTE (preview seam): the field linking a task to a Maestro instance depends on
 * how the User task is configured. We match on the instance id appearing anywhere
 * in the task payload — confirm against a real Tasks.getAll() result and tighten.
 */
export async function findOpenTaskForInstance(sdk: UiPath, instanceId: string) {
  const res = await services.tasks(sdk).getAll();
  const tasks = unwrap<Record<string, unknown>>(res);
  return tasks.find((t) => {
    const status = String(t.status ?? "").toLowerCase();
    const open = status === "" || status.includes("pending") || status.includes("unassigned") || status.includes("assigned");
    return open && JSON.stringify(t).includes(instanceId);
  });
}

export type GateDecision = "Approve" | "Escalate";

/** Complete the human-gate task. `data` keys must match the User task's form fields. */
export async function decideGate(sdk: UiPath, taskId: number, decision: GateDecision, note: string) {
  return services.tasks(sdk).complete(
    { taskId, data: { action: decision, reviewerNote: note } } as never,
    config.folderId,
  );
}
