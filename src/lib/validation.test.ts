import { describe, expect, it } from "vitest";
import { buyerPreferencesSchema } from "./validation";

describe("buyerPreferencesSchema", () => {
  it("accepts a valid search request", () => {
    const result = buyerPreferencesSchema.parse({
      region: "서울",
      cashOnHand: 300000000,
      maxMonthlyInterest: 1500000,
      minRooms: 3,
      nearStation: true,
      minAreaPyeong: 18,
      maxAreaPyeong: "",
      maxPrice: 1000000000
    });

    expect(result.region).toBe("서울");
    expect(result.minAreaM2).toBeCloseTo(59.5, 1);
    expect(result.maxAreaM2).toBeUndefined();
  });

  it("rejects missing region and negative cash", () => {
    const result = buyerPreferencesSchema.safeParse({
      region: "",
      cashOnHand: -1,
      maxMonthlyInterest: 1500000,
      minRooms: 3,
      nearStation: true
    });

    expect(result.success).toBe(false);
  });

  it("rejects excessive monthly interest", () => {
    const result = buyerPreferencesSchema.safeParse({
      region: "서울",
      cashOnHand: 300000000,
      maxMonthlyInterest: 30000000,
      minRooms: 3,
      nearStation: true
    });

    expect(result.success).toBe(false);
  });
});
