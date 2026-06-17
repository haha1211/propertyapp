import { buyerPreferencesSchema } from "@/lib/validation";
import { rankRecommendations } from "@/lib/recommendations";
import {
  FinlifeMortgageProductProvider,
  MockMortgageProductProvider,
  MockTransactionPriceProvider,
  MolitApartmentTradeProvider,
  type MortgageProductProvider,
  type TransactionPriceProvider
} from "@/lib/providers";
import { ProviderError } from "@/lib/provider-errors";
import type { BuyerPreferences } from "@/lib/types";

type EnvLike = Record<string, string | undefined>;

export function createRecommendationProviders(env: EnvLike = process.env): {
  transactionProvider: TransactionPriceProvider;
  mortgageProvider: MortgageProductProvider;
} {
  const useRealEstateApi = env.USE_REAL_ESTATE_API === "true";
  const useRealMortgageApi = env.USE_REAL_MORTGAGE_API === "true";

  if (useRealEstateApi && !env.MOLIT_API_KEY) {
    throw new ProviderError("MOLIT", "CONFIGURATION", "MOLIT_API_KEY가 설정되어 있지 않습니다.");
  }
  if (useRealMortgageApi && !env.FINLIFE_API_KEY) {
    throw new ProviderError("FINLIFE", "CONFIGURATION", "FINLIFE_API_KEY가 설정되어 있지 않습니다.");
  }

  return {
    transactionProvider: useRealEstateApi ? new MolitApartmentTradeProvider(env.MOLIT_API_KEY as string) : new MockTransactionPriceProvider(),
    mortgageProvider: useRealMortgageApi ? new FinlifeMortgageProductProvider(env.FINLIFE_API_KEY as string) : new MockMortgageProductProvider()
  };
}

export async function getRecommendations(input: unknown, env: EnvLike = process.env) {
  const preferences: BuyerPreferences = buyerPreferencesSchema.parse(input);
  const { transactionProvider, mortgageProvider } = createRecommendationProviders(env);
  const [transactions, mortgageProducts] = await Promise.all([
    transactionProvider.findTransactions(preferences),
    mortgageProvider.findMortgageProducts()
  ]);

  return rankRecommendations(transactions, mortgageProducts, preferences);
}
