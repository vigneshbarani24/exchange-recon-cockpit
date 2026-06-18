import { describe, it, expect } from "vitest";
import { unwrap } from "./sdk";

describe("unwrap", () => {
  it("passes through a bare array", () => {
    expect(unwrap<number>([1, 2, 3])).toEqual([1, 2, 3]);
  });
  it("unwraps a paginated { items } envelope", () => {
    expect(unwrap<number>({ items: [1, 2] })).toEqual([1, 2]);
  });
  it("returns [] for an envelope with no items", () => {
    expect(unwrap({ items: undefined })).toEqual([]);
    expect(unwrap({})).toEqual([]);
  });
  it("returns [] for null or non-collection input", () => {
    expect(unwrap(null)).toEqual([]);
    expect(unwrap("nope")).toEqual([]);
    expect(unwrap(undefined)).toEqual([]);
  });
});
