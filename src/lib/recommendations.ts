import { estimateAffordability, pickBestMortgageProduct } from "./finance";
import type { ApartmentTransaction, BuyerPreferences, MortgageProduct, Recommendation } from "./types";

function conditionScore(transaction: ApartmentTransaction, preferences: BuyerPreferences) {
  let score = 0;
  if (transaction.rooms >= preferences.minRooms) score += 12;
  if (!preferences.nearStation || transaction.nearStation) score += 12;
  if (preferences.minAreaM2 && transaction.areaM2 >= preferences.minAreaM2) score += 4;
  if (preferences.maxAreaM2 && transaction.areaM2 <= preferences.maxAreaM2) score += 4;
  return score;
}

function buildReasons(transaction: ApartmentTransaction, recommendation: Omit<Recommendation, "reasons">, preferences: BuyerPreferences) {
  const reasons: string[] = [];
  if (recommendation.affordable) {
    reasons.push("월 이자 한도 안에 들어옵니다.");
  } else {
    reasons.push("월 이자 한도를 초과해 후순위로 정렬했습니다.");
  }
  if (recommendation.cashShortfall === 0) {
    reasons.push("보유 현금과 예상 대출로 매입가를 충당할 수 있습니다.");
  } else {
    reasons.push(`추가 현금 약 ${Math.ceil(recommendation.cashShortfall / 10000).toLocaleString("ko-KR")}만원이 필요합니다.`);
  }
  if (transaction.rooms >= preferences.minRooms) {
    reasons.push(`방 ${transaction.rooms}개로 희망 조건을 만족합니다.`);
  }
  if (preferences.nearStation && transaction.nearStation) {
    reasons.push(`역까지 약 ${transaction.stationDistanceMinutes ?? "10"}분 거리입니다.`);
  }
  return reasons;
}

export function rankRecommendations(
  transactions: ApartmentTransaction[],
  mortgageProducts: MortgageProduct[],
  preferences: BuyerPreferences
): Recommendation[] {
  if (transactions.length === 0 || mortgageProducts.length === 0) {
    return [];
  }

  const product = pickBestMortgageProduct(mortgageProducts);

  return transactions
    .map((transaction) => {
      const { estimatedLoanAmount, estimatedMonthlyInterest, cashShortfall } = estimateAffordability(
        transaction,
        product,
        preferences.cashOnHand
      );
      const affordable = estimatedMonthlyInterest <= preferences.maxMonthlyInterest && cashShortfall === 0;
      const interestHeadroom = Math.max(preferences.maxMonthlyInterest - estimatedMonthlyInterest, 0);
      const affordabilityScore = affordable ? 60 + Math.min(20, interestHeadroom / 100000) : Math.max(0, 35 - estimatedMonthlyInterest / 100000);
      const cashScore = cashShortfall === 0 ? 12 : Math.max(0, 12 - cashShortfall / 10000000);
      const priceScore = preferences.maxPrice ? Math.max(0, 10 - Math.max(transaction.tradePrice - preferences.maxPrice, 0) / 10000000) : 6;
      const baseRecommendation = {
        transaction,
        mortgageProduct: product,
        score: Math.round(affordabilityScore + cashScore + conditionScore(transaction, preferences) + priceScore),
        estimatedLoanAmount,
        estimatedMonthlyInterest,
        cashShortfall,
        affordable
      };
      return {
        ...baseRecommendation,
        reasons: buildReasons(transaction, baseRecommendation, preferences)
      };
    })
    .sort((a, b) => Number(b.affordable) - Number(a.affordable) || b.score - a.score || a.estimatedMonthlyInterest - b.estimatedMonthlyInterest);
}
