import { describe, it, expect } from "vitest";
import { calcCbm, calcVolumetricKg, calcShippingFen } from "../src/lib/calculators";

describe("calcCbm", () => {
  it("60×40×50cm ×20박스 = 2.4 CBM", () => {
    expect(calcCbm(60, 40, 50, 20)).toBeCloseTo(2.4, 6);
  });
});
describe("calcVolumetricKg", () => {
  it("60×40×50cm = 20kg (÷6000)", () => {
    expect(calcVolumetricKg(60, 40, 50)).toBeCloseTo(20, 6);
  });
});
describe("calcShippingFen — rates.ts 요율", () => {
  it("해운 13.334kg → 14kg 올림 → ¥90", () => {
    expect(calcShippingFen("SEA", 13334)).toBe(9000);
  });
  it("항공 1250g → ¥55.9", () => {
    expect(calcShippingFen("AIR", 1250)).toBe(5590);
  });
});
