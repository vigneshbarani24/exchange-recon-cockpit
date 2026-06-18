import { describe, it, expect } from "vitest";
import { fmt, timeOpen } from "./format";

describe("fmt", () => {
  it("renders null/undefined as empty string", () => {
    expect(fmt(null)).toBe("");
    expect(fmt(undefined)).toBe("");
  });
  it("stringifies objects", () => {
    expect(fmt({ a: 1 })).toBe('{"a":1}');
  });
  it("passes through primitives", () => {
    expect(fmt("x")).toBe("x");
    expect(fmt(42)).toBe("42");
  });
});

describe("timeOpen", () => {
  const base = new Date("2026-06-18T12:00:00Z").getTime();
  const ago = (ms: number) => new Date(base - ms).toISOString();

  it("returns a dash for an unparseable date", () => {
    expect(timeOpen("not-a-date", base)).toBe("—");
  });
  it("shows 'just now' under a minute", () => {
    expect(timeOpen(ago(30_000), base)).toBe("just now");
  });
  it("shows minutes under an hour", () => {
    expect(timeOpen(ago(45 * 60_000), base)).toBe("45m");
  });
  it("shows hours and minutes under a day", () => {
    expect(timeOpen(ago(3 * 3_600_000 + 48 * 60_000), base)).toBe("3h 48m");
  });
  it("shows days and hours past a day", () => {
    expect(timeOpen(ago(2 * 86_400_000 + 5 * 3_600_000), base)).toBe("2d 5h");
  });
});
