import { describe, expect, it } from "vitest";
import { FinlifeMortgageProductProvider, MolitApartmentTradeProvider } from "./providers";

const runIntegration = process.env.RUN_INTEGRATION_TESTS === "true";
const maybeIt = runIntegration ? it : it.skip;

describe("real API providers", () => {
  maybeIt("calls MOLIT apartment trade API with MOLIT_API_KEY", async () => {
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

  maybeIt("calls Finlife mortgage API with FINLIFE_API_KEY", async () => {
    expect(process.env.FINLIFE_API_KEY, "FINLIFE_API_KEY is required").toBeTruthy();
    const provider = new FinlifeMortgageProductProvider(process.env.FINLIFE_API_KEY as string);
    const result = await provider.findMortgageProducts();

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].minRate).toBeGreaterThan(0);
  }, 30000);
});
