import { buyerPreferencesSchema } from "@/lib/validation";
import { rankRecommendations } from "@/lib/recommendations";
import { MockMortgageProductProvider, MockTransactionPriceProvider } from "@/lib/providers";
import type { BuyerPreferences } from "@/lib/types";

export async function getRecommendations(input: unknown) {
  const preferences: BuyerPreferences = buyerPreferencesSchema.parse(input);
  const transactionProvider = new MockTransactionPriceProvider();
  const mortgageProvider = new MockMortgageProductProvider();
  const [transactions, mortgageProducts] = await Promise.all([
    transactionProvider.findTransactions(preferences),
    mortgageProvider.findMortgageProducts()
  ]);

  return rankRecommendations(transactions, mortgageProducts, preferences);
}
