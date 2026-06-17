import { describe, expect, it } from "vitest";
import { calculateCashShortfall, calculateLoanAmount, calculateMonthlyInterest, pickBestMortgageProduct } from "./finance";
import type { MortgageProduct } from "./types";

describe("finance helpers", () => {
  it("caps the loan amount by LTV", () => {
    expect(calculateLoanAmount(1000000000, 100000000, 0.7)).toBe(700000000);
  });

  it("calculates monthly interest from annual rate", () => {
    expect(calculateMonthlyInterest(600000000, 3.6)).toBe(1800000);
  });

  it("detects cash shortfall", () => {
    expect(calculateCashShortfall(1000000000, 200000000, 700000000)).toBe(100000000);
  });

  it("picks the lowest rate product", () => {
    const products: MortgageProduct[] = [
      { id: "b", bankName: "B", productName: "B", minRate: 4.1, maxRate: 5, rateType: "fixed", maxLtv: 0.7 },
      { id: "a", bankName: "A", productName: "A", minRate: 3.7, maxRate: 5, rateType: "mixed", maxLtv: 0.65 }
    ];

    expect(pickBestMortgageProduct(products).id).toBe("a");
  });
});
