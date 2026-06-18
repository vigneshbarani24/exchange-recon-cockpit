// Small, dependency-free formatting helpers (no config import → trivially testable).

export function fmt(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

/** How long an instance has been open — the productivity signal: minutes, not hours. */
export function timeOpen(startedAt: string, now: number = Date.now()): string {
  const start = new Date(startedAt).getTime();
  if (!Number.isFinite(start)) return "—";
  const mins = Math.floor((now - start) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h`;
}
