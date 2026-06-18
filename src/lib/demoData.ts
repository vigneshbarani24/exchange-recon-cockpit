// DEMO-ONLY cached fallback. Lives on the vb/demo/safe-mode branch and is NEVER
// merged to main. Used only when VITE_DEMO_FALLBACK is on AND a live tenant call
// fails or returns empty, so a recording never dies mid-take (auth blip, empty
// queue, slow poll). The real tenant is always tried first; this is the net, not
// a substitute for real data.
import type { InstanceRow, VarRow } from "./exchange";

export const DEMO_INSTANCE_ID = "demo-exchange-0007";
export const DEMO_TASK_ID = 900007;

export const demoInstances: InstanceRow[] = [
  {
    id: DEMO_INSTANCE_ID,
    processKey: "exchange-recon",
    status: "Paused - pending approval",
    displayName: "HM Exchange - Crude settlement - Cargo 2207",
    startedAt: "2026-06-18T09:12:00Z",
  },
];

export const demoVariables: VarRow[] = [
  { name: "variance", value: "-1,420.50 bbl (-$98,236)", source: "deterministic" },
  { name: "confidence", value: "0.86", source: "agent" },
  {
    name: "proposal",
    value:
      "Counterparty bills 1,420.5 bbl more than our lifting ticket. The gap matches " +
      "a temperature-basis mismatch on cargo 2207: their B/L volume is quoted at 60F, " +
      "ours at observed temperature. Recommend posting a +1,420.5 bbl temperature " +
      "correction so both statements align; net settlement then resolves to $98,236 " +
      "in our favour.",
    source: "agent",
  },
  { name: "statementRefiner", value: "LT-2207 | 412,580.0 bbl @ observed temp", source: "deterministic" },
  { name: "statementCounterparty", value: "CP-9931 | 414,000.5 bbl @ 60F", source: "deterministic" },
  { name: "toleranceBbl", value: "250", source: "deterministic" },
];

export const demoTask: Record<string, unknown> = {
  id: DEMO_TASK_ID,
  status: "Pending",
  title: "Approve variance correction - Cargo 2207",
};
