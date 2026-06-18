import { describe, it, expect } from "vitest";
import { needsAttention, type InstanceRow } from "./exchange";

const row = (status: string): InstanceRow => ({
  id: "i",
  processKey: "p",
  status,
  displayName: "d",
  startedAt: "",
});

describe("needsAttention", () => {
  it("flags instances that need a human", () => {
    for (const s of ["Faulted", "Paused", "Pending approval", "Running"]) {
      expect(needsAttention(row(s))).toBe(true);
    }
  });
  it("ignores resolved or unknown-but-quiet states", () => {
    for (const s of ["Completed", "Succeeded", ""]) {
      expect(needsAttention(row(s))).toBe(false);
    }
  });
  it("is case-insensitive", () => {
    expect(needsAttention(row("FAULTED"))).toBe(true);
  });
});
