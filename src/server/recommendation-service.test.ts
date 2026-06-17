import { describe, expect, it } from "vitest";
import { FinlifeMortgageProductProvider, MockMortgageProductProvider, MockTransactionPriceProvider, MolitApartmentTradeProvider } from "@/lib/providers";
import { createRecommendationProviders } from "./recommendation-service";

describe("createRecommendationProviders", () => {
  it("uses mock providers by default", () => {
    const providers = createRecommendationProviders({});

    expect(providers.transactionProvider).toBeInstanceOf(MockTransactionPriceProvider);
    expect(providers.mortgageProvider).toBeInstanceOf(MockMortgageProductProvider);
  });

  it("uses real providers when flags and keys are present", () => {
    const providers = createRecommendationProviders({
      USE_REAL_ESTATE_API: "true",
      USE_REAL_MORTGAGE_API: "true",
      MOLIT_API_KEY: "molit-key",
      FINLIFE_API_KEY: "finlife-key"
    });

    expect(providers.transactionProvider).toBeInstanceOf(MolitApartmentTradeProvider);
    expect(providers.mortgageProvider).toBeInstanceOf(FinlifeMortgageProductProvider);
  });

  it("throws when real mode is enabled without keys", () => {
    expect(() => createRecommendationProviders({ USE_REAL_ESTATE_API: "true" })).toThrow("MOLIT_API_KEY");
    expect(() => createRecommendationProviders({ USE_REAL_MORTGAGE_API: "true" })).toThrow("FINLIFE_API_KEY");
  });
});
