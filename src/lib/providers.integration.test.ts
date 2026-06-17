import { describe, expect, it } from "vitest";
import { FinlifeMortgageProductProvider, MolitApartmentTradeProvider } from "./providers";

const runAllIntegration = process.env.REAL_API_INTEGRATION_TESTS === "true";
const runMolitIntegration = runAllIntegration || process.env.MOLIT_INTEGRATION_TESTS === "true";
const runFinlifeIntegration = runAllIntegration || process.env.FINLIFE_INTEGRATION_TESTS === "true";

describe("real API providers", () => {
  (runMolitIntegration ? it : it.skip)("calls MOLIT apartment trade API with MOLIT_API_KEY", async () => {
    expect(process.env.MOLIT_API_KEY, "MOLIT_API_KEY is required").toBeTruthy();
    const provider = new MolitApartmentTradeProvider(process.env.MOLIT_API_KEY as string);
    const result = await provider.findTransactions({
      region: "마포구",
      cashOnHand: 350000000,
      maxMonthlyInterest: 1600000,
      minRooms: 2,
      nearStation: false
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].tradePrice).toBeGreaterThan(0);
  }, 30000);

  (runFinlifeIntegration ? it : it.skip)("calls Finlife mortgage API with FINLIFE_API_KEY", async () => {
    expect(process.env.FINLIFE_API_KEY, "FINLIFE_API_KEY is required").toBeTruthy();
    const provider = new FinlifeMortgageProductProvider(process.env.FINLIFE_API_KEY as string);
    const result = await provider.findMortgageProducts();

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].minRate).toBeGreaterThan(0);
  }, 30000);
});
