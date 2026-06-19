// DEMO-ONLY cached fallback. Lives on the vb/demo/safe-mode branch and is NEVER
// merged to main. Used only when VITE_DEMO_FALLBACK is on AND a live tenant call
// fails or returns empty, so a recording never dies mid-take (auth blip, empty
// queue, slow poll). The real tenant is always tried first; this is the net, not
// a substitute for real data.
import type { InstanceRow, VarRow } from "./exchange";

export const DEMO_INSTANCE_ID = "demo-exchange-0007";
export const DEMO_TASK_ID = 900007;

// Opened a few hours ago so "Time open" renders a realistic duration on camera.
const hoursAgo = (h: number): string => new Date(Date.now() - h * 3_600_000).toISOString();

export const demoInstances: InstanceRow[] = [
  {
    id: DEMO_INSTANCE_ID,
    processKey: "exchange-recon",
    status: "Paused - pending approval",
    displayName: "HM Exchange - Crude settlement - Cargo 2207",
    startedAt: hoursAgo(3.8),
  },
];

export const demoVariables: VarRow[] = [
  { name: "variance", value: "-1,420.50 bbl (-$98,236)", source: "deterministic" },
  { name: "variance_category", value: "temperature-basis", source: "agent" },
  { name: "confidence", value: "0.95", source: "agent" },
  {
    name: "proposal",
    value:
      "Counterparty bills 1,420.5 bbl more than our position report. The gap is a " +
      "temperature-basis mismatch on exchange contract EX-118: their B/L volume is " +
      "quoted at 60F, ours at observed temperature. Recommend aligning both to 60F " +
      "(a +1,420.5 bbl correction); net settlement then resolves to $98,236 in our " +
      "favour. Submitted for human approval before posting.",
    source: "agent",
  },
  { name: "positionReport", value: "LT-2207 | 412,580.0 bbl @ observed temp", source: "deterministic" },
  { name: "counterpartyStatement", value: "CP-9931 | 414,000.5 bbl @ 60F", source: "deterministic" },
  { name: "toleranceBbl", value: "250", source: "deterministic" },
];

export const demoTask: Record<string, unknown> = {
  id: DEMO_TASK_ID,
  status: "Pending",
  title: "Approve variance correction - Cargo 2207",
};
